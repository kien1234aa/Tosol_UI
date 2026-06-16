import React, {
  createContext,
  use,
  useMemo,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { AppRole } from '@features/auth/types/appRole';
import type { SalesSectionChromeNav } from './salesSectionNavConfig';
import {
  activeSectionNavButtonLabel,
  getSalesSectionChromeNavModel,
  translateSalesSectionChromeNav,
} from './salesSectionNavConfig';

export type SalesShellNavContextValue = {
  activeDrawerId: string;
  navigateByDrawerId: (drawerId: string) => void;
  sectionNav: SalesSectionChromeNav | null;
  /** Nhãn hiện trên nút dropdown (mục con đang chọn). */
  sectionNavButtonLabel: string | null;
  menuShops: { id: number; name: string }[];
};

export const SalesShellNavContext =
  createContext<SalesShellNavContextValue | null>(null);

export type SalesShellNavProviderProps = {
  activeDrawerId: string;
  navigateByDrawerId: (drawerId: string) => void;
  menuShops: { id: number; name: string }[];
  appRole: AppRole;
  children: ReactNode;
};

export function SalesShellNavProvider({
  activeDrawerId,
  navigateByDrawerId,
  menuShops,
  appRole,
  children,
}: SalesShellNavProviderProps) {
  const { t } = useTranslation();

  const value = useMemo((): SalesShellNavContextValue => {
    const model = getSalesSectionChromeNavModel(
      activeDrawerId,
      menuShops,
      appRole,
    );
    const sectionNav = model ? translateSalesSectionChromeNav(model, t) : null;
    return {
      activeDrawerId,
      navigateByDrawerId,
      sectionNav,
      sectionNavButtonLabel: activeSectionNavButtonLabel(
        model,
        activeDrawerId,
        t,
      ),
      menuShops,
    };
  }, [activeDrawerId, navigateByDrawerId, menuShops, appRole, t]);

  return (
    <SalesShellNavContext.Provider value={value}>
      {children}
    </SalesShellNavContext.Provider>
  );
}

export function useSalesShellNavOptional(): SalesShellNavContextValue | null {
  return use(SalesShellNavContext);
}
