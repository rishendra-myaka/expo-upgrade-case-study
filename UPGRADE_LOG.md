# Upgrade log: Expo SDK 48 → 58

Starting point: the official Expo `tabs` template at SDK 48 (expo-router v1, React Native 0.71, React 18.2, TypeScript 4.9), created with `create-expo-app --template tabs@48`.
Method: one SDK at a time, following Expo's upgrade guide: `npm install expo@^N`, then `npx expo install --fix`, then fix what breaks. After every step: typecheck, `expo-doctor`, and a web export, committed separately so each step can be reviewed on its own.

Machine: Windows 11, Node 24, npm 11 (deliberately a modern toolchain, as an agency would have today).

## SDK 48 (baseline)

- Web export: works.
- Typecheck: **fails before any change.** `@types/node` (pulled in by a dependency with a loose version range) now ships syntax that TypeScript 4.9 cannot parse (`node_modules/@types/node/ffi.d.ts`). The app code is fine; the toolchain has rotted. Typical of old projects re-installed today.

## SDK 49 (React Native 0.72, expo-router v2, TypeScript 5.1)

- `npm install expo@^49.0.0` then `npx expo install --fix`: expo-router 1 → 2, TypeScript 4.9 → 5.1.
- Typecheck: **passes again** (TypeScript 5.1 can read the new `@types/node`).
- `expo-doctor`: 15/16. Warns that SDK 49 targets Android API 33, which Google Play stopped accepting for updates after 31 Aug 2024. Fixed by SDK 50.
- Web export: **fails on Windows with Node 24**: `ENOENT ... mkdir '.expo\metro\externals\node:sea'`. The SDK 49 CLI creates a shim folder for every Node built-in module; newer Node versions added `node:sea`, and `:` is not allowed in Windows folder names. Not an app bug. Workarounds: use the Node version SDK 49 supported (18 LTS) for this step, or continue to SDK 50, whose CLI handles it. I continued.

## SDK 50 (React Native 0.73, expo-router v3)

Breaking changes fixed:
- **`<SplashScreen />` component removed from expo-router.** Replaced with `expo-splash-screen`: `preventAutoHideAsync()` at module level, `hideAsync()` once fonts load, render nothing until then (`app/_layout.tsx`).
- **`Link`'s `hrefAttrs` prop removed.** Use the plain `target="_blank"` prop (`components/ExternalLink.tsx`).
- **`expo-router/babel` plugin deprecated**: `babel-preset-expo` now includes it, so it was removed from `babel.config.js`.

- **Missing peer dependency**: expo-router v3 needs `expo-constants` installed directly (`expo-doctor` flagged it; without it the app can crash outside Expo Go). Installed with `npx expo install expo-constants`.

Results: typecheck passes; `expo-doctor` passes after the fix, and the Android API 33 store warning from SDK 49 is gone. Web export still hits the same Windows + Node 24 `node:sea` folder problem in the SDK 50 CLI; continuing.
