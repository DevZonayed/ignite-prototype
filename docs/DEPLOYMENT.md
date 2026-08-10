# Deploying IGNITE

**Live.** Dokploy at `https://dokploy.nexalance.cloud`, project **IGNITE**,
environment **production**, on VPS `72.60.103.57`.

| Service | Type | URL |
|---|---|---|
| `ignite-postgres` | Postgres 16 | internal only, host `ignite-postgres-fbb453-quiqfc:5432` |
| `ignite-api` | Dockerfile `apps/server` | https://api-ignite.nexarift.com/api |
| `ignite-admin-portal` | Dockerfile `apps/admin-portal` | https://admin-ignite.nexarift.com |
| `ignite-school-portal` | Dockerfile `apps/school-portal` | https://school-ignite.nexarift.com |

`ignite-web` (the static `design/` prototype) predates this and is untouched.

## Two things that will bite you

**Pick the right certificate resolver.** This Traefik defines two. The default
`letsencrypt` uses a **DNS-01 challenge through Cloudflare**, so it only works
for domains in that Cloudflare account — it silently never issues for anything
else, and Traefik keeps serving `CN=TRAEFIK DEFAULT CERT`. `letsencrypt-http`
uses HTTP-01 and works for any hostname that resolves to the VPS. The
`*.nexarift.com` names are on Cloudflare, so they use the default resolver.

**The portals read their API URL at runtime, not at build time.** Each portal
image writes `/runtime-config.js` from `$API_BASE_URL` on container start (see
`docker-entrypoint.d/10-runtime-config.sh`). Changing which API a portal talks
to is an env change plus a restart, not a rebuild. Vite would otherwise inline
the value into the hashed bundle.

---

## What runs

`apps/server/Dockerfile` is a two-stage build:

- **builder** — `node:20-alpine` plus `python3 make g++`, because `bcrypt` falls
  back to `node-gyp` when no prebuilt binary matches. Runs `npm ci`,
  `npm run build`, then `npm prune --omit=dev`.
- **runtime** — clean `node:20-alpine`, `dumb-init` as PID 1 so `docker stop` is
  a clean shutdown, runs as the unprivileged `node` user, `HEALTHCHECK` against
  `/api/monitoring/health` (which is `@Public()`).

Schema is owned by migrations. `migrationsRun: true` in
`src/config/database.config.ts` applies anything pending at boot, and
`synchronize` is off for Postgres unconditionally.

## Environment variables

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `4000` | |
| `DB_TYPE` | `postgres` | **Required.** Defaults to sql.js otherwise |
| `DB_HOST` `DB_PORT` `DB_USERNAME` `DB_PASSWORD` `DB_DATABASE` | from Dokploy's Postgres | |
| `DB_SSL` | `true` if the provider terminates TLS | omit on a private network |
| `JWT_SECRET` | `openssl rand -base64 48` | **Never commit.** Rotating it signs every user out |
| `JWT_EXPIRATION` | `7d` | |
| `SEED_DEMO_DATA` | `false` | Empty database; the admin portal shows its first-run screen |
| `CORS_ORIGIN` | the real portal origins, comma-separated | defaults to `*` |
| `ADMIN_PORTAL_URL` / `SCHOOL_PORTAL_URL` | real portal URLs | used in invite emails |
| `SMTP_*`, `MAIL_FROM` | your SMTP provider | unset ⇒ OTPs log to console instead of sending |
| `AUTH_OTP_DEV_ECHO` | `false` | |

`SEED_DEFAULT_PASSWORD` only matters when `SEED_DEMO_DATA` is on. Leave the demo
seed off in a deployment and it is irrelevant.

## Deploy

Each app is its own Dokploy service, all built from this repo (`master`) with
build type **Dockerfile**:

| Service | Dockerfile path | Docker context | Port |
|---|---|---|---|
| `ignite-api` | `apps/server/Dockerfile` | `apps/server` | 4000 |
| `ignite-admin-portal` | `apps/admin-portal/Dockerfile` | `apps/admin-portal` | 80 |
| `ignite-school-portal` | `apps/school-portal/Dockerfile` | `apps/school-portal` | 80 |

Both paths are relative to the repo root — the context is not relative to the
Dockerfile.

1. Create a **Postgres** service; note its `appName`, which is its internal
   DNS host.
2. Create the three applications above, set their env, attach a domain
   (HTTPS on, resolver per the note at the top).
3. The portals need only `API_BASE_URL=https://api-ignite.nexarift.com/api`.
   The API needs the full table above.
4. Deploy, then **verify against the live URL** — a green dashboard is not proof:

   ```bash
   curl -s https://api-ignite.nexarift.com/api/monitoring/health
   # expect {"data":{"status":"ok","database":true,...}}

   curl -s https://api-ignite.nexarift.com/api/auth/bootstrap-status
   # expect {"data":{"needsBootstrap":true}} on a fresh database

   # CORS must echo ONE origin, never the comma-joined list
   curl -sI -X OPTIONS https://api-ignite.nexarift.com/api/auth/signin \
     -H 'Origin: https://admin-ignite.nexarift.com' \
     -H 'Access-Control-Request-Method: POST' | grep -i allow-origin
   ```

   After a portal deploy, confirm the live bundle is the one you built:

   ```bash
   curl -s https://admin-ignite.nexarift.com/ | grep -o 'index-[A-Za-z0-9_-]*\.css'
   curl -s https://admin-ignite.nexarift.com/runtime-config.js
   ```

5. Open the admin portal and complete the first-run screen to create the
   initial platform administrator. Sign-in is `POST /api/auth/signin` with
   `{ identifier, password, role }` — not `email`, and the role is required.

## Migrations

Applied automatically at boot. To gate a deploy on them instead, override the
container command with `npm run start:migrate`.

Generating a new one after changing entities — needs a running Postgres, because
TypeORM diffs the entities against a live schema:

```bash
cd apps/server
docker compose up -d db                       # IGNITE_DB_PORT=55433 if 5432 is taken
DB_HOST=127.0.0.1 DB_PORT=5432 DB_USERNAME=postgres DB_PASSWORD=postgres DB_DATABASE=ignite \
  npm run migration:generate -- src/database/migrations/DescriptiveName
```

Then run it again and confirm it reports **"No changes in database schema were
found"**. That is the check that entities and migrations agree; a migration that
still finds changes means the first one was incomplete.

`migration:run`, `migration:revert`, `migration:show` take the same env vars.

## Local verification

```bash
cd apps/server
IGNITE_DB_PORT=55433 docker compose up -d --build
curl -s http://127.0.0.1:4000/api/monitoring/health
```

`IGNITE_DB_PORT` exists because a Postgres installed on the host binds
`127.0.0.1:5432` and silently shadows the container — connections land on the
host server and fail with `28000 role "postgres" does not exist`.

## Known environment traps on this machine

- The repo path contains a curly apostrophe (U+2019 in `MD's Mac mini`). It
  breaks the `@nestjs/swagger` CLI plugin, which stays disabled in
  `nest-cli.json`, and Metro's `X-React-Native-Project-Root` header. Neither
  affects the container, whose workdir is `/app`.
- `~/.docker/config.json` named `credsStore: desktop` while Docker Desktop was
  uninstalled, so every image pull failed with
  `docker-credential-desktop: executable file not found`. The key was removed
  (backup: `~/.docker/config.json.bak-*`); `auths` was empty, so nothing was lost.

## Driving Dokploy without an API key

Dokploy's UI talks to a tRPC endpoint that accepts the browser session cookie,
so anything the dashboard can do can be scripted from a logged-in tab:

```js
// GET  /api/trpc/<router>.<query>?input={"json":{...}}
// POST /api/trpc/<router>.<mutation>   body {"json":{...}}
await fetch('/api/trpc/application.deploy', {
  method: 'POST', credentials: 'include',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ json: { applicationId: '...' } }),
})
```

Procedures used here: `project.one`, `postgres.create`, `postgres.deploy`,
`application.create`, `application.saveGitProvider`, `application.saveBuildType`,
`application.saveEnvironment`, `domain.generateDomain`, `domain.create`,
`domain.update`, `application.deploy`, `deployment.all`.

Two traps: the request must be issued **from the Dokploy origin** (firing it
while the tab sits on a portal silently 404s against the portal instead), and
unknown fields fail closed — `saveEnvironment` needs `createEnvFile`, and
`generateDomain` wants `serverId: ''` rather than `null`.
