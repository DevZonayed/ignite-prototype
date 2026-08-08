# IGNITE — Working Prototype: Page & Screen Plan (v2)

Derived from [../../research/prd.md](../../research/prd.md). **Each surface = one self-contained working app HTML** with real navigation (sidebar/bottom-nav routes between views), realistic dummy data, **light/dark theme toggle**, and working interactions (accordions, tabs, modals, toasts). No screenshot galleries.

Legend: ☐ todo · ◑ built · ✅ built + validated (nav routes, theme, interactions work).

---

## Global (applies to every app)
- ☐ Light + dark theme toggle, persisted (localStorage) — pattern from `admin.html`.
- ✅ Working router: nav item → shows that view, updates title + `#hash`. _(Added the missing `hashchange` listener + `pushState` on admin/school — browser back/forward now actually navigates; same fix applied to the React portals.)_
- ☐ Interactions actually work: **accordions** expand/collapse, **tabs** switch, **modals** open/close (destructive confirm, unsaved changes), **toasts**, segmented controls, theme.
- ✅ States represented in-app: loading skeleton, empty state, error/retry, offline banner. _(Shared `.skel`/`.gstate`/`.offbar` layer + `gstatic()/gload()` registry in all 5 files; offline banner binds real `online`/`offline` events; each surface has ↻ Reload / Empty / Error demo chips.)_
- ☐ Consistent brand tokens (research/brand.md) as CSS vars with `[data-theme="dark"]` overrides.

---

## A. Hub — `design/index.html`
- ☐ Clean **launcher** into the 5 working apps (Teacher / Learner / Parent / School / Admin) + Brand board. No captions/gallery. Light/dark toggle. Short "what each app is" line only.

## B. Admin web — `design/pages/admin.html`  ✅ WORKING (reference implementation)
Sidebar routes: **Overview ✅ · Schools ✅ · Users ✅ · Imports ✅ · Curriculum ✅ · Media ✅ · Scoring ✅ · Monitoring ✅ · Security & Audit ✅** · (Analytics, Benchmarking = Phase 3, locked ✅).
- ☐ **ADD: "AI" route** — per-school usage caps table, model-tier selector, lesson-assistant prompt scope, parent-report review policy toggle, usage-this-month chart. _(Currently missing — required by PRD §5.5/§6.)_
- ✅ Make the Curriculum unit tree an actual **accordion** (units expand/collapse); tree lesson click loads that lesson in the editor. _(Tree renders from a units array — 5 units / 24 lessons; unauthored lessons show an "not authored yet" empty state instead of another lesson's plan.)_
- ✅ Wire row actions (Manage/Edit) to a slide-over/modal (at least a working modal shell). _(`.drawer` slide-over already implemented.)_

## C. School web — `design/pages/school.html`  → REBUILD as working app
Sidebar routes: **Overview · Teachers · Learners · Classes · Curriculum · Attendance · Reports · Settings.** Light/dark.
- ☐ Overview — the 8 exact tiles + attendance chart + coverage bars + activity + "needs attention".
- ☐ Teachers — table + click → teacher detail panel.
- ☐ Learners — table (filter by class) + detail.
- ☐ Classes — class cards/list.
- ☐ Curriculum — coverage by unit/class (accordion).
- ☐ Attendance — heat table + assessment distribution (chart + table toggle).
- ✅ Reports — list of downloadable reports (empty/loading states).
- ☐ Settings — school profile + theme.

## D. Teacher app — `design/pages/teacher.html`  → REBUILD as working mobile app
One phone frame, **bottom nav routes: Home · Lessons · Learners · Homework · AI · Profile**; theme toggle; screens switch on tap.
- ☐ **Home** — greeting, class switcher, current lesson card → Start, stat row, sync pill.
- ☐ **Lessons** — curriculum sequence with **working accordion** units (done/current/locked) → lesson detail.
- ☐ Lesson detail → **Active-lesson workspace** (timer, action cards) → sub-screens:
  - ☐ Attendance (segmented P/A/L) · ☐ Activity checklist · ☐ Evidence capture · ☐ Assessment · ☐ Homework create · ☐ Project record.
- ☐ **Learners** — roster → learner detail (portfolio peek + **LQS rubric entry** 1–4 × 10 dims, save & next).
- ☐ **Homework** — list (pending/reviewed tabs) → review/feedback.
- ☐ **AI** — lesson-grounded assistant (chat + suggestion cards + safety note + composer).
- ☐ **Profile** — account + theme + sign out; **Sync queue** reachable; Notifications.
- ✅ States: offline banner, sync states, empty (no lessons), toast on save. _(Sync-queue Retry is honest: still-offline retries say so rather than claiming success.)_

## E. Learner app — `design/pages/learner.html`  → REBUILD as working mobile app
Bottom nav routes: **Home · Portfolio · Projects · Skills · Profile**; theme toggle.
- ☐ **Home** — greeting, streak, latest badge celebration, term ring, recent work.
- ☐ **Portfolio** — grid (Scratch/Python/robotics/design) → **item detail** (modal/sheet).
- ☐ **Projects** — project list.
- ☐ **Skills** — **live LQS radar** (10 real dims) + overall score + dimension list + "view as table" (working toggle to a table).
- ☐ **Profile** — Badges shelf (earned/locked) + **Certificate** view/download + theme.
- ✅ States: empty portfolio, badge-earned toast.

## F. Parent app — `design/pages/parent.html`  → REBUILD as working mobile app
Bottom nav routes: **Home · Child · Homework · Report · Profile**; **child switcher** (working dropdown); theme toggle.
- ☐ **Home/Child** — child switcher, this-week tiles, action cards.
- ☐ **Child** — attendance & activity + portfolio view + skills summary (tabs).
- ☐ **Homework** — assignment → **upload** (.sb3) + progress + feedback + resubmission.
- ☐ **Report** — **AI progress report** (teacher-reviewed badge, What went well / Skills / Next steps, sources note).
- ☐ **Profile** — linked children, privacy request, theme, sign out.
- ✅ States: empty (no child linked), report-ready toast.

---

> ✅ **2026-07-17 — ALL FIVE PORTALS BUILT & VALIDATED as working apps** (admin, school, teacher, learner, parent) + hub launcher. Working nav/routing, dummy data, light/dark theme, accordions, tabs, modals/toasts, child switcher, LQS radar & rubric all confirmed live.
>
> ✅ **2026-08-08 — remaining plan items closed.** Global states (skeleton / empty / error+retry / offline) built into all five prototypes; admin curriculum tree is a real accordion with lesson→editor loading; `hashchange` routing fixed on admin + school (design prototypes *and* `apps/admin-portal`, `apps/school-portal`). Verified by executing each page in jsdom — states replay, retry recovers, offline banner reacts to real network events, back/forward navigates, and no pre-existing interaction regressed.
>
> ☐ Still open: the admin **AI route** in `design/pages/admin.html` (it exists in `apps/admin-portal/src/views/AIServices.jsx` but was never back-ported to the prototype).

## Build order
1. **Admin** — ✅ done; add **AI route** + accordion wiring + modal shell.
2. **School** — rebuild working app (8 routes).
3. **Teacher** — rebuild working mobile app (bottom nav + sub-screens + rubric + AI).
4. **Learner** — rebuild working mobile app (radar + portfolio detail).
5. **Parent** — rebuild working mobile app (child switcher + upload + AI report).
6. **Hub** — clean launcher.
7. QA pass: every route, theme, accordion, modal, toast works across all five. Advance to complete.

---

### Historical note
The earlier section-by-section image catalogue and the coded-gallery pass are superseded by this working-prototype plan. Old image assets remain under `design/assets/` (unreferenced) per versioning rules.
