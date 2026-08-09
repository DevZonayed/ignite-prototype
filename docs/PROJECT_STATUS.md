# IGNITE Platform — Project Status

**As of:** 2026-08-10 · **Branch:** `feat/backend-integration-completion` (5 commits ahead of `master`)

Every figure below was measured against the working tree and against a running
Postgres-backed server — not taken from earlier notes.

---

## 1. Headline

| Layer | State |
|---|---|
| Design prototype (`design/`) | Complete — 8 static pages, the visual contract |
| Backend API (`apps/server`) | Feature-complete, **deployable**, 44 tests passing |
| Admin portal | Fully wired — 15/15 views |
| School portal | Fully wired — 11/11 views |
| Teacher app | **Fully wired — 22/22 screens**, `data.js` deleted |
| Learner app | **Fully wired — 8/8 screens**, `data.js` deleted |
| Parent app | **Fully wired — 5/5 screens + auth**, `data.js` deleted |
| Deployment | Dockerfile, compose and migrations ready; **not yet deployed** |
| Tests | 44 unit + e2e, plus 64 live API checks across the three apps |

No app reads mock data any more. The one thing still outstanding is the deploy
itself, which needs Dokploy credentials.

---

## 2. Backend — `apps/server`

23 modules, 171 endpoints, 34 entities, 77 DTOs.

**Schema is owned by migrations.** `src/database/data-source.ts` drives the
TypeORM CLI; the initial migration creates 34 tables and 51 foreign keys, and
regenerating reports *"No changes"*, so entities and migration agree. Postgres
runs with `synchronize: false` and `migrationsRun: true`.

**Column types are driver-aware.** Postgres has no `datetime`, sql.js has no
`timestamp`, and a nullable `Date | null` reflects as `Object` so TypeORM cannot
infer it. `src/database/column-types.ts` picks the right literal once from
`DB_TYPE`. Both databases build their schema from the same entities.

**Ships in a container.** Two-stage `Dockerfile` (bcrypt toolchain in the builder
only, `dumb-init` as PID 1, non-root, healthcheck on the public
`/api/monitoring/health`), plus `docker-compose.yml` with Postgres 16.

**Verified end to end:** the image builds, compose brings up an empty database,
applies the migration at boot and reports healthy. With `SEED_DEMO_DATA=false`
there are 0 users and `bootstrap-status` returns `needsBootstrap`; with the demo
seed on, 17 users / 20 schools / 24 lessons land, teacher sign-in returns a JWT
that authorises `GET /api/classes`, and an unauthenticated call gets 401.

### Tests
- **`auth.service.spec.ts`** — password checks, the role gate that stops a valid
  credential opening the wrong app, invite lookup.
- **`lqs.service.spec.ts`** — level boundaries, weighting, radar normalisation.
- **`auth.e2e-spec.ts`** — the real app over real HTTP on in-process sql.js:
  sign-in, `RolesGuard`, the `{ data, meta }` envelope, validation rejection.
- **`test/api-verification/*.mjs`** — one script per mobile app, calling every
  endpoint that app uses against a live server. 64/64 pass.

---

## 3. Apps

All five now share the same shape: a thin `client.js` (envelope unwrapping,
typed `ApiError`, 401 → sign-out), a grouped `endpoints.js` so no screen builds
a URL, `useApi`/`useAction` hooks, and a shared loading/error/empty ladder.

| App | Screens live | Notable |
|---|---|---|
| Admin portal | 15/15 | Shipped earlier |
| School portal | 11/11 | Shipped earlier |
| Teacher | 22/22 | Full teaching loop: sessions, attendance, rubric, homework, evidence |
| Learner | 8/8 | Portfolio, skills radar, badges, certificate |
| Parent | 5/5 | Gained authentication, child switching, homework thread |

---

## 4. Bugs found and fixed along the way

Each was found by verifying against the running server, not by reading code.

1. **Crypto-stealer in git history** — `vite.config.js` in both portals plus
   `public/fonts/fa-solid-400.woff2` (8.9KB of JS disguised as a font). Removed;
   see §6.
2. **`/assessments` vs `/assessment`** — the teacher app called a path that does
   not exist. Every assessment call 404'd.
3. **Learner "Share with parent"** — `POST /portfolio/projects/:id/share` is
   `@Roles('teacher')`, so it 403'd every time. The button is gone rather than
   shipped broken.
4. **LQS scores seeded as percentages** (85, 90) on an integer 1–4 scale. Levels
   pinned to "Secure" and 7 of 10 radar spokes drew outside the chart. Fixed at
   the seed; the demo learner's total is now 78, matching the design prototype.
5. **`datetime` → `timestamp` broke local dev** — sql.js supports neither the
   old nor the new literal universally. Fixed with the driver-aware type above.
6. **`Button` had no `disabled` prop** in the teacher app — it dimmed but still
   fired, allowing double submits.
7. **Fake upload progress** in the parent app — animated on a timer and reported
   success for a file that was never sent.

---

## 5. Known gaps

- **Not deployed.** Everything is deploy-ready; the step needs Dokploy
  credentials. `docs/DEPLOYMENT.md` has the exact steps and the live-URL checks.
- **No file storage.** `MediaService` keeps records in an in-process array and
  **discards the uploaded file**. Evidence and homework submissions therefore
  record a device-local URI. This is the single biggest functional gap left —
  object storage plus a real upload endpoint.
- **AI is a stub.** `/ai/conversations` persists both turns and returns a fixed
  placeholder reply; no model is connected.
- **Seeding is not transactional.** A failure part-way leaves a half-seeded
  database, and the next boot sees users and skips. Wipe the volume to reseed.
- **Test coverage is narrow** — auth and LQS. Homework, attendance and
  curriculum services have no unit tests yet.
- **Certificate download** is not wired; it needs a file writer and share sheet.

---

## 6. Security follow-up (still needs you)

The malware is out of the working tree and the removal is committed, but it
remains in history at `fe0aadf` (2026-07-22) and `470324e`. Anyone checking out
those commits and running `npm run dev`/`build` in either portal executes it.

Still yours to do:
1. **Rotate credentials** used on this machine since 2026-07-22 — npm tokens,
   SSH keys, cloud and registry credentials, and anything in `apps/server/.env`
   (it holds live SMTP credentials).
2. **Reinstall `node_modules`** in both portals.
3. Consider rewriting history (`git filter-repo`) if this repo is ever published.

One unrelated change was made outside the repo: `~/.docker/config.json` named
`credsStore: desktop` while Docker Desktop was uninstalled, so every image pull
failed. The key was removed (backup at `~/.docker/config.json.bak-*`); `auths`
was empty, so nothing was lost.

---

## 7. What to do next

1. Deploy to Dokploy and curl the live URL (§5, `docs/DEPLOYMENT.md`).
2. Add object storage and a real upload endpoint — the last functional gap.
3. Point the apps at the deployed API (`API_BASE_URL_OVERRIDE` in each
   `src/config.js`) and test on real devices.
4. Broaden tests to homework, attendance and curriculum.
5. Merge `feat/backend-integration-completion` into `master`.
