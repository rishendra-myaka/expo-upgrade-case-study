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
