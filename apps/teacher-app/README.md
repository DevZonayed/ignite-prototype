# IGNITE Teacher (Expo)

A faithful React Native (Expo) port of the static teacher prototype
(`design/pages/teacher.html`). Phone-app layout with a bottom tab bar,
light/dark theming, stack navigation, live lesson timer, rubric rating,
attendance, homework review threads, sync queue, and toasts.

## Run

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web),
or scan the QR code with the Expo Go app.

## Scripts

- `npm start` — start the Expo dev server
- `npm run ios` — open in iOS simulator
- `npm run android` — open in Android emulator
- `npm run web` — open in the browser

## Verify the bundle

```bash
npx expo export --platform web
```

## Structure

- `src/theme.js` — light + dark design tokens + font names
- `src/ThemeContext.js` — theme provider/hook, persisted with AsyncStorage key `ignite_theme`
- `src/data.js` — exact sample data arrays from the prototype
- `src/components/` — Icon library, Toast, ConfirmModal, BottomNav, shared UI (Card, Button, etc.)
- `src/screens/` — one file per screen
- `src/App.jsx` — phone shell + stack router
