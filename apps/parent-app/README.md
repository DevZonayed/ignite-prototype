# IGNITE Parent App

A React Native (Expo, JavaScript) mobile app — a faithful port of the static
prototype at `design/pages/parent.html`.

## Screens (bottom-tab navigation)

- **Home** — child switcher dropdown (2 children), "This week" summary card, and
  action rows (homework due / teacher message / AI report ready).
- **Child** — tabs for Attendance / Portfolio grid / Skills dimensions + LQS.
  Title follows the active child.
- **Homework** — Smart Reading Lamp: instructions, teacher "how to help" media
  cards (tap → toast), upload drop (tap → toast), an in-progress upload row, and a
  live 2-way parent↔teacher message thread. Submit → toast.
- **Report** — published AI progress report with the "Reviewed by Mrs. Okafor"
  trust banner, "what went well", "skills growing" chips, and "next steps".
- **Profile** — linked children, privacy row, and a dark-theme toggle.

## Behaviours preserved

- Stack navigation: main tabs reset the stack; the bottom nav shows on the main set.
- Child switcher actually switches the active child (Amara Eze · JSS 1 ↔
  Kelechi Eze · P 5), updating the Child title and Report subtitle.
- Tab switching on the Child screen.
- Homework media/upload toasts and the message thread (type + send appends a
  bubble, teacher auto-replies).
- Light/dark theme toggle, persisted with AsyncStorage key `ignite_theme`.
- Bottom toast component.

## Requirements

- Node.js 18+
- Expo tooling via `npx expo`

## Install

```bash
cd apps/parent-app
npm install
```

## Run

```bash
npm run start      # Expo dev server (scan QR with Expo Go)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

## Verify the bundle

```bash
npx expo export --platform web
```

This runs Metro and surfaces any syntax/import errors without launching a device.

## Structure

```
src/
  App.jsx              # stack router + selected-child state + fonts
  theme.js             # light + dark tokens, font names
  ThemeContext.js      # ThemeProvider / useTheme (AsyncStorage persistence)
  data.js              # children array + homework thread data
  components/
    Icon.jsx           # react-native-svg icon set
    Toast.jsx          # bottom toast
    BottomNav.jsx      # floating bottom tab bar
    ChildSwitcher.jsx  # child dropdown
    Tabs.jsx           # underline tabs
  screens/
    Home.jsx
    Child.jsx
    Homework.jsx
    Report.jsx
    Profile.jsx
```

Fonts: Nunito (display) + Inter (UI) via `@expo-google-fonts/*`.
