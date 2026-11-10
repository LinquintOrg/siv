# Steam Inventory Value

Android app for checking the value of Steam inventories. Built with Expo (SDK 57), Expo Router and React Native Paper (Material 3).

The app is a thin client for the [SIVExpress](https://github.com/linquint/SIVExpress) API. It needs no login and holds no API keys.
Favourites, recent searches and settings are stored on the device. Crash reports go to Sentry (see below).

## Features

- Look up a profile by SteamID64, profile link or custom URL
- Inventory value per game, with sort and filter, 30-day value history and leaderboard rank
- Item details: market price, price changes, averages, stickers, patches and charms
- Leaderboard by game
- Music kits with prices and MVP anthem previews
- 30+ display currencies, light and dark theme

## Development

```bash
yarn install
yarn start        # then press "a" for Android, or scan the QR code with a development build
yarn lint
yarn typecheck
```

The API defaults to `https://api.linquint.dev` (set explicitly for release builds in `eas.json`). Point it at a local backend with:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000 yarn start
```

Expo Go may work for quick checks, but test on a development build to match release behaviour:
`eas build --profile development -p android`.

## Crash reports (Sentry)

Release builds send crashes and errors to Sentry (`src/utils/sentry.ts`); development builds don't. Nothing that
identifies the user is attached (`sendDefaultPii` is off), a tenth of sessions also report screen load times, and the
user can turn reports off in Settings › Privacy: Sentry only starts once the saved settings have loaded and say it's on,
and closes (native SDK included) when it's turned off. The DSN is in `src/utils/sentry.ts` (overridable with
`EXPO_PUBLIC_SENTRY_DSN`), because OTA updates don't get the build profile's variables.

Stack traces are only readable with source maps. Uploading them is off for now (`SENTRY_DISABLE_AUTO_UPLOAD` in
`eas.json`), since a build without credentials would fail. To turn it on:

1. Create an auth token in Sentry (an organisation token, Settings › Auth Tokens) and add it to the project's environment
   variables on expo.dev as `SENTRY_AUTH_TOKEN`, with secret visibility, for production
2. Add `SENTRY_ORG` and `SENTRY_PROJECT` (the organisation and project slugs) to the `production` profile's `env` in
   `eas.json`, or to the `@sentry/react-native` plugin options in `app.json`
3. Remove `SENTRY_DISABLE_AUTO_UPLOAD` from the `production` profile

OTA updates (`eas update`) need their source maps uploaded separately, after the update:
`npx sentry-expo-upload-sourcemaps dist`.

## Project layout

```
src/
├── app/              Expo Router screens
│   ├── (tabs)/       Search, Leaderboard, Music kits, Settings
│   └── profile/      Profile → inventory → item detail
├── api/              API client, response types and TanStack Query hooks
├── components/       Shared UI
├── stores/           Zustand stores persisted with AsyncStorage
├── utils/            Currency formatting and Steam helpers
└── theme.ts          Material 3 colour schemes
```

The previous app (Expo 51) is kept in `legacy/` for reference.
