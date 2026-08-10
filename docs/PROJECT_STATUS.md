# IGNITE Platform — Project Status

**As of:** 2026-08-10 · **Branch:** `feat/backend-integration-completion` (5 commits ahead of `master`)

Every figure below was measured against the working tree and against a running
Postgres-backed server — not taken from earlier notes.

---

## 1. Headline

| Layer | State |
|---|---|
| Design prototype (`design/`) | Complete — 8 static pages, the visual contract |
| Backend API (`apps/server`) | Feature-complete, **deployable**, 64 tests passing |
| Admin portal | Fully wired — 15/15 views |
| School portal | Fully wired — 11/11 views |
| Teacher app | **Fully wired — 22/22 screens**, `data.js` deleted |
| Learner app | **Fully wired — 8/8 screens**, `data.js` deleted |
| Parent app | **Fully wired — 5/5 screens + auth**, `data.js` deleted |
| Deployment | Dockerfile, compose and migrations ready; **not yet deployed** |
| Tests | 64 unit + e2e, plus 63 live API checks across the three apps (see §4b) |

No app reads mock data any more. The one thing still outstanding is the deploy
itself, which needs Dokploy credentials. **Read §4b before trusting the
"fully wired" figures in this table** — they measure that screens render, which
is not the same as the endpoints behind them being correct.

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
- **`classes.service.spec.ts`** — class enrolment, roster, learner-count
  recounts, and per-role tenancy on `GET /classes`.
- **`homework.service.spec.ts`** — per-role homework scoping, including a
  regression test for the cross-school leak.
- **`test/api-verification/*.mjs`** — one script per mobile app, calling every
  endpoint that app uses against a live server.

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

## 4b. QA pass, 2026-08-10 — what "fully wired" was hiding

Both web portals were walked end to end against a live server and a real
database. Every view rendered and every read returned 200 with no console
errors, which is what the "15/15" and "11/11" figures above measured. That test
cannot see an unscoped query or a missing role guard, and both were there.

**Fixed in this pass:**

| Was | Now |
|---|---|
| `GET /api/homework` unscoped — a principal saw other schools' homework | Scoped by class-through-school for principal, learner and parent; unknown roles denied |
| ~12 write routes carried no `@Roles`; a learner could author and edit lessons, open lesson sessions, mark **their own attendance present**, and trigger sync | All guarded; every one of those calls now 403s |
| `GET /classes/:id/learners` matched on school, so every class in a school returned the same roster | Reads a real enrolment; `learnerCount` is recounted from it |
| No learner→class enrolment existed anywhere — no column, no endpoint, no UI | `users.classId` + migration, enrol/unenrol endpoints, class-register UI in the school portal |
| No lesson authoring in any portal; a fresh install could not create a single lesson | Lesson add/edit under each unit in the admin Curriculum view |
| `POST /reports/school` stored `"Report data pending generation"`; download was a placeholder | All four report types computed from live records; `generatedBy` recorded; download returns CSV |
| `PATCH /lessons/:id/status` returned 500 for an unknown status | Validated DTO → 400 |
| Sidebar nav was `<a onClick>` with no `href`; `+ Add unit` was a `<span>`; the closed drawer kept a focusable button off-screen | Real hrefs and buttons; closed drawer is `visibility:hidden`. Both portals are keyboard-navigable |

Tests went from 44 to 60: `classes.service.spec.ts` covers enrolment and the
roster, `homework.service.spec.ts` covers per-role scoping including the
principal leak.

**Method note for the next reader:** "the screen loads" is not the same as "the
endpoint is correct". The findings above came from signing in as each role and
trying the writes that role should not be able to make, and from comparing what
two different tenants can see. Read §5 as the list of what is still missing, not
as the list of what is wrong.

### Second pass — every control, plus the emulator

Both portals were then driven control by control, and the teacher app was run on
an Android emulator. Seven more defects surfaced, all fixed:

| Was | Now |
|---|---|
| **Mobile apps could not reach the API at all.** `metroHost()` read `NativeModules.SourceCode.scriptURL`, which is `undefined` on RN 0.81 / the new architecture, so every app fell back to `localhost` — the device itself. Confirmed by logcat | Host resolved from `expo-constants` (`hostUri`), then scriptURL, then `10.0.2.2` on an emulator. All three apps |
| **`GET /classes` returned every class on the platform.** A teacher at one school saw another school's class, and the app picked it as their "active" class | Scoped by role: teacher → own classes, principal → own school, admins → all |
| **`data: null` was turned into a truthy object.** `payload?.data ?? payload` fell through to the whole envelope, so "no current lesson" rendered as a lesson in progress. All five apps | Envelope unwrapped by checking for the `data` key |
| **`parent_children` had no write path anywhere** — only the demo seed made a link, so a real parent's app was permanently empty | Link/unlink endpoints + a "Manage children" picker in the admin Users view |
| **LQS dimensions could not be created.** `PUT /lqs/dimensions` creates on an item without an id, but the Scoring view only rendered existing rows — a fresh install could never build the scale | Add/remove/rename/recolour rows in the Scoring view |
| School drawer read `totalLearners`/`totalTeachers`; the dashboard endpoint sends `learnerCount`/`teacherCount`, so both tiles always showed `-` | Reads the fields the API actually returns |
| `POST .../lessons` rejected `status`, so the new authoring form 400'd on create | `status` accepted on create |
| A learner with no certificate got a 404 — an ordinary state pushed into the error branch | Returns null with 200 |

Verified with the repo's own per-app harness (`test/api-verification/`) against
these fixes: **teacher 37/37, parent 13/13, learner 11/11**. Unit/e2e tests are
now **64**.

### Third pass — the remaining "known gaps", closed

The items §5 used to list as permanent gaps were implemented, and all three
mobile apps were brought onto one Expo SDK so every app runs on-device.

| Was | Now |
|---|---|
| **Media uploads were discarded.** `MediaService` kept records in an in-process array and never wrote the file, so an "uploaded" asset was a name with nothing behind it and the library vanished on restart | Files persist to disk (`StorageService`, `MEDIA_STORAGE_DIR`), records live in `media_library`, `GET /media/:id/file` streams them back. Upload without a file is now a 400 instead of a success |
| **AI returned a fixed placeholder** that reads to a learner as a real answer | Real Claude call via the official SDK, with conversation history and a tutor system prompt. With no credential configured it returns 503 with an actionable message — the apps surface it rather than faking a reply |
| **Certificates could not be issued and download was a stub** | `POST /lqs/certificates/learner/:id` issues one (`IGN-2026-0001`, verification id, school/course resolved); download renders the admin's HTML template with the learner's data |
| **Seeding was not transactional** — a mid-way failure left a half-seeded DB that the next boot skipped | Whole seed runs in one transaction. Verified by forcing a failure after 17 users were written: 0 rows survived |
| **Learner term progress could exceed 100%** (150% observed) — it counted distinct lesson *sessions* against total *lessons*, so a lesson taught twice counted twice | Counts distinct lessons and clamps to 100 |
| **Three apps on three Expo SDKs** (54/52/51); Expo Go hosts one at a time, so only the teacher app could run | All three on SDK 54. Learner and parent apps verified on the emulator with live data |

**Verified end-to-end on the emulator:** admin authors curriculum → unit →
lessons → publish → assign; teacher sees them, rates a learner against
admin-defined LQS dimensions; the learner's radar shows those scores (LQS 75);
the parent — linked through the new family-link endpoints — sees the child's
attendance, projects, homework and report.

Tests: **64 passing**. Per-app API harness: teacher 39/40, learner 11/11,
parent 13/13. The single teacher failure is `POST /ai/conversations` returning
503, which is the intended new behaviour on a server with no Anthropic
credential — set `ANTHROPIC_API_KEY` and it passes.

---

## 5. Known gaps

- **Not deployed.** Everything is deploy-ready; the step needs Dokploy
  credentials. `docs/DEPLOYMENT.md` has the exact steps and the live-URL checks.
- **File storage is local disk.** Uploads persist under `MEDIA_STORAGE_DIR`
  (default `apps/server/storage/media`). Fine for a single node; a multi-node
  deployment needs object storage behind the same `StorageService` interface.
- **The AI tutor needs a credential.** Without `ANTHROPIC_API_KEY` (or
  `ANTHROPIC_AUTH_TOKEN` / an `ant auth login` profile) `/ai/conversations`
  returns 503 by design. Nothing else depends on it.
- **Certificates render as HTML**, not PDF — the admin's template is HTML, so
  this prints exactly what they designed and any browser saves it as PDF. A
  server-side PDF would need a headless-browser dependency.
- **Test coverage is still partial** — auth, LQS, class enrolment and homework
  scoping are covered. Attendance and curriculum services have no unit tests.
- **The three mobile apps have not had the same QA pass.** The teacher app
  drives the endpoints whose guards were missing, so it is the first place to
  re-test now that those routes enforce `teacher`.
- **Bulk CSV import was never executed** during QA — running it creates real
  users, so it was inspected but not run.
- **Lesson authoring covers the teachable core** (title, order, duration, week,
  theme, big idea, essential question, status). The deeper NERDC and
  engineering sections are still API-only.

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

1. Re-run the §4b role probes against the **teacher app** — it is the client for
   every route that just gained a guard.
2. Deploy to Dokploy and curl the live URL (§5, `docs/DEPLOYMENT.md`).
3. Add object storage and a real upload endpoint — the last functional gap.
4. Point the apps at the deployed API (`API_BASE_URL_OVERRIDE` in each
   `src/config.js`) and test on real devices.
5. Broaden tests to attendance and curriculum.
6. Merge `feat/backend-integration-completion` into `master`.
