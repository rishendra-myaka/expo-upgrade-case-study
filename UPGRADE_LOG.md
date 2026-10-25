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

## SDK 51 (React Native 0.74, expo-router 3.5, TypeScript 5.3)

- No code changes needed.
- Typecheck passes; `expo-doctor` 17/17; **web export works again**: the SDK 51 CLI no longer trips over the `node:sea` built-in on Windows.

## SDK 52 (React Native 0.76, React 18.3, expo-router v4, React Navigation 7)

The hardest step so far: no app code changed, but the dependency tree did.
- `npx expo install --fix` left `@react-navigation/native` on v6, while expo-router v4 needs v7. Installing v7 explicitly pulled the **newest** 7.x (7.5), and the web build then failed with `Unable to resolve module query-string` inside `expo-router/build/fork/getPathFromState.js`.
- Cause: expo-router 4 still imports `query-string`, which used to arrive through older React Navigation 7.0 packages; the latest React Navigation internals no longer bring it. Expo's range `^7.0.14` allows the newer version, so it is easy to land here.
- Fix: add `query-string@^7.1.3` as a direct dependency (expo-router's code uses its v7 CommonJS API), keep `@react-navigation/native` at Expo's expected range `^7.0.14`, and install the new `expo-asset` requirement.
- Results: typecheck passes, `expo-doctor` 18/18, web export works.
- Lesson for clients: "it installs" is not "it builds". Run `expo-doctor` and a real export after every SDK step.

## SDK 53 (React Native 0.79, **React 19**, expo-router v5, TypeScript 5.8)

- `npx expo install --fix` stopped with **npm `ERESOLVE`**: the still-installed expo-router 4 had a peer range that excluded React Native 0.79, and the new expo-router 5 could not be installed while it was there. A deadlock that only shows up when upgrading in place.
- Fix: `npx expo install --fix -- --legacy-peer-deps` (lets npm replace the whole set in one go), then confirm with `expo-doctor` that every version now matches the SDK.
- Before that finished, the typecheck failed inside `expo/tsconfig.base.json` (`--module` value unknown): the new Expo base config needs TypeScript 5.4+, and the project was still on 5.3. Updated to 5.8 by the same command.
- expo-router 5 still imports `query-string`, so the direct dependency added at SDK 52 stays.
- Results: typecheck passes, `expo-doctor` 18/18, web export works.

## SDK 54 (React Native 0.81, React 19.1, expo-router v6, TypeScript 5.9)

- Upgraded with `--legacy-peer-deps` from the start (same in-place peer conflict as SDK 53).
- No code changes needed. Typecheck passes, `expo-doctor` 18/18, web export works.
- **Workaround removed:** expo-router 6 now lists `query-string` as its own dependency, so the direct dependency added at SDK 52 was uninstalled and everything re-checked. Temporary fixes should be removed as soon as upstream catches up; this log is how you remember to.
- Note for native builds: SDK 54 is the last SDK where the legacy React Native architecture is supported, and Android builds are edge-to-edge. This template has no custom native code, so nothing to change here; real client apps need a device check.

## SDK 55 (React Native 0.83, React 19.2, expo-router 55)

- From this SDK, expo-router's version number follows the SDK (55.x).
- **Breaking type change:** React Native 0.83's `useColorScheme()` can return `'unspecified'` as well as `'light' | 'dark' | null`. The template indexed its palettes with `Colors[colorScheme ?? 'light']`, which no longer typechecks (and would be `undefined` at runtime for `'unspecified'`).
- Fix: one small hook, `components/useTheme.ts`, that returns `'dark'` only for dark and `'light'` otherwise; used in `Themed.tsx` and the tab layout. One place to change instead of five.
- Results: typecheck passes, `expo-doctor` 20/20, web export works.

## SDK 56 (React Native 0.85, React 19.2.3, expo-router 56, TypeScript 6.0)

The biggest step. Followed Expo's guide: https://docs.expo.dev/router/migrate/sdk-55-to-56/
- **expo-router no longer works alongside `@react-navigation/*` in app code.** The web build failed with "As of SDK 56, expo-router is no longer compatible with react-navigation". Ran Expo's codemod, `npx expo-codemod sdk-56-expo-router-react-navigation-replace app` (and `components`), which moved `DarkTheme`, `DefaultTheme` and `ThemeProvider` to `expo-router/react-navigation`, then uninstalled `@react-navigation/native`.
- **Top-level `splash` config removed** (`expo-doctor` schema check). Moved the image, resize mode and background colour into the `expo-splash-screen` config plugin in `app.json`.
- **Tab icon colour type:** `tabBarIcon` now passes a `ColorValue`, not a `string`. Changed the `TabBarIcon` prop type.
- `expo-doctor` 21/22: one known issue, a **Hermes V1 memory regression** affecting SDK 56; Expo's advice is SDK 57 (expo ≥ 57.0.9). Left for the next step instead of patching around it.
- Typecheck passes, web export works.

## SDK 57 (React Native 0.86, expo-router 57)

- No code changes. The Hermes V1 memory regression flagged at SDK 56 is gone (React Native 0.86.3 ships the fixed Hermes).
- Typecheck passes, `expo-doctor` 21/21, web export works.

## SDK 58 (React Native 0.88, React 19.3, expo-router 58)

- **`Text` and `View` are function components** in React Native 0.88, so `DefaultText['props']` no longer exists. Changed to `React.ComponentProps<typeof DefaultText>` (`components/Themed.tsx`).
- **`ColorValue` can now be `null` or a processed number.** The icon library only accepts strings or platform colours, so `TabBarIcon` passes those through and falls back to the default otherwise.
- Results: typecheck passes, `expo-doctor` 20/20, web export works.
- **Runtime check** (web build served locally): Tab One renders, Tab Two renders, the modal opens from the header icon; no console errors from the app.

## Summary

| SDK | React Native | Code changes | Main problem |
| --- | --- | --- | --- |
| 48 | 0.71 | none (baseline) | old TypeScript can't read today's `@types/node` |
| 49 | 0.72 | none | Play Store target warning; SDK 49 CLI vs Windows + Node 24 |
| 50 | 0.73 | 3 | splash component removed, `hrefAttrs` removed, babel plugin, missing peer dep |
| 51 | 0.74 | none | (web export works again) |
| 52 | 0.76 | deps only | React Navigation 7 + missing `query-string` |
| 53 | 0.79 | deps only | npm peer-dependency deadlock; React 19 |
| 54 | 0.81 | none | removed the SDK 52 workaround |
| 55 | 0.83 | 1 hook | `'unspecified'` colour scheme |
| 56 | 0.85 | codemod + config | expo-router without React Navigation; splash config; Hermes regression |
| 57 | 0.86 | none | Hermes fix |
| 58 | 0.88 | 2 | function-component props, nullable `ColorValue` |

Not covered (no device in this exercise): native iOS/Android builds and on-device checks. For a client app I would also run an EAS development build on a real device at SDK 52 (New Architecture), 55 and 58.
