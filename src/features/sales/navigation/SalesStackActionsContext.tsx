import React, {
  createContext,
  use,
  useMemo,
  type ReactNode,
} from 'react';
import type { SalesMainStackProps } from './SalesMainStack';

export type SalesStackActions = Required<
  Pick<SalesMainStackProps, 'onOpenDrawer'>
> &
  Omit<SalesMainStackProps, 'onOpenDrawer'>;

const SalesStackActionsContext = createContext<SalesStackActions | null>(null);

export type SalesStackActionsProviderProps = {
  value: SalesStackActions;
  children: ReactNode;
};

export function SalesStackActionsProvider({
  value,
  children,
}: SalesStackActionsProviderProps) {
  return (
    <SalesStackActionsContext.Provider value={value}>
      {children}
    </SalesStackActionsContext.Provider>
  );
}

export function useSalesStackActions(): SalesStackActions {
  const ctx = use(SalesStackActionsContext);
  if (ctx == null) {
    throw new Error('useSalesStackActions requires SalesStackActionsProvider');
  }
  return ctx;
}
