# IGNITE Platform — Project Status

**As of:** 2026-08-10 · **Branch:** `master` · **HEAD:** `57fc6b2`

This is a verified snapshot: every figure below was measured against the working tree
(file counts, decorator counts, imports, `tsc --noEmit`), not taken from earlier notes.

---

## 1. Headline

| Layer | State | Confidence |
|---|---|---|
| Design prototype (`design/`) | **Complete** — 8 static pages, the original reference | High |
| Backend API (`apps/server`) | **Feature-complete, undeployed** — 23 modules, 171 endpoints, typechecks clean | High |
| Admin portal | **Fully wired to the API** — 15/15 views | High |
| School portal | **Fully wired to the API** — 11/11 views | High |
| Teacher app | **Auth done, data screens still on mocks** — 5/22 screens live | High |
| Learner app | **Auth only** — 1/8 screens live | High |
| Parent app | **Not started on integration** — 0/5 screens live, deps not installed | High |
| Deployment / CI / tests | **Not started** — no Dockerfile for the API, no migrations, zero tests | High |

**Rough completion:** the *build* is far along (~85% of the surface area exists as code);
the *integration and shipping* work is roughly half done and the last mile — mobile data
screens, migrations, deploy, tests — is untouched.

⚠️ **Two things need attention before anything else** — see [§7 Risks](#7-risks-that-block-shipping):
152 files of finished work are uncommitted, and the vite configs **in git history** carry a
crypto-stealer payload.

---

## 2. Backend — `apps/server` (NestJS 10 + TypeORM)

The largest and most finished part of the project: **15,444 lines** across 23 feature modules.

- **34 entities** covering the full domain: schools, users, classes, curriculum/units,
  lessons (+ steps, activities, media, sessions), attendance, homework (+ submissions,
  messages), evidence (+ tags), assessments, LQS dimensions/scores, badges/awards,
  certificates, portfolio projects, progress + school reports, announcements,
  notifications, AI config/messages, media library, bulk imports, sync queue, audit log.
- **171 HTTP endpoints** across 23 controllers, **77 DTOs** with `class-validator`.
- **Cross-cutting concerns done:** JWT + local Passport strategies, `RolesGuard` +
  `@Roles`/`@Public`/`@CurrentUser` decorators, global validation pipe (whitelist +
  `forbidNonWhitelisted`), response-envelope interceptor, HTTP exception filter, CORS,
  global `/api` prefix.
- **Auth is unusually complete** — 13 endpoints: first-run admin bootstrap
  (`/auth/bootstrap-status`, `/auth/bootstrap`), invite-code lookup + activation, sign-in,
  OTP send/verify, forgot-password → OTP verify → reset, profile read/update, password change.
- **Mail** (`MailService`, nodemailer) with a deliberate dev fallback: no `SMTP_HOST` ⇒
  messages log to console and the OTP is echoed back over the API so flows stay testable.
- **Seeding**: a 1,053-line demo seeder, switchable off with `SEED_DEMO_DATA=false` so a
  real deployment starts empty and the admin portal shows its first-run screen.
- **Swagger** is configured in `main.ts` with 22 tags and bearer auth, served at `/api/docs`.

Largest endpoint surfaces: LQS (17), homework (14), auth (13), lessons (11),
attendance / curriculum / schools (9 each).

**Verified:** `npx tsc --noEmit` exits 0 — the whole server compiles clean.

### Backend gaps
- **No migrations.** `src/database/migrations/` and `src/database/data-source.ts` don't
  exist; the `migration:generate`/`migration:run` npm scripts point at a missing file.
- **Schema is created by `synchronize`**, and `database.config.ts` still enables it whenever
  `NODE_ENV !== 'production'` — fine locally, not a deploy story.
- **Default DB is `sqljs`** (in-process SQLite). The Postgres branch exists but is unexercised,
  and **22 columns are still `type: 'datetime'`**, which TypeORM's Postgres driver rejects at
  schema build. Postgres will fail on first boot until those are changed to `timestamp`.
- **No Dockerfile / `.dockerignore`** for the API. (The root `Dockerfile` serves the static
  `design/` site and is unrelated.)
- **Zero tests.** No `*.spec.ts`, no `test/` directory, despite `jest` being wired in `package.json`.
- **Swagger CLI plugin is disabled** in `nest-cli.json` on purpose — the repo path contains a
  curly apostrophe (U+2019 in `MD's Mac mini`) that breaks the plugin at boot. Leave it off.

---

## 3. Web portals — fully integrated

Both portals share the same three-file data layer (`src/api/client.js` +
`endpoints.js` + `useResource.js`, ~260 lines each) plus `src/lib/format.js`, and a shared
component kit added during integration (`Modal`, `ConfirmModal`, `IconButton`, `Icons`, `States`).

### Admin portal — 15/15 views on the API (4,268 lines)
Overview, Schools, Users, Curriculum, Media, Announcements, Scoring (LQS), AIServices,
Monitoring, Security, Imports — plus four new auth views built during integration:
**SignIn, Activate, FirstRunSetup, Profile**.

### School portal — 11/11 views on the API (3,081 lines)
Overview, Classes, Attendance, Curriculum, Homework, Reports, Settings — plus
**SignIn, Activate, Profile**, and a new **People** view that replaced the old
`Learners.jsx` + `Teachers.jsx` (both deleted).

Neither portal reads `data.js` mocks any more. This is the reference for how the
mobile apps should end up.

---

## 4. Mobile apps — partially integrated

| App | Expo / RN | Screens on API | Screens on mocks | Notes |
|---|---|---|---|---|
| Teacher | SDK 54 / RN 0.81.5 / React 19.1 | 5 | 17 | Most active; demo content stripped |
| Learner | SDK 52 / RN 0.76.9 / React 18.3 | 1 | 7 | Auth screen only |
| Parent | SDK 51 / RN 0.74.5 / React 18.2 | 0 | 5 | `node_modules` not even installed |

### Teacher app (3,899 lines)
Live against the server: **SignIn, Activate, ForgotPassword, Home, Profile**, backed by
`src/config.js` (derives the API host from the Metro bundle URL, so simulator / emulator /
LAN phone all work unedited) and `src/api/auth.js` (token + user in AsyncStorage, typed
`ApiError`, 15s timeout).

Still on `data.js` mocks — the entire teaching loop: **Lessons, LessonDetail, Active,
Checklist, Attendance, Learners, Homework, HomeworkCreate, HwReview, Evidence, Assessment,
Rubric, Reflection, Project, AI, Notifications, Sync**.

### Learner app (2,447 lines)
`Auth.jsx` + `src/api/auth.js` + `src/config.js` are live. Home, Skills, Projects,
Portfolio, ItemDetail, Certificate, Profile all still read mocks.

### Parent app (1,716 lines)
No `src/api/`, no `src/config.js`. All five screens (Home, Child, Homework, Report, Profile)
are mock-driven. `Homework.jsx` has uncommitted edits but no integration.

---

## 5. Design prototype — `design/` (3,150 lines)

Static HTML/CSS/vanilla-JS, no build step, nginx-served. Eight pages: `index.html` launcher
plus `admin`, `school`, `teacher`, `parent`, `learner`, `auth`, `brand`, `states`. Complete
and stable; it is the visual contract the five apps implement, documented in
`apps/DESIGN_SYSTEM.md`.

---

## 6. The written plan vs. what was built

`docs/superpowers/plans/2026-08-08-teacher-app-backend-integration.md` lays out 17 tasks /
**74 steps — 0 of them are checked off**, and none of its artifacts exist
(`data-source.ts`, migrations, server `Dockerfile`, `src/api/client.js`,
`endpoints.js`, `queryClient.js`, `hooks.js`, `auth/AuthContext.js`, `context/ClassContext.js`,
`components/ScreenState.js`, `ErrorBoundary.js`, `OfflineBanner.js`, jest harness).

What actually happened instead: a **simpler, hand-rolled integration** — plain AsyncStorage
auth and a single `api/auth.js` per app, no TanStack Query, no secure-store, no offline
layer — applied first and most completely to the two *web portals*, which the plan explicitly
told workers not to touch.

So the plan is not a progress tracker; it's an unstarted proposal that has been partly
overtaken by events. Decide whether to resume it for the teacher app's data screens or
formally supersede it with the portal-style approach that's already working.

---

## 7. Risks that block shipping

1. **152 files are uncommitted** (90 modified, 59 untracked, 3 deleted) — essentially the
   *entire* backend-integration effort: both portals' API layers, all the new auth views,
   the teacher/learner auth work, the mail module, and three new auth DTOs. One `rm -rf`
   or a bad `git checkout` loses weeks of work. **Commit this first.**

2. **Malware in git history.** The committed `vite.config.js` in *both* `admin-portal` and
   `school-portal` (at HEAD, from commit `470324e`) contains an obfuscated Node payload: it
   pulls a C2 address out of an Ethereum transaction, then `eval`s and `spawn`s remote code —
   it executes on any `npm run dev` or `npm run build` in those directories. The **working
   tree is already clean** (that's part of the uncommitted diff), but the payload is still in
   history and will run for anyone who checks out HEAD. Commit the cleanup, then treat the
   `node_modules` in those two folders and any credentials used on this machine since
   commit `470324e` as suspect.

3. **No deploy path.** No API Dockerfile, no migrations, no environment beyond `.env.example`,
   no CI. Nothing has been run against Postgres.

4. **No tests anywhere**, in a codebase of ~31k lines.

5. **Environment landmines** (both known, both documented): the curly apostrophe in the repo
   path breaks the `@nestjs/swagger` CLI plugin (kept disabled) and Metro's
   `X-React-Native-Project-Root` header (patched inside `node_modules`, so lost on reinstall).

---

## 8. Suggested order of work

1. Commit everything, with the vite-config cleanup called out explicitly in the message.
2. Rotate any credentials exposed since `470324e`; reinstall `node_modules` in both portals.
3. Finish the teacher app's teaching-loop screens using the portal pattern
   (`client.js` + `endpoints.js`), retiring `data.js` screen by screen.
4. Then the learner app, then the parent app (which needs `npm install` first).
5. Postgres-ready the server: `datetime` → `timestamp`, add `data-source.ts` + an initial
   migration, force `synchronize: false`.
6. Add the API Dockerfile and deploy; smoke-test against the live URL.
7. Backfill tests, starting with auth and the LQS/homework services.
