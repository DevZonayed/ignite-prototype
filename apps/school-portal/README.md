# IGNITE — School Portal

A React (JavaScript) + Vite port of the IGNITE School principal portal for Bright Future Academy.

## Views

Overview (KPI tiles, attendance trend, curriculum coverage, teacher activity, needs-attention), Teachers, Learners, Classes, Curriculum (unit accordion), Homework compliance, Attendance (heat-map + assessment tabs), Reports, Settings.

## Features

- Sidebar navigation with active-view highlighting and updating page title.
- Light/dark theme toggle (top bar + Settings), persisted to `localStorage` key `ignite_theme`, honoring `prefers-color-scheme`.
- Right slide-in detail drawer for teacher/learner rows.
- Curriculum accordion expand/collapse, Attendance tab switching, toast notifications.

## Run

```bash
npm install
npm run dev      # start dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Stack

Vite 5 · React 18 · plain JavaScript (`.jsx`). Fonts (Nunito + Inter) loaded via `<link>` in `index.html`.
