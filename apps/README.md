# IGNITE — Five Working Apps (real implementations)

Production-style implementations of the five IGNITE prototypes in `/design/pages/*.html`.
Two web portals (React JS + Vite) and three mobile apps (React Native + Expo).
Shared design language documented in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).

| App | Folder | Platform | Stack | Ports design |
|-----|--------|----------|-------|--------------|
| IGNITE Admin | [`admin-portal/`](./admin-portal) | Web | React 18 + Vite (JS) | `design/pages/admin.html` |
| School portal | [`school-portal/`](./school-portal) | Web | React 18 + Vite (JS) | `design/pages/school.html` |
| Teacher | [`teacher-app/`](./teacher-app) | iOS/Android | React Native + Expo | `design/pages/teacher.html` |
| Learner | [`learner-app/`](./learner-app) | iOS/Android | React Native + Expo | `design/pages/learner.html` |
| Parent | [`parent-app/`](./parent-app) | iOS/Android | React Native + Expo | `design/pages/parent.html` |

Every app ships light **and** dark themes (persisted), all screens, all sample data, and all
interactions from its prototype (navigation, drawers, accordions, tabs, LQS rubric rating,
radar chart, attendance heat-map, child switcher, message threads, toasts, etc.).
Sample content only — no real learner data.

## Run the web portals

```bash
cd apps/admin-portal   # or apps/school-portal
npm install
npm run dev            # Vite dev server → http://localhost:5173
npm run build          # production build to dist/
```

## Run the mobile apps

```bash
cd apps/teacher-app    # or learner-app / parent-app
npm install
npx expo start         # press i (iOS), a (Android), or w (web)
```

The mobile apps use `react-native-svg` for icons/charts, `@react-native-async-storage/async-storage`
for theme persistence, and Nunito + Inter via `@expo-google-fonts`.

## Verification status
- **admin-portal / school-portal** — `npm run build` passes; verified rendering + navigation in-browser.
- **teacher-app / learner-app / parent-app** — `npx expo export` bundles cleanly (no syntax/import errors).
