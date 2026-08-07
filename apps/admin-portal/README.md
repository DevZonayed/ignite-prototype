# IGNITE — Admin Portal

A faithful React (JavaScript) + Vite port of the static prototype in
`design/pages/admin.html`.

## Run

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
```

## Build

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Notes

- Plain JavaScript (`.jsx`), React 18, Vite.
- Nunito + Inter loaded from Google Fonts in `index.html`.
- CSS is ported verbatim from the prototype `<style>` block into `src/styles.css`.
- Light/dark theme toggles in the top bar and is persisted to `localStorage`
  under `ignite_theme` (honours `prefers-color-scheme` on first load).
- Views: Overview, Schools, Users, Imports, Curriculum, Media, Announcements,
  Scoring, AI services, Monitoring, Security & Audit, plus the locked Phase-3
  items (Analytics, Benchmarking).
