# TOSOL Mobile (Seller ERP)

React Native seller app — migrated from legacy TOSOL with Gluestack + NativeWind UI.

## Stack

- React Native 0.81, Redux Toolkit, React Navigation 7
- Gluestack UI + NativeWind (teal brand)
- TOSOL API v2 (`src/services/`)

## Run

```bash
npm install
cd ios && pod install && cd ..
npm start
npm run ios   # or npm run android
```

## Architecture

See [docs/MIGRATION.md](docs/MIGRATION.md) for feature inventory and migration status.

- `src/services/` — API clients + Redux slices (from TOSOL)
- `src/mappers/` — API → UI transforms
- `src/features/` — Seller domain screens & navigation
- `src/features/shared/ui/` — Gluestack list/detail patterns
- `src/uikits/` — Design system primitives

## Native IDs

| Platform | Bundle ID |
|---|---|
| Android | `com.tosol` |
| iOS | `com.tosoldev` |
