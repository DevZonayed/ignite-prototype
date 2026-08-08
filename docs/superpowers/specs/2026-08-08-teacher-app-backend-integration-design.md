# Teacher App — Backend Integration Design

**Date:** 2026-08-08
**Scope:** `apps/teacher-app` (Expo SDK 54) + deployment of `apps/server` (NestJS)
**Goal:** Take the teacher app from a UI shell with no data layer to an app that
signs real teachers in against a deployed API and runs the core teaching loop on
live data.

---

## 1. Problem

`apps/teacher-app` is a complete, well-styled UI with **no backend connection at all**:

- No API client. No `fetch` call exists anywhere in `src/`.
- Auth is a `setTimeout` in `SignInScreen.js` that accepts any password.
- `src/data.js` exports eight empty arrays; every screen shows an `EmptyState`.
- No environment configuration, no error boundary, no network handling.

Meanwhile `apps/server` is a **fully-built API that no frontend calls** — 23 modules,
132 routes, real JWT auth, 34 TypeORM entities and a ~1050-line idempotent seed.
The work is therefore frontend wiring plus getting the server deployed and reachable,
not backend feature development.

### Decisions taken during design

| Question | Decision |
|---|---|
| What does "production ready" mean | Working end-to-end on a real backend |
| Where does the API live | Deployed to Dokploy on an HTTPS subdomain |
| Offline support | Online-first now, offline-*ready* structure |
| Data layer | TanStack Query + thin fetch client |
| Screen scope | Core teaching loop only |

### Explicitly out of scope

App icon, splash screen, bundle identifiers, EAS build configuration, store
submission, automated tests, and full offline sync. Also out of scope: implementing
the server's stubbed features. These are follow-on projects.

---

## 2. Backend deployment

### 2.1 Database: Postgres with explicit migrations

`src/config/database.config.ts` currently defaults to **`sqljs`** — pure-JavaScript
SQLite persisting to `./ignite.sqlite`. That default is why the server can run on any
machine with no Docker and no Postgres, but it is wrong for a deployed container: the
file is gitignored and wiped on every redeploy.

Deployment sets `DB_TYPE=postgres` against a Dokploy-provisioned Postgres service.
The config already supports this branch, including `DB_SSL`.

**Two production landmines this exposes, both of which must be fixed:**

1. `synchronize` is `configService.get('NODE_ENV') !== 'production'`. Deploying with
   the correct `NODE_ENV=production` therefore creates **zero tables**.
2. There is no `migrations` directory, and `package.json`'s `migration:generate`,
   `migration:run` and `seed` scripts all reference `src/database/data-source.ts`,
   **which does not exist**.

Fix: create `src/database/data-source.ts` exporting a TypeORM `DataSource` that reads
the same env vars as `database.config.ts`, add `src/database/migrations/`, generate
the initial migration from the 34 entities, and run migrations on deploy before the
app boots. Schema changes become explicit and reviewable rather than silent
auto-alters against live data.

### 2.2 Seeding

`SeedService` already runs from `main.ts` at bootstrap and is idempotent — it exits
early if any user exists. It stays, because it creates the first real teacher accounts.

**Security requirement:** the seed sets every user's password to `ignite123` and the
JWT secret defaults to `ignite-dev-secret-change-in-production`. Both must be
overridden via Dokploy environment secrets, and neither may be committed. The seed
password becomes an env var (`SEED_DEFAULT_PASSWORD`) with no default in production.

### 2.3 Container image

New `apps/server/Dockerfile`, multi-stage:

- **builder** — Node 22 with `build-essential`/`python3` present, because `bcrypt`
  is a native module; runs `npm ci && npm run build`.
- **runtime** — slim Node 22, production deps only, runs `node dist/main`.

The existing root `Dockerfile` is an nginx image serving the static `design/`
prototype. It is unrelated to this work and is left untouched.

### 2.4 Target

Deployed via the `dokploy-deploy` skill to `https://dokploy.jonayed.me`, on the
single-level subdomain **`ignite-api.jonayed.me`** over HTTPS with Let's Encrypt.
With the server's `/api` global prefix, the app's base URL is
`https://ignite-api.jonayed.me/api`.

**Deployment is not considered successful until `curl` against the live URL returns a
real status code** — specifically `GET /api/monitoring/health` (the only public GET)
and `GET /api/docs`.

---

## 3. App configuration

`apps/teacher-app/src/config.js` is the single source of truth:

```js
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://ignite-api.jonayed.me/api';
```

Expo inlines `EXPO_PUBLIC_*` at build time. A committed `.env.example` documents the
variable; `.env` is already gitignored by the root `**/.env` rule.

**No hostname appears in any screen.** Switching between the deployed API and a local
server is one environment variable.

---

## 4. Authentication

### 4.1 Token storage

`expo-secure-store` — Keychain on iOS, EncryptedSharedPreferences on Android.

`@react-native-async-storage/async-storage` is already installed and would be less
work, but it stores plaintext on disk. A bearer token granting access to learner
records does not belong there. AsyncStorage is still used for the *non-sensitive*
query cache (§5.3).

### 4.2 AuthContext

`src/auth/AuthContext.js` exposes `{user, token, status, signIn, signOut}` where
`status` is `loading | signedIn | signedOut`.

- **On boot:** read the stored token, then call `GET /api/auth/me` to confirm the
  server still accepts it and to hydrate `user` from the response. A stored token the
  server rejects means signed out. Local state is never trusted on its own.
- **`signIn(identifier, password, rememberMe)`** → `POST /api/auth/signin` with
  `role: 'teacher'` hardcoded. The server 401s when the account's role does not match
  the requested role, so a principal's credentials correctly bounce off the teacher app.
  Response shape is `{accessToken, user}`.
- **`signOut()`** clears secure storage **and wipes the React Query cache**. Without
  the cache wipe, the next teacher to sign in on a shared school device sees the
  previous teacher's cached learners. This is a privacy requirement, not hygiene.

### 4.3 Token expiry — no refresh flow

The server issues 7-day tokens, or 30-day with `rememberMe`, and exposes **no refresh
endpoint**. All seven auth routes were enumerated: `signin`, `activate`, `otp/send`,
`otp/verify`, `forgot-password`, `reset-password`, `me`. There is nothing to refresh
against.

The honest design: **a `401` from any authenticated request triggers automatic
sign-out** with a "Session expired — please sign in again" message. The `POST
/api/auth/signin` call itself is excluded — a 401 there means wrong credentials and
is rendered as a form error, not a session expiry. `rememberMe` is wired to the
existing checkbox so teachers get 30 days. Building a refresh flow against an endpoint
that does not exist would be worse than this.

### 4.4 Sign-in screen

`SignInScreen.js` loses its `setTimeout` fake and gains real states: request in
flight, invalid credentials (401), server unreachable, and the server's own
validation messages. `App.jsx` renders sign-in or the app based on `status`,
replacing the current local `signedIn` boolean.

---

## 5. Data layer

### 5.1 `src/api/client.js`

One `request()` function that attaches the bearer token, applies a timeout (the
default `fetch` has none, so a dead network hangs a screen indefinitely), and
normalises responses.

Three response-shape facts drive this, all verified against the server:

- **Success is wrapped.** `TransformInterceptor` returns `{data, meta:{timestamp, path, statusCode}}`.
- **Paginated lists are double-nested.** They return `{data, total, page, limit}`
  *inside* that envelope, so items live at `res.data.data`. The client unwraps both
  levels and returns `{items, total, page, limit}`.
- **Errors are NOT wrapped.** They return a bare `{statusCode, error, message, path, timestamp}`.
  The client converts these into a typed `ApiError` carrying the status code, so
  callers can distinguish 401 / 403 / 404 / network failure.

The server's global `ValidationPipe` runs with `forbidNonWhitelisted: true`, so any
unrecognised body or query key returns a 400. The client surfaces those messages
verbatim — swallowing them would make development substantially harder.

### 5.2 `src/api/endpoints.js`

A grouped map of call signatures — `api.classes.list()`, `api.attendance.bulk(...)` —
so no screen ever constructs a URL string.

### 5.3 TanStack Query

`@tanstack/react-query` for reads, with `@tanstack/query-async-storage-persister`
writing the cache to AsyncStorage.

- Caching, request deduplication, stale-while-revalidate, retry with backoff and
  cancellation come from the library rather than hand-rolled code.
- The persister satisfies the "screens still render offline" requirement: cached
  data appears immediately on launch with no network.
- Mutations go through a single `useApiMutation` wrapper. This is the seam where the
  offline queue drops in later — React Query's `onlineManager` plus paused mutations
  map directly onto the server's `/api/sync` module. The upgrade path to full
  offline-first is a configuration change at one point in the code, not a rewrite of
  twenty screens.

---

## 6. Screen wiring

### 6.1 Class selection

Every core endpoint needs a `classId`, and the app currently has no concept of a
selected class. `ClassContext` fetches `GET /api/classes` (scoped server-side to the
signed-in teacher), holds the selection, and persists it so it survives restarts.
Nothing else works without this.

### 6.2 Screens and their endpoints

All routes below were verified to exist in the controllers.

| Screen | Endpoints |
|---|---|
| Sign in | `POST /api/auth/signin`, `GET /api/auth/me` |
| Home | `GET /api/lesson-sessions/current`, `GET /api/classes` |
| Lessons | `GET /api/curriculum`, `GET /api/lessons` |
| LessonDetail | `GET /api/lessons/:id`, `/steps`, `/media` |
| Learners | `GET /api/classes/:id/learners` |
| Attendance | `GET /api/attendance`, `POST /api/attendance/bulk` |
| Assessment / Rubric | `GET /api/assessment`, `POST /api/assessment/bulk` |
| Homework | `GET /api/homework`, `POST /api/homework` |
| HwReview | `GET`/`PATCH /api/homework/submissions/:id`, `+ /messages` |
| Active lesson | `POST /api/lesson-sessions`, `PATCH /:id/complete` |
| Notifications | `GET /api/notifications`, `PATCH /:id/read` |

`GET /api/lesson-sessions/current` backs the Home screen's "No lesson in progress"
card exactly.

### 6.3 Screen states

Every data screen gets three distinct states: **loading** skeleton, **error** with a
retry action, and **empty**.

The existing `EmptyState` component stays. Its meaning changes from "we deleted the
demo data" to "the server returned zero rows" — the correct state for a fresh
account. Per `ignite-teacher-app-demo-content-stripped`, no demo people or lessons
are reintroduced.

Note that several tables are never seeded — attendance, assessment, evidence,
notifications and sync queue — so those screens legitimately render empty until a
teacher creates data. That is correct behaviour, not a bug.

### 6.4 Screens left unwired, and why

These get an honest "Not available yet" state rather than a fake success path:

- **AI** — `ai.service` returns a hardcoded placeholder string; no LLM SDK installed.
- **Evidence upload** — `FileInterceptor` is applied but the file argument is
  ignored; `UPLOAD_DIR` and `MAX_FILE_SIZE` are never read. There is nothing to
  upload to.
- **Announcements / Media / Imports** — backed by in-memory arrays despite having
  real entities; data is lost on restart.

A screen that pretends to upload is worse than one that states it cannot.

---

## 7. Hardening

- **Error boundary** at the app root, so a single bad render shows a recoverable
  screen instead of a white flash.
- **Network awareness** via `expo-network`: an offline banner, and mutations blocked
  with a clear message rather than failing silently.

---

## 8. New dependencies

| Package | Purpose |
|---|---|
| `@tanstack/react-query` | Read/cache/retry layer |
| `@tanstack/query-async-storage-persister` | Offline cache persistence |
| `expo-secure-store` | Encrypted JWT storage |
| `expo-network` | Connectivity detection |

---

## 9. Verification

Verification is performed end-to-end against running systems. Claims are not made
from the edit list.

1. **Server deploy** — `curl` the live `https://ignite-api.jonayed.me/api/monitoring/health`
   and `/api/docs`; both must return real status codes. Confirm Postgres tables exist
   after migration and that the seed populated users.
2. **Auth** — sign in over the real deployed API with a seeded teacher account;
   confirm a JWT is returned, `GET /api/auth/me` succeeds with it, and a wrong-role
   account is rejected with 401.
3. **App bundle** — fetch the served Metro bundle over the Expo tunnel and grep it
   for the new API code and for the absence of the removed `setTimeout` auth, watching
   byte-size and module-count movement to prove a genuine rebuild rather than a stale
   cache. This discipline caught a missed edit in the previous session and is applied
   again here.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Deploying with `NODE_ENV=production` yields an empty schema | Explicit migrations generated and run before boot (§2.1) |
| `sqljs` file wiped on redeploy | Move to Dokploy Postgres (§2.1) |
| Default JWT secret and seed password reach production | Both set as Dokploy secrets; no production defaults (§2.2) |
| `bcrypt` native build fails in a slim image | Multi-stage build with a toolchain in the builder stage (§2.3) |
| Cached learner data leaks between teachers on a shared device | Query cache wiped on sign-out (§4.2) |
| Token expires with no refresh endpoint | 401 triggers sign-out with a clear message; `rememberMe` extends to 30 days (§4.3) |

---

## Related memory

`ignite-server-api-map`, `ignite-mobile-apps-architecture`,
`ignite-teacher-app-demo-content-stripped`, `ignite-platform-overview`.
