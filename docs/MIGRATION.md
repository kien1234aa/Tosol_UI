# TOSOL → Tosol_UI Migration Inventory

Base codebase: **Tosol_UI** (Gluestack + NativeWind)  
Logic source: **TOSOL** (seller ERP)

## Feature mapping

| TOSOL feature | Screens | Tosol_UI action | Status |
|---|---|---|---|
| auth | Login | Gluestack SellerLoginScreen + TOSOL auth slice | Done |
| sales | 15+ | SalesLayout / Orders tab | Done |
| category | 10+ | SalesLayout / Catalog tab | Done |
| goods | 8+ | SalesLayout / Goods tab | Done |
| finance | 8+ | SalesLayout / Finance tab | Done |
| settings | 6+ | SalesLayout side drawer | Done |
| push/notifications | FCM | Ported + Firebase config | Done |
| inbound/outbound/pack/transfer/combo | 10 | SalesLayout warehouse ops | Done |

## Deprecated consumer modules (removed)

- `src/redux/search`, `cart`, `consignment`, `home` (consumer)
- `src/screens/search`, `cart`, `consignment`, `wallet`, `estimate`
- Mock configs in `src/configs/`

## Architecture

```
src/
├── services/     ← ported from TOSOL (API + Redux slices)
├── mappers/      ← ported from TOSOL
├── features/     ← TOSOL domain logic; login uses Gluestack
├── shared/       ← i18n, api re-exports, theme, utils
├── locales/      ← vi/en/ja
├── navigation/   ← AppNavigator (auth gate → SalesLayout)
├── uikits/       ← Gluestack design system
└── features/shared/ui/  ← Gluestack list/detail patterns
```

## Native identity

| Platform | Bundle ID | Display name |
|---|---|---|
| Android | `com.tosol` | TOSOL |
| iOS | `com.tosoldev` | TOSOL |
