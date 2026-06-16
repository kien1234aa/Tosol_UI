import type { ViewStyle } from 'react-native';

/**
 * Root `View` for full-screen detail screens (overlay / stack). `minHeight: 0` is required so flex
 * descendants can shrink and `ScrollView` receives a bounded viewport instead of growing with content.
 */
export const detailScreenRoot: ViewStyle = {
  flex: 1,
  minHeight: 0,
  flexDirection: 'column',
};

/** Region below `SalesScreenHeader`: breadcrumb / toolbar + primary block. */
export const detailScreenMainCol: ViewStyle = {
  flex: 1,
  minHeight: 0,
  flexDirection: 'column',
};

/** Wraps main scroll column + optional `DetailQuickDock`. */
export const detailScreenBody: ViewStyle = {
  flex: 1,
  minHeight: 0,
  flexDirection: 'column',
};

/**
 * Column for hero / overview + tab shell (grows above bottom dock).
 * Same flex contract as `detailScreenBody` but kept separate for semantics.
 */
export const detailScreenMainColumn: ViewStyle = {
  flex: 1,
  minHeight: 0,
  flexDirection: 'column',
};

/** Tab strip + bounded vertical `ScrollView`. */
export const detailScreenTabShell: ViewStyle = {
  flex: 1,
  minHeight: 0,
  flexDirection: 'column',
};

/** Style for vertical `ScrollView` inside `detailScreenTabShell` (or full-page detail scroll). */
export const detailScreenScrollFlex: ViewStyle = {
  flex: 1,
  minHeight: 0,
};
