# IGNITE — Shared Design System (source of truth for all 5 apps)

All apps are faithful ports of the static prototypes in `/design/pages/*.html`.
Match colours, spacing, typography, screens, sample data and interactions exactly.

## Brand tokens (light)
```
--brand:        #2563EB   brand-700: #1D4ED8   brand-soft: #EFF6FF
--ignite:       #F97316   ignite-amber: #FBBF24  ignite-grad: 135deg #FBBF24 → #F97316
--violet:       #7C3AED   teal: #14B8A6
--success:      #16A34A   warning: #D97706   danger: #DC2626
--ink:          #172554
--bg:           #F1F5F9 (web) / #F5F7FB (mobile page bg #e8edf5)
--surface:      #FFFFFF   surface-2: #F8FAFC / #F1F5F9   border: #E2E8F0 / #E6EBF2
--text:         #0F172A   text-muted: #475569   text-subtle: #64748B
--sidebar:      #0F1E3D   sidebar-text: #9FB0CC   sidebar-active: #2563EB
```

## Brand tokens (dark)
```
--brand:#3B82F6  brand-soft:#17233f  bg:#0A0F1C / mobile #0b1220  surface:#111a2e
surface-2:#0e1626 / #16223b  border:#243049  text:#E7EDF7  text-muted:#A6B4CE  text-subtle:#7686A5
--sidebar:#0b1324  hero1:#05070d  hero2:#0e1e42
```

## Typography
- Display/headings font: **Nunito** (weights 700/800/900). CSS var `--fd`.
- UI/body font: **Inter** (400/500/600/700). CSS var `--fu`.
- Web: load from Google Fonts. Mobile (Expo): use `@expo-google-fonts/nunito` + `@expo-google-fonts/inter` with `expo-font`.

## Radii
sm 8px, md 12px, lg 16px, cards 14–22px, pills/full 999px.

## The five apps
| App | Platform | Tech | Design file |
|-----|----------|------|-------------|
| IGNITE Admin | Web | Vite + React (JS) | design/pages/admin.html |
| School portal | Web | Vite + React (JS) | design/pages/school.html |
| Teacher | Mobile | Expo (React Native) | design/pages/teacher.html |
| Learner | Mobile | Expo (React Native) | design/pages/learner.html |
| Parent | Mobile | Expo (React Native) | design/pages/parent.html |

## Rules
- Reproduce EVERY screen/view, all sample data, all interactions (nav, drawers, accordions,
  tabs, rubric rating, theme toggle, toasts, child switcher, radar chart, heat-map, charts).
- Light + dark theme on every app, toggled in-app, persisted (localStorage web / AsyncStorage mobile).
- Web apps: keep the exact class names + CSS from the HTML `<style>` block for fidelity; convert
  markup + inline vanilla JS into React components with state/hooks.
- Mobile apps: translate to RN primitives (View/Text/ScrollView/Pressable), StyleSheet, and
  `react-native-svg` for icons/radar/rings. Keep the phone-app layout with bottom tab bar.
- Sample content only — no real learner data.
