# Expo upgrade case study: SDK 48 → 58

The official Expo `tabs` starter from **SDK 48** (2023: React Native 0.71, expo-router v1) upgraded **one SDK at a time to SDK 58** (React Native 0.88, React 19.3), the way I would upgrade a client's app.

Every step is its own commit, with typecheck, `expo-doctor` and a web export run after it. Read the full **[upgrade log](UPGRADE_LOG.md)** for the error messages, causes and fixes.

## Highlights

- **SDK 50**: expo-router v3 removed `<SplashScreen />` and `Link hrefAttrs`; a missing `expo-constants` peer dependency that only `expo-doctor` caught.
- **SDK 52**: expo-router v4 with React Navigation 7. The build broke on `query-string`, a helper that newer React Navigation no longer brings. Added it directly, then **removed the workaround at SDK 54** when expo-router started declaring it.
- **SDK 53**: an npm peer-dependency deadlock between the old and new expo-router, solved in one controlled install.
- **SDK 55**: React Native 0.83's new `'unspecified'` colour scheme, fixed once in a small `useTheme` hook.
- **SDK 56**: expo-router no longer works alongside `@react-navigation/*`; used Expo's codemod and moved splash settings into the plugin. A known Hermes memory regression was resolved by going to SDK 57 rather than patching around it.
- **SDK 58**: React Native 0.88 types (function-component props, nullable colours).

Result at SDK 58: typecheck clean, `expo-doctor` 20/20, web build renders and navigates with no console errors.

## Need this done on your app?

I do Expo upgrades for agencies: https://rishendra-myaka.github.io

## Credits

Starter code: the Expo `tabs` template (© 650 Industries, MIT). Upgrade work and write-up: Rishendra Myaka, 2026.
