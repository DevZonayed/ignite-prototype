# IGNITE Learner (Expo)

A React Native (Expo, JavaScript) mobile app — a faithful port of the static
prototype at `design/pages/learner.html`. It reproduces the phone layout,
bottom tab bar, stack navigation, radar chart, badges, certificate, toasts, and
light/dark theme (persisted).

## Requirements

- Node 18+ and npm
- Expo SDK 52
- iOS Simulator / Android emulator, or the Expo Go app on a device (optional)

## Install

```bash
cd apps/learner-app
npm install
```

## Run

```bash
npm start        # Expo dev server (press i / a / w for iOS / Android / web)
npm run ios      # open iOS simulator
npm run android  # open Android emulator
npm run web      # run in the browser
```

## Verify the bundle (no simulator needed)

```bash
npx expo export --platform web
```

This runs the app through Metro and surfaces any syntax/import errors. A clean
run prints `Exported: dist`.

## Screens

Bottom-tab MAIN screens:

- **Home** — greeting + 5-day streak, "New badge" celebrate banner, Term 2
  progress ring (72%), Recent work list.
- **Portfolio** — 2-column project grid with type thumbnails (scratch / python /
  robot / design / video).
- **Projects** — full list of projects.
- **Skills** — Learner Quality Score badge (78) with Radar / Table tabs. The
  radar is a real 10-axis chart drawn with `react-native-svg` (rings at
  .25/.5/.75/1, axis labels, value polygon, coloured dots). The table lists each
  dimension with a colour dot and SECURE / DEVELOPING level.
- **Profile** — badges grid (earned vs locked), certificate card, and a Dark
  theme toggle.

SUB screens (pushed with a back button, bottom nav hidden):

- **Project detail** — preview (code or title), description, skills, and a
  "Share with parent" button that fires a toast.
- **Certificate** — full certificate with a "Download PDF" button that fires a
  toast.

## Behaviours preserved

- Stack router: main tabs reset the stack; sub screens push; back pops.
- Tapping recent-work / portfolio / projects opens that project's detail using
  the exact `projects` data from the prototype.
- Radar / Table tab toggle on the Skills screen.
- Theme toggle persisted via AsyncStorage key `ignite_theme`; colours switch to
  match the source `[data-theme="dark"]` tokens.
- Bottom toast component.

## Structure

```
App.js                      # entry -> ThemeProvider -> src/App
src/
  App.jsx                   # phone chrome + stack router state
  theme.js                  # light + dark tokens, fonts, gradients
  ThemeContext.js           # ThemeProvider / useTheme (+ AsyncStorage)
  data.js                   # projects / dims / badges + thumbnail helpers
  components/
    Icon.jsx                # react-native-svg icon set
    Gradient.jsx            # 135deg linear-gradient fill
    Toast.jsx
    BottomNav.jsx
    ProgressRing.jsx
    RadarChart.jsx
    common.jsx              # Card / PageTitle / SecTitle / SubHead
  screens/
    Home.jsx  Portfolio.jsx  Projects.jsx  Skills.jsx
    Profile.jsx  ItemDetail.jsx  Certificate.jsx
```

Fonts: Nunito (display) + Inter (UI) via `@expo-google-fonts/*`.
