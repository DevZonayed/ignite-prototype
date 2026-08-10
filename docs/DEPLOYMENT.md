# Deploying the IGNITE API

Target: Dokploy at `https://dokploy.jonayed.me`, subdomain `ignite-api.jonayed.me`,
so the apps' base URL is `https://ignite-api.jonayed.me/api`.

Everything below was verified locally against Postgres 16 in Docker — the image
builds, migrations apply to an empty database at boot, and the health endpoint
answers. The one step nobody can do without your Dokploy credentials is the
deploy itself.

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

1. In Dokploy, create a **Postgres** service and note its internal host, port,
   database, user, password.
2. Create an **Application** from this repo, build type **Dockerfile**, build
   context `apps/server`, Dockerfile path `apps/server/Dockerfile`.
3. Set every variable from the table above.
4. Add the domain `ignite-api.jonayed.me`, container port `4000`, HTTPS on with
   Let's Encrypt.
5. Deploy, then **verify against the live URL** — a green dashboard is not proof:

   ```bash
   curl -i https://ignite-api.jonayed.me/api/monitoring/health
   # expect 200 and {"data":{"status":"ok","database":true,...}}

   curl -s https://ignite-api.jonayed.me/api/auth/bootstrap-status
   # expect {"data":{"needsBootstrap":true}} on a fresh database
   ```

6. Open the admin portal against the new API and complete the first-run screen
   to create the initial platform administrator.

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
