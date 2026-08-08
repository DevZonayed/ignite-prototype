# Teacher App Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy `apps/server` to Dokploy on Postgres with explicit migrations, then wire `apps/teacher-app` to it with a real JWT auth flow and live data on the core teaching-loop screens.

**Architecture:** The server gets Postgres-compatible column types, a TypeORM `DataSource` for CLI migrations, and a multi-stage Dockerfile; it deploys to `ignite-api.jonayed.me` with migrations run before boot. The app gets a three-layer data stack — a thin `fetch` client that unwraps the server's response envelope and raises typed `ApiError`s, a grouped endpoint map so no screen builds a URL, and TanStack Query for caching/retry with an AsyncStorage persister. Auth lives in an `AuthContext` backed by `expo-secure-store`; a selected class lives in a `ClassContext`. Screens consume hooks, never `fetch`.

**Tech Stack:** NestJS 10 + TypeORM 0.3.20 + Postgres 16 (server); Expo SDK 54 / React Native 0.81.5 / React 19.1.0, `@tanstack/react-query` v5, `expo-secure-store`, `expo-network`, `jest-expo` (app); Dokploy at `https://dokploy.jonayed.me`.

## Global Constraints

- **Deployment is Dokploy only.** `https://dokploy.jonayed.me`, via the `dokploy-deploy` skill. Never Vercel/Netlify/Fly/Render/Railway/Heroku/bare VPS.
- **Subdomain:** `ignite-api.jonayed.me` — single level only, HTTPS with Let's Encrypt. App base URL is `https://ignite-api.jonayed.me/api`.
- **Never claim a deploy succeeded without curling the live URL and seeing a real status code.**
- **No demo content.** Do not reintroduce demo people or lessons ("Amara Eze", "Smart Reading Lamp", "Mrs. Funke Okafor" as a hardcoded name, etc.). Empty screens on a fresh account are correct. See memory `ignite-teacher-app-demo-content-stripped`.
- **No secrets in git.** `JWT_SECRET` and `SEED_DEFAULT_PASSWORD` are Dokploy environment values only. `.env` is already gitignored by the root `**/.env` rule.
- **No hostname in any screen.** `src/config.js` is the only place a URL literal may appear.
- **Do not touch `apps/admin-portal` or `apps/school-portal`.** Their `vite.config.js` files contain a known malware C2 loader that executes on `npm run dev`/`build`. Never run npm scripts in those two directories. See memory `ignite-malware-in-vite-configs`.
- **Do not touch the root `Dockerfile`** — it serves the static `design/` prototype and is unrelated.
- **Out of scope, do not add:** app icon, splash image, `bundleIdentifier`, Android `package`, EAS config, store submission, file upload, AI features, full offline sync.

---

## File Structure

### Server (`apps/server/`)

| File | Responsibility |
|---|---|
| `src/database/entities/*.entity.ts` (15 files) | **Modify** — `type: 'datetime'` → `type: 'timestamp'` (21 columns) |
| `src/database/data-source.ts` | **Create** — standalone TypeORM `DataSource` for the migration CLI |
| `src/database/migrations/` | **Create** — generated migration files |
| `src/database/seeds/seed.service.ts` | **Modify** — read `SEED_DEFAULT_PASSWORD` instead of the literal `ignite123` |
| `src/config/database.config.ts` | **Modify** — `synchronize: false` always; add `migrationsRun` |
| `Dockerfile` | **Create** — multi-stage; builder has a toolchain for `bcrypt` |
| `.dockerignore` | **Create** |
| `.env.example` | **Modify** — document the new vars |
| `package.json` | **Modify** — fix the migration scripts, add `start:migrate` |

### App (`apps/teacher-app/`)

| File | Responsibility |
|---|---|
| `src/config.js` | **Create** — the single source of the API base URL |
| `src/api/client.js` | **Create** — `request()`, envelope unwrapping, `ApiError`, timeout |
| `src/api/endpoints.js` | **Create** — grouped call signatures; no screen builds a URL |
| `src/api/queryClient.js` | **Create** — `QueryClient` + AsyncStorage persister |
| `src/api/hooks.js` | **Create** — `useApiQuery` / `useApiMutation` wrappers |
| `src/auth/AuthContext.js` | **Create** — token storage, `signIn`/`signOut`, boot rehydration |
| `src/auth/tokenStore.js` | **Create** — thin `expo-secure-store` wrapper (mockable in tests) |
| `src/context/ClassContext.js` | **Create** — teacher's classes + persisted selection |
| `src/components/ScreenState.js` | **Create** — `<Loading/>`, `<ErrorState/>`, `<NotAvailable/>` |
| `src/components/ErrorBoundary.js` | **Create** — app-root recoverable error screen |
| `src/components/OfflineBanner.js` | **Create** — `expo-network` connectivity strip |
| `src/App.jsx` | **Modify** — providers, `status`-driven gate, boundary, banner |
| `src/screens/SignInScreen.js` | **Modify** — real auth, remember-me control |
| `src/screens/*.js` (core loop) | **Modify** — consume hooks |
| `src/data.js` | **Delete** at the end — nothing should import it |
| `jest.config.js`, `jest.setup.js` | **Create** — test harness |
| `.env.example` | **Create** |

---

## Task Order and Why

Tasks 1–5 are server-side and must finish before the app can talk to anything real. Task 5 (deploy) is the hard gate: **no app task may be verified against a mock.** Tasks 6–10 build the data layer bottom-up. Tasks 11–16 wire screens. Task 17 hardens.

---

### Task 1: Make entity column types Postgres-compatible

`@Column({ type: 'datetime' })` is a SQLite type. `PostgresDriver.supportedDataTypes` (71 entries in typeorm@0.3.20) does not contain `datetime`, and `normalizeType()` has no mapping for it, so the type falls through unchanged and TypeORM throws `DataTypeNotSupportedError` at schema build. `timestamp` is supported and is also valid under `sqljs`, so local development is unaffected. (`simple-json` looks unsupported by the same check but *is* handled explicitly inside `normalizeType()` — leave it alone.)

**Files:**
- Modify (21 occurrences across 15 files):
  - `src/database/entities/user.entity.ts` (5: lines 79, 88, 94, 97, 100)
  - `src/database/entities/lesson-session.entity.ts` (2: lines 29, 35)
  - `src/database/entities/homework-submission.entity.ts` (2)
  - `src/database/entities/announcement.entity.ts` (1)
  - `src/database/entities/assessment.entity.ts` (1)
  - `src/database/entities/attendance.entity.ts` (1)
  - `src/database/entities/audit-log.entity.ts` (1)
  - `src/database/entities/badge-award.entity.ts` (1)
  - `src/database/entities/curriculum-version.entity.ts` (1)
  - `src/database/entities/homework.entity.ts` (1)
  - `src/database/entities/lqs-score.entity.ts` (1)
  - `src/database/entities/media-library.entity.ts` (1)
  - `src/database/entities/progress-report.entity.ts` (1)
  - `src/database/entities/school.entity.ts` (1)
  - `src/database/entities/sync-queue.entity.ts` (1)

**Interfaces:**
- Consumes: nothing.
- Produces: entity definitions that TypeORM can build a Postgres schema from. Task 3 generates a migration from them; if this task is skipped, Task 3 fails.

- [ ] **Step 1: Record the exact starting count so the change is provable**

```bash
cd apps/server
grep -rc "type: 'datetime'" src/database/entities/*.ts | grep -v ':0$'
grep -ro "type: 'datetime'" src/database/entities/ | wc -l   # expect 21
```

- [ ] **Step 2: Replace every occurrence**

```bash
cd apps/server
grep -rl "type: 'datetime'" src/database/entities/ \
  | xargs sed -i "s/type: 'datetime'/type: 'timestamp'/g"
```

- [ ] **Step 3: Verify none remain and the count moved to `timestamp`**

```bash
cd apps/server
grep -ro "type: 'datetime'" src/database/entities/ | wc -l    # expect 0
grep -ro "type: 'timestamp'" src/database/entities/ | wc -l   # expect 21
```
Expected: `0` then `21`. If the second number is not 21, a file was missed — re-run Step 1's per-file listing and compare.

- [ ] **Step 4: Prove the app still compiles and still boots on sqljs**

```bash
cd apps/server
npm run build
rm -f ./ignite.sqlite
timeout 90 npm run start:prod 2>&1 | tee /tmp/boot.log &
sleep 45
curl -sS -o /dev/null -w 'health=%{http_code}\n' http://localhost:4000/api/monitoring/health
grep -c "Seeding database" /tmp/boot.log
kill %1 2>/dev/null
```
Expected: `health=200` and at least one "Seeding database" line. A `DataTypeNotSupportedError` here means a replacement was wrong.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/database/entities
git commit -m "fix(server): use Postgres-compatible timestamp column type

TypeORM's Postgres driver does not support the SQLite 'datetime' type;
21 columns across 15 entities would throw DataTypeNotSupportedError at
schema build. 'timestamp' is valid on both Postgres and sqljs."
```

---

### Task 2: Add a TypeORM DataSource, fix the migration scripts, and de-hardcode the seed password

`package.json` already references `src/database/data-source.ts` from three scripts, and the file does not exist — so `migration:generate`, `migration:run` and `seed` all fail today. `seed` additionally points at `src/database/seeds/run-seed.ts`, which also does not exist. The `DataSource` must read the same environment variables as `database.config.ts` so the CLI and the running app never disagree about which database they are pointed at.

**Files:**
- Create: `apps/server/src/database/data-source.ts`
- Modify: `apps/server/package.json` (scripts block, lines 16–19)
- Modify: `apps/server/src/config/database.config.ts`
- Modify: `apps/server/.env.example`

**Interfaces:**
- Consumes: the entity definitions from Task 1.
- Produces:
  - `apps/server/src/database/data-source.ts` default-exports `AppDataSource: DataSource`, configured for Postgres, `synchronize: false`, `migrations: ['src/database/migrations/*.ts']`.
  - `npm run migration:generate -- src/database/migrations/<Name>` and `npm run migration:run` both work.
  - `getDatabaseConfig()` keeps its existing signature `(configService: ConfigService) => TypeOrmModuleOptions` but never sets `synchronize: true` for Postgres.
  - `SeedService.seed()` reads `process.env.SEED_DEFAULT_PASSWORD` and throws if it is unset on an empty database. Task 5 supplies this as a Dokploy secret; Task 12 signs in with it.

- [ ] **Step 1: Create the DataSource**

Create `apps/server/src/database/data-source.ts`:

```ts
import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'path';

config();

/**
 * Standalone DataSource for the TypeORM CLI (migration:generate / migration:run).
 * Reads the same environment variables as src/config/database.config.ts so the
 * CLI and the running application can never target different databases.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ignite',
  entities: [join(__dirname, 'entities', '*.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
```

- [ ] **Step 2: Add `dotenv` (the DataSource needs it outside Nest's ConfigModule)**

```bash
cd apps/server
npm install dotenv@^16.4.5
```

- [ ] **Step 3: Create the migrations directory with a `.gitkeep`**

```bash
mkdir -p apps/server/src/database/migrations
touch apps/server/src/database/migrations/.gitkeep
```

- [ ] **Step 4: Fix the scripts in `apps/server/package.json`**

Replace lines 16–19 with:

```json
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm -- migration:generate -d src/database/data-source.ts",
    "migration:run": "npm run typeorm -- migration:run -d src/database/data-source.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/database/data-source.ts",
    "migration:run:prod": "typeorm migration:run -d dist/database/data-source.js",
    "start:migrate": "npm run migration:run:prod && node dist/main"
```

The `seed` script is removed — `SeedService` already runs from `main.ts` at bootstrap and is idempotent, and `run-seed.ts` never existed. Removing a script that has never worked is better than leaving a trap.

- [ ] **Step 5: Stop `synchronize` from ever being true against Postgres**

In `apps/server/src/config/database.config.ts`, inside the `if (dbType === 'postgres')` branch, replace:

```ts
      synchronize: configService.get<string>('NODE_ENV') !== 'production',
```

with:

```ts
      // Schema is owned by migrations, never by synchronize. Running with
      // synchronize against a real database silently alters live columns.
      synchronize: false,
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
```

Leave the `sqljs` branch untouched — local development keeps `synchronize` so it needs no migration run.

- [ ] **Step 6: Document the new variables in `apps/server/.env.example`**

Append:

```
# Set to "postgres" to use PostgreSQL; anything else uses local sql.js
DB_TYPE=sqlite
DB_SSL=false

# Seed password for the initial accounts. REQUIRED in production —
# there is deliberately no default.
SEED_DEFAULT_PASSWORD=
```

- [ ] **Step 7: Remove the hardcoded seed password**

`src/database/seeds/seed.service.ts:86` reads `await bcrypt.hash('ignite123', 10)`. A literal password that ships to production is a credential leak in the source tree. Replace that line with:

```ts
    const seedPassword = process.env.SEED_DEFAULT_PASSWORD;
    if (!seedPassword) {
      throw new Error(
        'SEED_DEFAULT_PASSWORD is required to seed the database. ' +
          'Set it in the environment — there is deliberately no default.',
      );
    }
    const passwordHash = await bcrypt.hash(seedPassword, 10);
```

The throw is inside `seed()`, which already returns early when any user exists — so it only fires on a genuinely empty database, never on a normal restart. Failing loudly beats silently seeding accounts with a password that is public in git history.

- [ ] **Step 8: Confirm the literal is gone and the guard is reachable**

```bash
cd apps/server
grep -rn "ignite123" src/ | grep -v node_modules   # expect no output
grep -n "SEED_DEFAULT_PASSWORD" src/database/seeds/seed.service.ts
npm run build
rm -f ./ignite.sqlite
timeout 60 node dist/main 2>&1 | grep -m1 "SEED_DEFAULT_PASSWORD is required" \
  && echo "guard fires on empty DB without the env var: OK"
```
Expected: no `ignite123` anywhere, and the guard message appears. Then confirm the happy path:

```bash
cd apps/server
rm -f ./ignite.sqlite
SEED_DEFAULT_PASSWORD=localdev123 timeout 90 node dist/main 2>&1 | tee /tmp/seedok.log &
sleep 45
curl -sS -X POST http://localhost:4000/api/auth/signin -H 'Content-Type: application/json' \
  -d '{"identifier":"funke.okafor@ignite.edu.ng","password":"localdev123","role":"teacher"}' \
  -o /dev/null -w 'local signin=%{http_code}\n'
kill %1 2>/dev/null
```
Expected: `local signin=201`.

- [ ] **Step 9: Verify the CLI now resolves the DataSource**

```bash
cd apps/server
npm run build
npx ts-node -r tsconfig-paths/register -e "import ds from './src/database/data-source'; console.log(ds.options.type, ds.options.synchronize, Array.isArray(ds.options.entities));"
```
Expected: `postgres false true`. Before this task the same command fails with "Cannot find module".

- [ ] **Step 10: Commit**

```bash
git add apps/server/src/database/data-source.ts apps/server/src/database/migrations \
        apps/server/package.json apps/server/package-lock.json \
        apps/server/src/config/database.config.ts apps/server/.env.example \
        apps/server/src/database/seeds/seed.service.ts
git commit -m "feat(server): add TypeORM DataSource and working migration scripts

The migration:generate/run/seed scripts referenced a data-source.ts that
never existed. Adds it, drops the seed script that pointed at a missing
run-seed.ts, makes Postgres schema migration-owned rather than
synchronize-owned, and moves the seed password out of the source tree
into SEED_DEFAULT_PASSWORD."
```

---

### Task 3: Provision Postgres on Dokploy and generate the initial migration

There is no local Postgres and no Docker access on this machine (`docker info` is permission-denied, `/usr/lib/postgresql` does not exist). The migration must therefore be generated against the **real Dokploy Postgres**, reached over an external port. That is also the honest test: it proves the 34 entities build a schema on the actual target engine, not a local approximation.

**Files:**
- Create: `apps/server/src/database/migrations/<timestamp>-InitialSchema.ts` (generated, do not hand-write)

**Interfaces:**
- Consumes: `AppDataSource` from Task 2, entities from Task 1.
- Produces:
  - A Dokploy Postgres service named `ignite-db` with a known `databaseName`, `databaseUser`, `databasePassword`, and its `postgresId` recorded for Task 5.
  - One migration file whose `up()` creates all 34 tables.

- [ ] **Step 1: Source the Dokploy helpers and confirm connectivity**

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
dokploy project all --json | head -40
```
Expected: JSON, not an auth error. If it errors, re-run `dokploy auth --url "$DOKPLOY_URL" --token "$DOKPLOY_API_KEY"`.

- [ ] **Step 2: Create the project and capture the environment id**

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
dokploy project create --name "ignite-api" --json | tee /tmp/ignite-project.json
PROJECT_ID=$(jq -r '.project.projectId // .projectId' /tmp/ignite-project.json)
ENV_ID=$(jq -r '.environment.environmentId // .environments[0].environmentId' /tmp/ignite-project.json)
echo "PROJECT_ID=$PROJECT_ID ENV_ID=$ENV_ID" | tee /tmp/ignite-ids.env
```
Both ids must be non-empty and not `null`. If the project already exists, read the ids from `dokploy project all --json` instead of creating a second one.

- [ ] **Step 3: Create and deploy the Postgres service**

Generate a strong password rather than typing one; it is a secret and must not enter git or the plan.

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
DB_PASS=$(openssl rand -hex 24)
dokploy postgres create --name "ignite-db" --databaseName "ignite" \
  --databaseUser "ignite" --databasePassword "$DB_PASS" \
  --dockerImage "postgres:16-alpine" --environmentId "$ENV_ID" --json \
  | tee /tmp/ignite-db.json
PG_ID=$(jq -r '.postgresId' /tmp/ignite-db.json)
echo "PG_ID=$PG_ID" >> /tmp/ignite-ids.env
echo "DB_PASS=$DB_PASS" >> /tmp/ignite-ids.env
chmod 600 /tmp/ignite-ids.env
dokploy postgres deploy --postgresId "$PG_ID" --json
```

- [ ] **Step 4: Open an external port so the migration CLI can reach it**

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
dokploy postgres save-external-port --postgresId "$PG_ID" --externalPort 5433 --json
dokploy postgres reload --postgresId "$PG_ID" --json 2>/dev/null || \
  dokploy postgres deploy --postgresId "$PG_ID" --json
```

- [ ] **Step 5: Confirm the database actually accepts a connection before generating anything**

```bash
. /tmp/ignite-ids.env
DOK_HOST=$(echo "$DOKPLOY_URL" | sed -E 's#^https?://##; s#/.*##')
cd apps/server
DB_HOST="$DOK_HOST" DB_PORT=5433 DB_USERNAME=ignite DB_PASSWORD="$DB_PASS" DB_DATABASE=ignite \
npx ts-node -r tsconfig-paths/register -e "
import ds from './src/database/data-source';
ds.initialize().then(async () => {
  const r = await ds.query('select version()');
  console.log('CONNECTED:', r[0].version);
  await ds.destroy();
}).catch(e => { console.error('FAILED:', e.message); process.exit(1); });
"
```
Expected: a line starting `CONNECTED: PostgreSQL 16`. If it hangs or refuses, the external port has not propagated — re-run Step 4's deploy and wait 30s. Do not proceed on a failure.

- [ ] **Step 6: Generate the initial migration**

```bash
. /tmp/ignite-ids.env
DOK_HOST=$(echo "$DOKPLOY_URL" | sed -E 's#^https?://##; s#/.*##')
cd apps/server
DB_HOST="$DOK_HOST" DB_PORT=5433 DB_USERNAME=ignite DB_PASSWORD="$DB_PASS" DB_DATABASE=ignite \
  npm run migration:generate -- src/database/migrations/InitialSchema
ls -la src/database/migrations/
```
Expected: one new `<timestamp>-InitialSchema.ts`. A `DataTypeNotSupportedError` here means Task 1 was incomplete.

- [ ] **Step 7: Sanity-check the generated SQL before trusting it**

```bash
cd apps/server
F=$(ls src/database/migrations/*-InitialSchema.ts)
grep -c 'CREATE TABLE' "$F"          # expect 34
grep -c '"datetime"' "$F"            # expect 0
grep -o 'TIMESTAMP' "$F" | wc -l     # expect >= 21
```
If `CREATE TABLE` is not 34, an entity is not being picked up by the glob — check `entities` in `data-source.ts`.

- [ ] **Step 8: Run the migration against the live database**

```bash
. /tmp/ignite-ids.env
DOK_HOST=$(echo "$DOKPLOY_URL" | sed -E 's#^https?://##; s#/.*##')
cd apps/server
DB_HOST="$DOK_HOST" DB_PORT=5433 DB_USERNAME=ignite DB_PASSWORD="$DB_PASS" DB_DATABASE=ignite \
  npm run migration:run
```
Expected: `Migration InitialSchema... has been executed successfully.`

- [ ] **Step 9: Verify the tables exist — read them back, do not infer from the log**

```bash
. /tmp/ignite-ids.env
DOK_HOST=$(echo "$DOKPLOY_URL" | sed -E 's#^https?://##; s#/.*##')
cd apps/server
DB_HOST="$DOK_HOST" DB_PORT=5433 DB_USERNAME=ignite DB_PASSWORD="$DB_PASS" DB_DATABASE=ignite \
npx ts-node -r tsconfig-paths/register -e "
import ds from './src/database/data-source';
ds.initialize().then(async () => {
  const r = await ds.query(\"select count(*)::int c from information_schema.tables where table_schema='public'\");
  console.log('TABLES:', r[0].c);
  await ds.destroy();
});
"
```
Expected: `TABLES: 35` (34 entities + TypeORM's `migrations` table). Anything under 34 is a failure.

- [ ] **Step 10: Close the external port again**

Leaving Postgres publicly reachable is a standing risk. The port was only needed to author the migration; the deployed app reaches the database over `dokploy-network` by service name.

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
dokploy postgres save-external-port --postgresId "$PG_ID" --externalPort null --json \
  || dokploy postgres save-external-port --postgresId "$PG_ID" --json
dokploy postgres deploy --postgresId "$PG_ID" --json
```
If the CLI rejects an empty port, note it and leave the port open — but say so explicitly in the final report rather than staying silent.

- [ ] **Step 11: Commit the migration (and only the migration — never `/tmp/ignite-ids.env`)**

```bash
cd /home/orca/orca/projects/ignite-prototype
git add apps/server/src/database/migrations
git status --porcelain | grep -i 'ids.env' && echo "STOP: secret staged" && exit 1
git commit -m "feat(server): add initial Postgres schema migration

Generated from the 34 entities against the deployed Postgres 16 instance
and verified by reading information_schema back."
```

---

### Task 4: Multi-stage Dockerfile for the server

`bcrypt` is a native module: a slim runtime image has no compiler, so the install must happen in a builder stage that has one. The root `Dockerfile` is an nginx image for the static `design/` prototype and must not be touched.

**Files:**
- Create: `apps/server/Dockerfile`
- Create: `apps/server/.dockerignore`

**Interfaces:**
- Consumes: `npm run build` producing `dist/`, and `start:migrate` from Task 2.
- Produces: an image whose entrypoint runs migrations then boots, listening on `$PORT` (default 4000).

- [ ] **Step 1: Write `apps/server/.dockerignore`**

```
node_modules
dist
npm-debug.log
*.sqlite
.env
.git
```

- [ ] **Step 2: Write `apps/server/Dockerfile`**

```dockerfile
# ── builder ────────────────────────────────────────────────────────────
# bcrypt is a native module and needs a toolchain, which the runtime
# image deliberately does not have.
FROM node:22-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential python3 \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Prune to production dependencies, keeping the compiled bcrypt binding.
RUN npm prune --omit=dev

# ── runtime ────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

# Migrations run before the app boots. If they fail, the container exits
# rather than serving against a half-built schema.
CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js && node dist/main"]
```

- [ ] **Step 3: Verify the build context is self-sufficient**

Docker is not usable on this machine, so validate by inspection rather than pretending to build:

```bash
cd apps/server
for f in package.json package-lock.json tsconfig.json nest-cli.json; do
  test -f "$f" && echo "ok $f" || echo "MISSING $f"
done
test -d src && echo "ok src/"
node -e "const p=require('./package.json'); console.log('build:', p.scripts.build); console.log('typeorm dep:', p.dependencies.typeorm); console.log('pg dep:', p.dependencies.pg);"
```
Expected: every `ok`, `build: nest build`, and both deps present. `typeorm` and `pg` must be in `dependencies` (not `devDependencies`) or the runtime stage cannot run migrations.

- [ ] **Step 4: Confirm the compiled DataSource path the CMD depends on exists**

```bash
cd apps/server && npm run build && ls dist/database/data-source.js
```
Expected: the file listed. If it is absent, `tsconfig.json` is excluding it and the container's migration step would fail at runtime.

- [ ] **Step 5: Commit**

```bash
git add apps/server/Dockerfile apps/server/.dockerignore
git commit -m "feat(server): add multi-stage Dockerfile

Builder stage carries build-essential/python3 for the bcrypt native
module; runtime stage is slim and runs migrations before boot."
```

---

### Task 5: Deploy the server to Dokploy — the hard gate

**REQUIRED SKILL:** use `dokploy-deploy`. Deployment on this machine is always Dokploy at `https://dokploy.jonayed.me`. Do not propose or use any other platform.

Nothing in Tasks 6+ may be verified against a mock server, so this task must fully succeed first.

**Files:** none in the repo — but the working tree must be **pushed to `origin/master`**, because Dokploy builds from git.

**Interfaces:**
- Consumes: the Dockerfile (Task 4), the migration (Task 3), `PG_ID`/`ENV_ID`/`DB_PASS` from `/tmp/ignite-ids.env`.
- Produces: a live API at `https://ignite-api.jonayed.me/api`, and the `applicationId` recorded for later redeploys.

- [ ] **Step 1: Push the commits — Dokploy builds from the remote, not the working tree**

```bash
cd /home/orca/orca/projects/ignite-prototype
git log origin/master..HEAD --oneline
git push origin master
```
If unrelated dirty files from other apps block this, commit only the server + docs paths. **Never stage `apps/admin-portal` or `apps/school-portal`** — see Global Constraints.

- [ ] **Step 2: Create the application**

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
dokploy application create --name "ignite-api" --environmentId "$ENV_ID" --json \
  | tee /tmp/ignite-app.json
APP_ID=$(jq -r '.applicationId' /tmp/ignite-app.json)
echo "APP_ID=$APP_ID" >> /tmp/ignite-ids.env
```

- [ ] **Step 3: Point it at the repository**

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
dokploy application save-git-provider --applicationId "$APP_ID" \
  --customGitUrl "https://github.com/DevZonayed/ignite-prototype.git" \
  --customGitBranch "master" --json
```

- [ ] **Step 4: Set the build type with the monorepo context path**

The Dockerfile lives in `apps/server/`, not at the repo root, and its `COPY` paths are relative to that directory — so the build context must be `apps/server`, not `.`.

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
dokploy application save-build-type --applicationId "$APP_ID" \
  --buildType dockerfile \
  --dockerfile "apps/server/Dockerfile" \
  --dockerContextPath "apps/server" --json
```

- [ ] **Step 5: Set environment variables — secrets here, never in git**

`DB_HOST` is the Postgres **service name** on `dokploy-network`, not `localhost`. Read the actual service name from the service record rather than assuming it, because Dokploy appends a random suffix to `appName`.

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
DB_SERVICE=$(dokploy postgres one --postgresId "$PG_ID" --json | jq -r '.appName')
echo "DB_SERVICE=$DB_SERVICE"
JWT_SECRET=$(openssl rand -hex 32)
SEED_PASS=$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-16)
echo "SEED_PASS=$SEED_PASS" >> /tmp/ignite-ids.env

dokploy application save-environment --applicationId "$APP_ID" --env "$(printf \
'NODE_ENV=production
PORT=4000
DB_TYPE=postgres
DB_HOST=%s
DB_PORT=5432
DB_USERNAME=ignite
DB_PASSWORD=%s
DB_DATABASE=ignite
DB_SSL=false
JWT_SECRET=%s
JWT_EXPIRATION=7d
SEED_DEFAULT_PASSWORD=%s
CORS_ORIGIN=*' "$DB_SERVICE" "$DB_PASS" "$JWT_SECRET" "$SEED_PASS")" --json
```

Record `SEED_PASS` — it is the password for every seeded account and is needed in Task 12's sign-in verification. It exists only in `/tmp/ignite-ids.env` (mode 600) and in Dokploy. **Do not print it into the final report or any commit.**

- [ ] **Step 6: Attach the domain**

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
dokploy domain create --host "ignite-api.jonayed.me" --applicationId "$APP_ID" \
  --port 4000 --https --certificateType letsencrypt --domainType application --json
```
Single level only — `ignite-api.jonayed.me`, never `api.ignite.jonayed.me` (the wildcard cert covers one level and the second form fails TLS).

- [ ] **Step 7: Deploy**

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
dokploy application deploy --applicationId "$APP_ID" --json
```

- [ ] **Step 8: VERIFY against the live URL — a deploy is not successful without this**

```bash
. /tmp/ignite-ids.env
for i in $(seq 1 20); do
  CODE=$(curl -sS -o /tmp/health.json -w '%{http_code}' https://ignite-api.jonayed.me/api/monitoring/health || echo 000)
  echo "attempt $i: $CODE"
  [ "$CODE" = "200" ] && break
  sleep 15
done
cat /tmp/health.json; echo
curl -sS -o /dev/null -w 'docs=%{http_code}\n' https://ignite-api.jonayed.me/api/docs
```
Expected: `health` reaches `200` with a JSON body, and `docs=200`. On a persistent 502/503, read the logs before reporting anything:

```bash
source ~/.claude/skills/dokploy-deploy/scripts/dokploy-env.sh
. /tmp/ignite-ids.env
dokploy application read-logs --applicationId "$APP_ID" | tail -60
```

- [ ] **Step 9: Verify the seed ran against Postgres by signing in over the live API**

```bash
. /tmp/ignite-ids.env
curl -sS -X POST https://ignite-api.jonayed.me/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d "{\"identifier\":\"funke.okafor@ignite.edu.ng\",\"password\":\"$SEED_PASS\",\"role\":\"teacher\"}" \
  -w '\nstatus=%{http_code}\n' | tee /tmp/signin.json
```
Expected: `status=201` (Nest's default for `@Post`) and a body containing `accessToken`. This single call proves the container booted, migrations created the tables, the seed populated users, bcrypt works in the runtime image, and `SEED_DEFAULT_PASSWORD` was honoured.

- [ ] **Step 10: Verify a wrong-role sign-in is rejected**

```bash
. /tmp/ignite-ids.env
curl -sS -X POST https://ignite-api.jonayed.me/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d "{\"identifier\":\"funke.okafor@ignite.edu.ng\",\"password\":\"$SEED_PASS\",\"role\":\"principal\"}" \
  -o /dev/null -w 'wrong-role status=%{http_code}\n'
```
Expected: `401`. This is what makes hardcoding `role: 'teacher'` in the app safe.

- [ ] **Step 11: Record the outcome in the plan file and commit**

Append the real `applicationId` and the live URL to this plan under Task 5, then:

```bash
git add docs/superpowers/plans/2026-08-08-teacher-app-backend-integration.md
git commit -m "docs: record live API deployment details"
```

---

### Task 6: Install app dependencies and establish a test harness

`apps/teacher-app` has **no test runner, no lint, and no `test` script** — only `babel-preset-expo`. Every later app task is written test-first, so the harness has to exist before any of them. `jest-expo` is the preset that understands React Native's module graph; plain `jest` cannot parse it.

**Files:**
- Modify: `apps/teacher-app/package.json`
- Create: `apps/teacher-app/jest.config.js`
- Create: `apps/teacher-app/jest.setup.js`
- Create: `apps/teacher-app/src/__tests__/harness.test.js`
- Create: `apps/teacher-app/.env.example`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `npm test` runs jest with the `jest-expo` preset.
  - `jest.setup.js` mocks `expo-secure-store` with an in-memory store, exposed as `global.__secureStore` (a plain object) so tests can assert on what was written.
  - Runtime deps available to later tasks: `@tanstack/react-query`, `@tanstack/react-query-persist-client`, `@tanstack/query-async-storage-persister`, `expo-secure-store`, `expo-network`.

- [ ] **Step 1: Install runtime dependencies through the Expo installer**

`expo install` picks versions matched to SDK 54; plain `npm install` will pull versions that break the native modules.

```bash
cd apps/teacher-app
npx expo install expo-secure-store expo-network
npm install @tanstack/react-query@^5.59.0 \
            @tanstack/react-query-persist-client@^5.59.0 \
            @tanstack/query-async-storage-persister@^5.59.0
```

- [ ] **Step 2: Install the test harness**

```bash
cd apps/teacher-app
npm install --save-dev jest@^29.7.0 jest-expo@~54.0.0 \
            @testing-library/react-native@^12.7.2 react-test-renderer@19.1.0
```

- [ ] **Step 3: Add the `test` script to `apps/teacher-app/package.json`**

In the `scripts` block add:

```json
    "test": "jest",
    "test:watch": "jest --watch"
```

- [ ] **Step 4: Create `apps/teacher-app/jest.config.js`**

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack/.*)',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
};
```

- [ ] **Step 5: Create `apps/teacher-app/jest.setup.js`**

```js
/* eslint-env jest */

// In-memory stand-in for the device keychain. Tests assert against
// global.__secureStore directly rather than reaching into the mock.
global.__secureStore = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (k) =>
    Object.prototype.hasOwnProperty.call(global.__secureStore, k)
      ? global.__secureStore[k]
      : null,
  ),
  setItemAsync: jest.fn(async (k, v) => {
    global.__secureStore[k] = v;
  }),
  deleteItemAsync: jest.fn(async (k) => {
    delete global.__secureStore[k];
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
  })),
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
}));

beforeEach(() => {
  global.__secureStore = {};
});
```

- [ ] **Step 6: Write a failing test that proves the harness itself works**

Create `apps/teacher-app/src/__tests__/harness.test.js`:

```js
import * as SecureStore from 'expo-secure-store';

describe('test harness', () => {
  it('mocks expo-secure-store with an in-memory store', async () => {
    await SecureStore.setItemAsync('probe', 'value');
    expect(global.__secureStore.probe).toBe('value');
    expect(await SecureStore.getItemAsync('probe')).toBe('value');

    await SecureStore.deleteItemAsync('probe');
    expect(await SecureStore.getItemAsync('probe')).toBeNull();
  });

  it('resets the secure store between tests', () => {
    expect(global.__secureStore).toEqual({});
  });
});
```

- [ ] **Step 7: Run it**

```bash
cd apps/teacher-app && npm test
```
Expected: 2 passing tests. If `jest-expo` fails to resolve the preset, the SDK-54-matched version was not installed — re-check Step 2.

- [ ] **Step 8: Create `apps/teacher-app/.env.example`**

```
# Overrides the deployed API. Expo inlines EXPO_PUBLIC_* at build time.
# Leave unset to use https://ignite-api.jonayed.me/api
EXPO_PUBLIC_API_URL=
```

- [ ] **Step 9: Commit**

```bash
git add apps/teacher-app/package.json apps/teacher-app/package-lock.json \
        apps/teacher-app/jest.config.js apps/teacher-app/jest.setup.js \
        apps/teacher-app/src/__tests__ apps/teacher-app/.env.example
git commit -m "test(teacher-app): add jest-expo harness and data-layer dependencies"
```

---

### Task 7: API base URL configuration

One file holds the hostname. No screen, hook, or client may contain a URL literal.

**Files:**
- Create: `apps/teacher-app/src/config.js`
- Create: `apps/teacher-app/src/__tests__/config.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `export const API_BASE_URL: string` and `export const REQUEST_TIMEOUT_MS: number` (15000). Task 8's client imports both.

- [ ] **Step 1: Write the failing test**

Create `apps/teacher-app/src/__tests__/config.test.js`:

```js
describe('config', () => {
  const load = () => {
    let mod;
    jest.isolateModules(() => {
      mod = require('../config');
    });
    return mod;
  };

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it('defaults to the deployed API', () => {
    expect(load().API_BASE_URL).toBe('https://ignite-api.jonayed.me/api');
  });

  it('honours EXPO_PUBLIC_API_URL', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.5:4000/api';
    expect(load().API_BASE_URL).toBe('http://192.168.1.5:4000/api');
  });

  it('strips a trailing slash so path joining never doubles up', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:4000/api/';
    expect(load().API_BASE_URL).toBe('http://localhost:4000/api');
  });

  it('exposes a request timeout', () => {
    expect(load().REQUEST_TIMEOUT_MS).toBe(15000);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
cd apps/teacher-app && npm test -- config.test.js
```
Expected: FAIL — `Cannot find module '../config'`.

- [ ] **Step 3: Create `apps/teacher-app/src/config.js`**

```js
// The only place in the app where an API hostname may appear.
// Expo inlines EXPO_PUBLIC_* at build time, so switching between the
// deployed API and a local server is one environment variable.
const DEFAULT_API_URL = 'https://ignite-api.jonayed.me/api';

const raw = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

export const API_BASE_URL = raw.replace(/\/+$/, '');

// fetch() has no default timeout, so a dead network would hang a screen
// indefinitely. Every request is bounded by this.
export const REQUEST_TIMEOUT_MS = 15000;
```

- [ ] **Step 4: Run the tests again**

```bash
cd apps/teacher-app && npm test -- config.test.js
```
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add apps/teacher-app/src/config.js apps/teacher-app/src/__tests__/config.test.js
git commit -m "feat(teacher-app): add API base URL configuration"
```

---

### Task 8: The fetch client

Three response-shape facts drive this, each verified against the server source:

1. **Success is wrapped.** `TransformInterceptor` returns `{data, meta:{timestamp, path, statusCode}}`.
2. **Paginated lists are double-nested.** A service returns `{data, total, page, limit}`, which the interceptor then wraps — so items live at `body.data.data`.
3. **Errors are NOT wrapped.** `HttpExceptionFilter` returns a bare `{statusCode, error, message, path, timestamp}` where `message` may be a **string or an array of strings** (`ValidationPipe` produces the array form).

`ValidationPipe` runs with `forbidNonWhitelisted: true`, so an unrecognised body or query key returns 400 with a list of messages. Surfacing those verbatim makes wiring the screens tractable; swallowing them would not.

**Files:**
- Create: `apps/teacher-app/src/api/client.js`
- Create: `apps/teacher-app/src/api/__tests__/client.test.js`

**Interfaces:**
- Consumes: `API_BASE_URL`, `REQUEST_TIMEOUT_MS` from `src/config`.
- Produces:
  - `class ApiError extends Error` with fields `status: number`, `code: string`, `messages: string[]`, and `isNetwork: boolean`.
  - `setAuthToken(token: string | null): void` and `getAuthToken(): string | null` — module-level, so `AuthContext` sets it once rather than threading a token through every call.
  - `setUnauthorizedHandler(fn: (() => void) | null): void` — invoked on any 401 that is not a sign-in attempt.
  - `request(path: string, options?: {method?, body?, query?, signal?, skipAuth?: boolean}): Promise<any>` — returns the **unwrapped** payload. For paginated bodies it returns `{items, total, page, limit}`; otherwise the plain `data`.

- [ ] **Step 1: Write the failing tests**

Create `apps/teacher-app/src/api/__tests__/client.test.js`:

```js
import { request, ApiError, setAuthToken, setUnauthorizedHandler } from '../client';
import { API_BASE_URL } from '../../config';

const ok = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const envelope = (data) => ({
  data,
  meta: { timestamp: '2026-08-08T00:00:00.000Z', path: '/api/x', statusCode: 200 },
});

describe('api client', () => {
  beforeEach(() => {
    setAuthToken(null);
    setUnauthorizedHandler(null);
    global.fetch = jest.fn();
  });

  it('unwraps the success envelope', async () => {
    global.fetch.mockResolvedValue(ok(envelope({ id: 'u1', name: 'A' })));
    await expect(request('/auth/me')).resolves.toEqual({ id: 'u1', name: 'A' });
  });

  it('unwraps a paginated body to {items,total,page,limit}', async () => {
    global.fetch.mockResolvedValue(
      ok(envelope({ data: [{ id: '1' }], total: 7, page: 2, limit: 20 })),
    );
    await expect(request('/classes')).resolves.toEqual({
      items: [{ id: '1' }],
      total: 7,
      page: 2,
      limit: 20,
    });
  });

  it('builds the URL from the base and drops undefined query params', async () => {
    global.fetch.mockResolvedValue(ok(envelope([])));
    await request('/classes', { query: { teacherId: 't1', schoolId: undefined, page: 1 } });
    expect(global.fetch.mock.calls[0][0]).toBe(
      `${API_BASE_URL}/classes?teacherId=t1&page=1`,
    );
  });

  it('attaches the bearer token when one is set', async () => {
    setAuthToken('tok123');
    global.fetch.mockResolvedValue(ok(envelope({})));
    await request('/auth/me');
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer tok123');
  });

  it('omits the Authorization header when skipAuth is set', async () => {
    setAuthToken('tok123');
    global.fetch.mockResolvedValue(ok(envelope({})));
    await request('/auth/signin', { method: 'POST', body: {}, skipAuth: true });
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('raises ApiError carrying the status and a string message', async () => {
    global.fetch.mockResolvedValue(
      ok({ statusCode: 404, error: 'Not Found', message: 'Class not found' }, 404),
    );
    await expect(request('/classes/x')).rejects.toMatchObject({
      status: 404,
      messages: ['Class not found'],
    });
  });

  it('flattens an array of validation messages', async () => {
    global.fetch.mockResolvedValue(
      ok(
        {
          statusCode: 400,
          error: 'Bad Request',
          message: ['classId must be a UUID', 'property foo should not exist'],
        },
        400,
      ),
    );
    await expect(request('/homework', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 400,
      messages: ['classId must be a UUID', 'property foo should not exist'],
    });
  });

  it('calls the unauthorized handler on a 401', async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    global.fetch.mockResolvedValue(ok({ statusCode: 401, message: 'Unauthorized' }, 401));
    await expect(request('/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does NOT call the unauthorized handler for a failed sign-in', async () => {
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    global.fetch.mockResolvedValue(ok({ statusCode: 401, message: 'Unauthorized' }, 401));
    await expect(
      request('/auth/signin', { method: 'POST', body: {}, skipAuth: true }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('marks a transport failure as a network error', async () => {
    global.fetch.mockRejectedValue(new TypeError('Network request failed'));
    await expect(request('/auth/me')).rejects.toMatchObject({
      isNetwork: true,
      status: 0,
    });
  });

  it('serialises a JSON body with the right content type', async () => {
    global.fetch.mockResolvedValue(ok(envelope({})));
    await request('/homework', { method: 'POST', body: { title: 'T' } });
    const init = global.fetch.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({ title: 'T' });
  });

  it('handles a 204 with no body', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input');
      },
    });
    await expect(request('/notifications/1/read', { method: 'PATCH' })).resolves.toBeNull();
  });
});
```

- [ ] **Step 2: Run and watch it fail**

```bash
cd apps/teacher-app && npm test -- client.test.js
```
Expected: FAIL — `Cannot find module '../client'`.

- [ ] **Step 3: Create `apps/teacher-app/src/api/client.js`**

```js
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config';

/**
 * A failed API call. Screens branch on `status` (401/403/404) and on
 * `isNetwork` to tell "the server said no" from "we never reached it".
 */
export class ApiError extends Error {
  constructor({ status, code, messages, isNetwork = false }) {
    super(messages[0] || code || 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.messages = messages;
    this.isNetwork = isNetwork;
  }
}

let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function getAuthToken() {
  return authToken;
}

/**
 * Registered by AuthContext. The server issues 7/30-day tokens and exposes
 * no refresh endpoint, so the only honest response to a 401 is to sign out.
 */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn || null;
}

function buildUrl(path, query) {
  const url = `${API_BASE_URL}${path}`;
  if (!query) return url;
  const parts = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `${url}?${parts.join('&')}` : url;
}

function toMessages(message) {
  if (Array.isArray(message)) return message;
  if (typeof message === 'string' && message) return [message];
  return ['Request failed'];
}

/**
 * Unwrap the server's response shapes:
 *   TransformInterceptor  -> {data, meta}
 *   paginated services    -> {data, total, page, limit} INSIDE that envelope
 */
function unwrap(body) {
  if (body === null || typeof body !== 'object') return body;
  const payload = 'meta' in body && 'data' in body ? body.data : body;
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray(payload.data) &&
    'total' in payload
  ) {
    return {
      items: payload.data,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
    };
  }
  return payload;
}

export async function request(path, options = {}) {
  const { method = 'GET', body, query, signal, skipAuth = false } = options;

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!skipAuth && authToken) headers.Authorization = `Bearer ${authToken}`;

  // fetch() has no timeout of its own; without this a dead network hangs.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (signal) signal.addEventListener('abort', () => controller.abort());

  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    throw new ApiError({
      status: 0,
      code: e.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK',
      messages: [
        e.name === 'AbortError'
          ? 'The server took too long to respond.'
          : 'Could not reach the server. Check your connection.',
      ],
      isNetwork: true,
    });
  }
  clearTimeout(timer);

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null; // 204 and other empty bodies
  }

  if (!res.ok) {
    // Errors bypass TransformInterceptor, so payload is the bare shape.
    const err = new ApiError({
      status: res.status,
      code: (payload && payload.error) || String(res.status),
      messages: toMessages(payload && payload.message),
    });
    // A 401 from signin means wrong credentials, not an expired session.
    if (res.status === 401 && !skipAuth && onUnauthorized) onUnauthorized();
    throw err;
  }

  return unwrap(payload);
}
```

- [ ] **Step 4: Run the tests**

```bash
cd apps/teacher-app && npm test -- client.test.js
```
Expected: 12 passing.

- [ ] **Step 5: Prove the unwrapping matches the real server, not just the mocks**

The tests above encode an *assumption* about the envelope. Confirm it against the live API from Task 5:

```bash
. /tmp/ignite-ids.env
TOKEN=$(curl -sS -X POST https://ignite-api.jonayed.me/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d "{\"identifier\":\"funke.okafor@ignite.edu.ng\",\"password\":\"$SEED_PASS\",\"role\":\"teacher\"}" \
  | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')

echo "--- single object (expect data + meta) ---"
curl -sS https://ignite-api.jonayed.me/api/auth/me -H "Authorization: Bearer $TOKEN" \
  | head -c 400; echo

echo "--- paginated (expect data.data + data.total) ---"
curl -sS "https://ignite-api.jonayed.me/api/classes?limit=1" -H "Authorization: Bearer $TOKEN" \
  | head -c 400; echo

echo "--- error (expect NO meta key) ---"
curl -sS https://ignite-api.jonayed.me/api/classes/not-a-uuid -H "Authorization: Bearer $TOKEN" \
  | head -c 400; echo
```
If any shape differs from what the tests assert, fix `unwrap()` **and** the test — the live server is the authority.

- [ ] **Step 6: Commit**

```bash
git add apps/teacher-app/src/api/client.js apps/teacher-app/src/api/__tests__/client.test.js
git commit -m "feat(teacher-app): add fetch client with envelope unwrapping and ApiError"
```

---

### Task 9: The endpoint map

A grouped map of call signatures so no screen ever constructs a URL. Every path below was read from the actual controllers; every body shape from the actual DTO.

**Files:**
- Create: `apps/teacher-app/src/api/endpoints.js`
- Create: `apps/teacher-app/src/api/__tests__/endpoints.test.js`

**Interfaces:**
- Consumes: `request` from `src/api/client`.
- Produces `export const api` with exactly these members — later tasks call these names and no others:

```
api.auth.signin({identifier, password, rememberMe})   POST /auth/signin   (skipAuth)
api.auth.me()                                         GET  /auth/me
api.classes.list(teacherId)                           GET  /classes?teacherId=
api.classes.learners(classId)                         GET  /classes/:id/learners
api.curriculum.list()                                 GET  /curriculum
api.lessons.list({unitId, status, page, limit})       GET  /lessons
api.lessons.detail(id)                                GET  /lessons/:id
api.lessons.steps(id)                                 GET  /lessons/:id/steps
api.lessons.media(id)                                 GET  /lessons/:id/media
api.sessions.current()                                GET  /lesson-sessions/current
api.sessions.start({lessonId, classId})               POST /lesson-sessions
api.sessions.complete(id)                             PATCH /lesson-sessions/:id/complete
api.attendance.list({classId, lessonSessionId, ...})  GET  /attendance
api.attendance.bulk({lessonSessionId, records})       POST /attendance/bulk
api.assessment.list({lessonId, lessonSessionId, ...}) GET  /assessment
api.assessment.bulk({lessonId, lessonSessionId, assessments})  POST /assessment/bulk
api.homework.list({classId, status, page, limit})     GET  /homework
api.homework.create({lessonId, classId, title, ...})  POST /homework
api.homework.submission(id)                           GET  /homework/submissions/:id
api.homework.reviewSubmission(id, body)               PATCH /homework/submissions/:id
api.homework.messages(id)                             GET  /homework/submissions/:id/messages
api.homework.sendMessage(id, {senderType, senderName, body})  POST /homework/submissions/:id/messages
api.notifications.list({page, limit})                 GET  /notifications
api.notifications.markRead(id)                        PATCH /notifications/:id/read
api.notifications.markAllRead()                       PATCH /notifications/read-all
```

`api.classes.list` takes `teacherId` as a **required positional argument**, not an option — `GET /api/classes` is not scoped to the caller (`classes.service.ts` filters only on explicitly-supplied params), so omitting it would return every class in the system.

- [ ] **Step 1: Write the failing test**

Create `apps/teacher-app/src/api/__tests__/endpoints.test.js`:

```js
jest.mock('../client', () => ({ request: jest.fn(async () => ({})) }));

import { request } from '../client';
import { api } from '../endpoints';

describe('endpoints', () => {
  beforeEach(() => request.mockClear());

  it('signs in without an auth header', async () => {
    await api.auth.signin({ identifier: 'a@b.c', password: 'p', rememberMe: true });
    expect(request).toHaveBeenCalledWith('/auth/signin', {
      method: 'POST',
      body: { identifier: 'a@b.c', password: 'p', role: 'teacher', rememberMe: true },
      skipAuth: true,
    });
  });

  it('always scopes the class list to the teacher', async () => {
    await api.classes.list('t1');
    expect(request).toHaveBeenCalledWith('/classes', { query: { teacherId: 't1', limit: 100 } });
  });

  it('refuses to list classes without a teacherId', async () => {
    await expect(api.classes.list()).rejects.toThrow(/teacherId is required/);
    expect(request).not.toHaveBeenCalled();
  });

  it('builds nested lesson paths', async () => {
    await api.lessons.steps('l1');
    expect(request).toHaveBeenCalledWith('/lessons/l1/steps', undefined);
  });

  it('posts bulk attendance in the DTO shape', async () => {
    const records = [{ learnerId: 'u1', status: 'present' }];
    await api.attendance.bulk({ lessonSessionId: 's1', records });
    expect(request).toHaveBeenCalledWith('/attendance/bulk', {
      method: 'POST',
      body: { lessonSessionId: 's1', records },
    });
  });

  it('posts bulk assessment in the DTO shape', async () => {
    const assessments = [{ learnerId: 'u1', score: 3 }];
    await api.assessment.bulk({ lessonId: 'l1', lessonSessionId: 's1', assessments });
    expect(request).toHaveBeenCalledWith('/assessment/bulk', {
      method: 'POST',
      body: { lessonId: 'l1', lessonSessionId: 's1', assessments },
    });
  });

  it('sends a homework message with the teacher sender type', async () => {
    await api.homework.sendMessage('sub1', { body: 'hello', senderName: 'A' });
    expect(request).toHaveBeenCalledWith('/homework/submissions/sub1/messages', {
      method: 'POST',
      body: { senderType: 'teacher', senderName: 'A', body: 'hello' },
    });
  });

  it('marks a notification read', async () => {
    await api.notifications.markRead('n1');
    expect(request).toHaveBeenCalledWith('/notifications/n1/read', { method: 'PATCH' });
  });
});
```

- [ ] **Step 2: Run and watch it fail**

```bash
cd apps/teacher-app && npm test -- endpoints.test.js
```
Expected: FAIL — `Cannot find module '../endpoints'`.

- [ ] **Step 3: Create `apps/teacher-app/src/api/endpoints.js`**

```js
import { request } from './client';

// Every path here was read from the server's controllers; every body shape
// from its DTO. Screens call these — they never build a URL.
export const api = {
  auth: {
    // role is fixed: the server 401s when the account's role does not match,
    // so a principal's credentials correctly bounce off the teacher app.
    signin: ({ identifier, password, rememberMe = false }) =>
      request('/auth/signin', {
        method: 'POST',
        body: { identifier, password, role: 'teacher', rememberMe },
        skipAuth: true,
      }),
    me: () => request('/auth/me', undefined),
  },

  classes: {
    // GET /classes is NOT scoped to the caller — omitting teacherId returns
    // every class in the system. Passing it is mandatory, not optional.
    list: (teacherId) => {
      if (!teacherId) {
        return Promise.reject(new Error('classes.list: teacherId is required'));
      }
      return request('/classes', { query: { teacherId, limit: 100 } });
    },
    // Returns learners in the class's SCHOOL, not strictly its roster.
    // Still the correct endpoint: UserFilterDto has no classId field, so
    // GET /users?classId= would be rejected 400 by forbidNonWhitelisted.
    learners: (classId) => request(`/classes/${classId}/learners`, undefined),
  },

  curriculum: {
    list: () => request('/curriculum', undefined),
  },

  lessons: {
    list: (query) => request('/lessons', { query }),
    detail: (id) => request(`/lessons/${id}`, undefined),
    steps: (id) => request(`/lessons/${id}/steps`, undefined),
    media: (id) => request(`/lessons/${id}/media`, undefined),
  },

  sessions: {
    current: () => request('/lesson-sessions/current', undefined),
    start: ({ lessonId, classId }) =>
      request('/lesson-sessions', { method: 'POST', body: { lessonId, classId } }),
    complete: (id) => request(`/lesson-sessions/${id}/complete`, { method: 'PATCH' }),
  },

  attendance: {
    list: (query) => request('/attendance', { query }),
    bulk: ({ lessonSessionId, records }) =>
      request('/attendance/bulk', { method: 'POST', body: { lessonSessionId, records } }),
  },

  assessment: {
    list: (query) => request('/assessment', { query }),
    bulk: ({ lessonId, lessonSessionId, assessments }) =>
      request('/assessment/bulk', {
        method: 'POST',
        body: { lessonId, lessonSessionId, assessments },
      }),
  },

  homework: {
    list: (query) => request('/homework', { query }),
    create: (body) => request('/homework', { method: 'POST', body }),
    submission: (id) => request(`/homework/submissions/${id}`, undefined),
    reviewSubmission: (id, body) =>
      request(`/homework/submissions/${id}`, { method: 'PATCH', body }),
    messages: (id) => request(`/homework/submissions/${id}/messages`, undefined),
    sendMessage: (id, { body, senderName }) =>
      request(`/homework/submissions/${id}/messages`, {
        method: 'POST',
        body: { senderType: 'teacher', senderName, body },
      }),
  },

  notifications: {
    list: (query) => request('/notifications', { query }),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },
};
```

- [ ] **Step 4: Run the tests**

```bash
cd apps/teacher-app && npm test -- endpoints.test.js
```
Expected: 8 passing.

- [ ] **Step 5: Verify every GET path exists on the live server**

Mocked tests prove the shape, not that the route exists. Hit each one and record the status — a `404` here means the path is wrong.

```bash
. /tmp/ignite-ids.env
TOKEN=$(curl -sS -X POST https://ignite-api.jonayed.me/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d "{\"identifier\":\"funke.okafor@ignite.edu.ng\",\"password\":\"$SEED_PASS\",\"role\":\"teacher\"}" \
  | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')
for p in /auth/me /curriculum /lessons /lesson-sessions/current /attendance /assessment /homework /notifications; do
  printf '%-28s %s\n' "$p" \
    "$(curl -sS -o /dev/null -w '%{http_code}' "https://ignite-api.jonayed.me/api$p" -H "Authorization: Bearer $TOKEN")"
done
```
Expected: every line `200`. Any `404` means the endpoint map is wrong; any `401` means the token expired — re-run the sign-in.

- [ ] **Step 6: Commit**

```bash
git add apps/teacher-app/src/api/endpoints.js apps/teacher-app/src/api/__tests__/endpoints.test.js
git commit -m "feat(teacher-app): add grouped endpoint map"
```

---

### Task 10: Token storage and AuthContext

`expo-secure-store` — Keychain on iOS, EncryptedSharedPreferences on Android. AsyncStorage is already installed and would be less work, but it writes plaintext to disk, and a bearer token granting access to learner records does not belong there. AsyncStorage is still used for the non-sensitive query cache in Task 11.

**Files:**
- Create: `apps/teacher-app/src/auth/tokenStore.js`
- Create: `apps/teacher-app/src/auth/AuthContext.js`
- Create: `apps/teacher-app/src/auth/__tests__/AuthContext.test.js`

**Interfaces:**
- Consumes: `api.auth.signin`, `api.auth.me`, `setAuthToken`, `setUnauthorizedHandler` from Tasks 8–9.
- Produces:
  - `tokenStore.save(token)`, `tokenStore.read(): Promise<string|null>`, `tokenStore.clear()`.
  - `<AuthProvider onSignOut?>` and `useAuth()` returning `{status, user, token, signIn, signOut, error, clearError}` where `status` is `'loading' | 'signedIn' | 'signedOut'`.
  - `signIn(identifier, password, rememberMe): Promise<boolean>` — resolves `true` on success, `false` on failure with `error` set to a display string.
  - `onSignOut` is called after a sign-out completes; Task 11 passes the query-cache wipe here.

- [ ] **Step 1: Write the failing test**

Create `apps/teacher-app/src/auth/__tests__/AuthContext.test.js`:

```js
import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

jest.mock('../../api/endpoints', () => ({
  api: { auth: { signin: jest.fn(), me: jest.fn() } },
}));

import { api } from '../../api/endpoints';
import { AuthProvider, useAuth } from '../AuthContext';
import { tokenStore } from '../tokenStore';
import { ApiError } from '../../api/client';

let latest;
function Probe() {
  latest = useAuth();
  return <Text>{latest.status}</Text>;
}

const renderAuth = (props = {}) =>
  render(
    <AuthProvider {...props}>
      <Probe />
    </AuthProvider>,
  );

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latest = undefined;
  });

  it('boots to signedOut when no token is stored', async () => {
    renderAuth();
    await waitFor(() => expect(latest.status).toBe('signedOut'));
    expect(api.auth.me).not.toHaveBeenCalled();
  });

  it('validates a stored token against the server on boot', async () => {
    await tokenStore.save('stored-token');
    api.auth.me.mockResolvedValue({ id: 'u1', name: 'A', role: 'teacher' });

    renderAuth();
    await waitFor(() => expect(latest.status).toBe('signedIn'));
    expect(latest.user).toEqual({ id: 'u1', name: 'A', role: 'teacher' });
  });

  it('signs out when the server rejects a stored token', async () => {
    await tokenStore.save('stale-token');
    api.auth.me.mockRejectedValue(new ApiError({ status: 401, code: '401', messages: ['nope'] }));

    renderAuth();
    await waitFor(() => expect(latest.status).toBe('signedOut'));
    expect(await tokenStore.read()).toBeNull();
  });

  it('stores the token and user on a successful sign in', async () => {
    api.auth.signin.mockResolvedValue({
      accessToken: 'new-token',
      user: { id: 'u2', name: 'B', role: 'teacher' },
    });

    renderAuth();
    await waitFor(() => expect(latest.status).toBe('signedOut'));

    let result;
    await act(async () => {
      result = await latest.signIn('a@b.c', 'pw', true);
    });

    expect(result).toBe(true);
    expect(api.auth.signin).toHaveBeenCalledWith({
      identifier: 'a@b.c',
      password: 'pw',
      rememberMe: true,
    });
    await waitFor(() => expect(latest.status).toBe('signedIn'));
    expect(await tokenStore.read()).toBe('new-token');
  });

  it('surfaces a 401 as a credentials error without signing in', async () => {
    api.auth.signin.mockRejectedValue(
      new ApiError({ status: 401, code: '401', messages: ['Unauthorized'] }),
    );

    renderAuth();
    await waitFor(() => expect(latest.status).toBe('signedOut'));

    let result;
    await act(async () => {
      result = await latest.signIn('a@b.c', 'wrong', false);
    });

    expect(result).toBe(false);
    expect(latest.error).toMatch(/email, phone or password/i);
    expect(latest.status).toBe('signedOut');
  });

  it('surfaces a network failure distinctly from bad credentials', async () => {
    api.auth.signin.mockRejectedValue(
      new ApiError({ status: 0, code: 'NETWORK', messages: ['Could not reach the server.'], isNetwork: true }),
    );

    renderAuth();
    await waitFor(() => expect(latest.status).toBe('signedOut'));
    await act(async () => {
      await latest.signIn('a@b.c', 'pw', false);
    });
    expect(latest.error).toMatch(/reach the server/i);
  });

  it('clears the token and calls onSignOut when signing out', async () => {
    const onSignOut = jest.fn();
    await tokenStore.save('t');
    api.auth.me.mockResolvedValue({ id: 'u1', name: 'A', role: 'teacher' });

    renderAuth({ onSignOut });
    await waitFor(() => expect(latest.status).toBe('signedIn'));

    await act(async () => {
      await latest.signOut();
    });

    await waitFor(() => expect(latest.status).toBe('signedOut'));
    expect(await tokenStore.read()).toBeNull();
    expect(latest.user).toBeNull();
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run and watch it fail**

```bash
cd apps/teacher-app && npm test -- AuthContext.test.js
```
Expected: FAIL — `Cannot find module '../tokenStore'`.

- [ ] **Step 3: Create `apps/teacher-app/src/auth/tokenStore.js`**

```js
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'ignite.teacher.token';

// Keychain (iOS) / EncryptedSharedPreferences (Android). Deliberately not
// AsyncStorage: a bearer token granting access to learner records must not
// sit in plaintext on disk.
export const tokenStore = {
  async save(token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async read() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async clear() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
```

- [ ] **Step 4: Create `apps/teacher-app/src/auth/AuthContext.js`**

```js
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api/endpoints';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { tokenStore } from './tokenStore';

const AuthContext = createContext(null);

function messageFor(err) {
  if (!err) return 'Something went wrong. Please try again.';
  if (err.isNetwork) return err.messages[0];
  if (err.status === 401) return 'Incorrect email, phone or password.';
  if (err.status === 403) return 'This account cannot use the teacher app.';
  // The server's ValidationPipe messages are more useful than anything
  // we could invent, so show them verbatim.
  return err.messages.join('\n');
}

export function AuthProvider({ children, onSignOut }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const onSignOutRef = useRef(onSignOut);
  onSignOutRef.current = onSignOut;

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await tokenStore.clear();
    setToken(null);
    setUser(null);
    setStatus('signedOut');
    if (onSignOutRef.current) onSignOutRef.current();
  }, []);

  // On boot, never trust local state alone: a stored token the server
  // rejects means signed out.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await tokenStore.read();
      if (!stored) {
        if (!cancelled) setStatus('signedOut');
        return;
      }
      setAuthToken(stored);
      try {
        const me = await api.auth.me();
        if (cancelled) return;
        setToken(stored);
        setUser(me);
        setStatus('signedIn');
      } catch {
        if (!cancelled) await clearSession();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // The server issues 7/30-day tokens and has no refresh endpoint, so the
  // only honest response to a 401 is to end the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setError('Session expired — please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const signIn = useCallback(async (identifier, password, rememberMe) => {
    setError('');
    try {
      const res = await api.auth.signin({ identifier, password, rememberMe });
      setAuthToken(res.accessToken);
      await tokenStore.save(res.accessToken);
      setToken(res.accessToken);
      setUser(res.user);
      setStatus('signedIn');
      return true;
    } catch (e) {
      setError(messageFor(e));
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const clearError = useCallback(() => setError(''), []);

  return (
    <AuthContext.Provider
      value={{ status, user, token, signIn, signOut, error, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
```

- [ ] **Step 5: Run the tests**

```bash
cd apps/teacher-app && npm test -- AuthContext.test.js
```
Expected: 7 passing.

- [ ] **Step 6: Commit**

```bash
git add apps/teacher-app/src/auth
git commit -m "feat(teacher-app): add secure token storage and AuthContext"
```

---
