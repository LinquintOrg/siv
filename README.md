# Steam Inventory Value

Android app for checking the value of Steam inventories. Built with Expo (SDK 57), Expo Router and React Native Paper (Material 3).

The app is a thin client for the [SIVExpress](https://github.com/linquint/SIVExpress) API. It needs no login and holds no API keys.
Favourites, recent searches and settings are stored on the device.

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
