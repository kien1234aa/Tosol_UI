import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppLogo } from '@shared/components/ui/AppLogo';
import { Button } from '@shared/components/ui/Button';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import { includeShopLinksInSalesNav } from '@features/auth/utils/roleNavPolicy';
import { logout } from '@services/auth/authSlice';
import { fetchSalesMenuShops } from '@services/settings/shopSlice';
import {
  categorySectionNavForAppRole,
  financeSectionNavForAppRole,
  goodsSectionNavForAppRole,
  resolveSectionNavItemLabel,
} from '../navigation/salesSectionNavConfig';

type TopNavDef = {
  id: string;
  labelKey: string;
  icon: SystemIconName;
  chevron?: boolean;
};

const TOP_NAV_DEFS: TopNavDef[] = [
  { id: 'dashboard', labelKey: 'nav.drawerMenu.dashboard', icon: 'home' },
  {
    id: 'sales',
    labelKey: 'nav.drawerMenu.sales',
    icon: 'cart',
    chevron: true,
  },
  {
    id: 'category',
    labelKey: 'nav.drawerMenu.category',
    icon: 'grid',
    chevron: true,
  },
  {
    id: 'goods',
    labelKey: 'nav.drawerMenu.goods',
    icon: 'layers',
    chevron: true,
  },
  {
    id: 'finance',
    labelKey: 'nav.drawerMenu.finance',
    icon: 'wallet',
    chevron: true,
  },
  {
    id: 'settings',
    labelKey: 'nav.drawerMenu.settings',
    icon: 'settings',
    chevron: true,
  },
];

type SalesSubNavRow = {
  id: string;
  labelKey: string;
  badge: 'orders' | 'shipments' | 'returns';
  badgeTone?: 'teal' | 'red';
};

const SALES_SUB_NAV: readonly SalesSubNavRow[] = [
  {
    id: 'sales:orders-all',
    labelKey: 'nav.drawerMenu.allOrders',
    badge: 'orders',
    badgeTone: 'red',
  },
  {
    id: 'sales:shipping',
    labelKey: 'nav.drawer.shipping',
    badge: 'shipments',
    badgeTone: 'teal',
  },
  {
    id: 'sales:returns',
    labelKey: 'nav.drawer.returns',
    badge: 'returns',
    badgeTone: 'red',
  },
];

const SETTINGS_ITEMS = [
  {
    id: 'settings:shops',
    labelKey: 'nav.drawer.shops',
    icon: 'store' as const,
  },
  {
    id: 'settings:bank-accounts',
    labelKey: 'nav.drawer.bankAccounts',
    icon: 'card' as const,
  },
  {
    id: 'settings:carriers',
    labelKey: 'nav.drawer.carriers',
    icon: 'truck' as const,
  },
  {
    id: 'settings:webhooks',
    labelKey: 'nav.drawer.webhooks',
    icon: 'server' as const,
  },
  {
    id: 'settings:staff',
    labelKey: 'nav.drawer.staff',
    icon: 'person' as const,
  },
] as const;

export type SalesDrawerMenuProps = {
  activeId?: string;
  onNavigate?: (id: string) => void;
  onClose: () => void;
};

export function SalesDrawerMenu({
  activeId = 'dashboard',
  onNavigate,
  onClose,
}: SalesDrawerMenuProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const { mode, toggleMode } = useThemeMode();
  const styles = useThemeStyleSheet(create_SalesDrawerMenu_styles);

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const loggingOut = useAppSelector(s => s.auth.loggingOut);
  const appRole = useAppSelector(selectNormalizedAppRole);
  const { menuShops, menuLoading, menuError } = useAppSelector(s => s.shop);
  const showSalesShopRows = includeShopLinksInSalesNav(appRole);
  const categoryNavRows = useMemo(
    () => categorySectionNavForAppRole(appRole),
    [appRole],
  );
  const goodsNavRows = useMemo(
    () => goodsSectionNavForAppRole(appRole),
    [appRole],
  );
  const financeNavRows = useMemo(
    () => financeSectionNavForAppRole(appRole),
    [appRole],
  );
  const orderListTotal = useAppSelector(s => s.order.meta?.total);
  const returnListTotal = useAppSelector(s => s.returnOrder.meta?.total);
  const shipmentListTotal = useAppSelector(s => s.shipment.meta?.total);

  const salesDrawerBadgeCount = (
    kind: SalesSubNavRow['badge'],
  ): number | null => {
    if (kind === 'orders') {
      return orderListTotal ?? null;
    }
    if (kind === 'returns') {
      return returnListTotal ?? null;
    }
    return shipmentListTotal ?? null;
  };
  const [salesOpen, setSalesOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [goodsOpen, setGoodsOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchSalesMenuShops());
  }, [dispatch]);

  useEffect(() => {
    if (activeId.startsWith('sales:')) {
      setSalesOpen(true);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId.startsWith('category:')) {
      setCategoryOpen(true);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId.startsWith('goods:')) {
      setGoodsOpen(true);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId.startsWith('finance:')) {
      setFinanceOpen(true);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId.startsWith('settings:')) {
      setSettingsOpen(true);
    }
  }, [activeId]);

  const salesParentActive = useMemo(
    () => activeId === 'sales' || activeId.startsWith('sales:'),
    [activeId],
  );

  const categoryParentActive = useMemo(
    () => activeId === 'category' || activeId.startsWith('category:'),
    [activeId],
  );

  const goodsParentActive = useMemo(
    () => activeId === 'goods' || activeId.startsWith('goods:'),
    [activeId],
  );

  const financeParentActive = useMemo(
    () => activeId === 'finance' || activeId.startsWith('finance:'),
    [activeId],
  );

  const settingsParentActive = useMemo(
    () => activeId === 'settings' || activeId.startsWith('settings:'),
    [activeId],
  );

  return (
    <View style={[styles.shell, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <AppLogo
          variant={mode === 'light' ? 'default' : 'dark'}
          style={{ flex: 1, minWidth: 0 }}
          logoHeight={44}
          logoMaxWidth={72}
          tagline="FULFILLMENT"
        />
        <Pressable
          onPress={onClose}
          style={styles.closeRing}
          hitSlop={12}
          accessibilityLabel={t('drawer.closeMenu')}
        >
          <View style={styles.closeDot} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {TOP_NAV_DEFS.map(item => {
          if (item.id === 'category') {
            return (
              <View key="category-block">
                <Pressable
                  style={[
                    styles.row,
                    (categoryOpen || categoryParentActive) &&
                      styles.rowGroupExpanded,
                  ]}
                  onPress={() => setCategoryOpen(v => !v)}
                >
                  <View style={styles.rowIconSlot}>
                    <SystemIcon
                      name={item.icon}
                      size={20}
                      color={palette.textSecondary}
                    />
                  </View>
                  <Text style={styles.rowLabel}>{t(item.labelKey)}</Text>
                  <View style={styles.chevronSlot}>
                    <SystemIcon
                      name={categoryOpen ? 'chevronDown' : 'chevronForward'}
                      size={18}
                      color={palette.textMuted}
                    />
                  </View>
                </Pressable>
                {categoryOpen ? (
                  <View style={styles.sublist}>
                    {categoryNavRows.map(row => {
                      const subActive = activeId === row.drawerId;
                      return (
                        <Pressable
                          key={row.drawerId}
                          style={[
                            styles.subRow,
                            subActive && styles.subRowSelected,
                          ]}
                          onPress={() => {
                            onNavigate?.(row.drawerId);
                            onClose();
                          }}
                        >
                          <View style={styles.subGlyphSlot}>
                            <SystemIcon
                              name="list"
                              size={14}
                              color={palette.textMuted}
                            />
                          </View>
                          <Text
                            style={[
                              styles.subLabel,
                              subActive && styles.subLabelActive,
                            ]}
                          >
                            {resolveSectionNavItemLabel(row, t)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          }

          if (item.id === 'finance') {
            return (
              <View key="finance-block">
                <Pressable
                  style={[
                    styles.row,
                    (financeOpen || financeParentActive) &&
                      styles.rowGroupExpanded,
                  ]}
                  onPress={() => setFinanceOpen(v => !v)}
                >
                  <View style={styles.rowIconSlot}>
                    <SystemIcon
                      name={item.icon}
                      size={20}
                      color={palette.textSecondary}
                    />
                  </View>
                  <Text style={styles.rowLabel}>{t(item.labelKey)}</Text>
                  <View style={styles.chevronSlot}>
                    <SystemIcon
                      name={financeOpen ? 'chevronDown' : 'chevronForward'}
                      size={18}
                      color={palette.textMuted}
                    />
                  </View>
                </Pressable>
                {financeOpen ? (
                  <View style={styles.sublist}>
                    {financeNavRows.map(row => {
                      const subActive = activeId === row.drawerId;
                      return (
                        <Pressable
                          key={row.drawerId}
                          style={[
                            styles.subRow,
                            subActive && styles.subRowSelected,
                          ]}
                          onPress={() => {
                            onNavigate?.(row.drawerId);
                            onClose();
                          }}
                        >
                          <View style={styles.subGlyphSlot}>
                            <SystemIcon
                              name="list"
                              size={14}
                              color={palette.textMuted}
                            />
                          </View>
                          <Text
                            style={[
                              styles.subLabel,
                              subActive && styles.subLabelActive,
                            ]}
                          >
                            {resolveSectionNavItemLabel(row, t)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          }

          if (item.id === 'goods') {
            return (
              <View key="goods-block">
                <Pressable
                  style={[
                    styles.row,
                    (goodsOpen || goodsParentActive) && styles.rowGroupExpanded,
                  ]}
                  onPress={() => setGoodsOpen(v => !v)}
                >
                  <View style={styles.rowIconSlot}>
                    <SystemIcon
                      name={item.icon}
                      size={20}
                      color={palette.textSecondary}
                    />
                  </View>
                  <Text style={styles.rowLabel}>{t(item.labelKey)}</Text>
                  <View style={styles.chevronSlot}>
                    <SystemIcon
                      name={goodsOpen ? 'chevronDown' : 'chevronForward'}
                      size={18}
                      color={palette.textMuted}
                    />
                  </View>
                </Pressable>
                {goodsOpen ? (
                  <View style={styles.sublist}>
                    {goodsNavRows.map(row => {
                      const subActive = activeId === row.drawerId;
                      return (
                        <Pressable
                          key={row.drawerId}
                          style={[
                            styles.subRow,
                            subActive && styles.subRowSelected,
                          ]}
                          onPress={() => {
                            onNavigate?.(row.drawerId);
                            onClose();
                          }}
                        >
                          <View style={styles.subGlyphSlot}>
                            <SystemIcon
                              name="list"
                              size={14}
                              color={palette.textMuted}
                            />
                          </View>
                          <Text
                            style={[
                              styles.subLabel,
                              subActive && styles.subLabelActive,
                            ]}
                          >
                            {resolveSectionNavItemLabel(row, t)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          }

          if (item.id === 'sales') {
            return (
              <View key="sales-block">
                <Pressable
                  style={[
                    styles.row,
                    (salesOpen || salesParentActive) && styles.rowGroupExpanded,
                  ]}
                  onPress={() => setSalesOpen(v => !v)}
                >
                  <View style={styles.rowIconSlot}>
                    <SystemIcon
                      name={item.icon}
                      size={20}
                      color={palette.textSecondary}
                    />
                  </View>
                  <Text style={styles.rowLabel}>{t(item.labelKey)}</Text>
                  <View style={styles.chevronSlot}>
                    <SystemIcon
                      name={salesOpen ? 'chevronDown' : 'chevronForward'}
                      size={18}
                      color={palette.textMuted}
                    />
                  </View>
                </Pressable>
                {salesOpen ? (
                  <View style={styles.sublist}>
                    {SALES_SUB_NAV.map(row => {
                      const subActive = activeId === row.id;
                      const count = salesDrawerBadgeCount(row.badge);
                      const tone = row.badgeTone ?? 'red';
                      return (
                        <Pressable
                          key={row.id}
                          style={[
                            styles.subRow,
                            subActive && styles.subRowSelected,
                          ]}
                          onPress={() => {
                            onNavigate?.(row.id);
                            onClose();
                          }}
                        >
                          <View style={styles.subGlyphSlot}>
                            <SystemIcon
                              name="list"
                              size={14}
                              color={palette.textMuted}
                            />
                          </View>
                          <View style={styles.subRowMain}>
                            <Text
                              style={[
                                styles.subLabel,
                                subActive && styles.subLabelActive,
                              ]}
                              numberOfLines={2}
                            >
                              {t(row.labelKey)}
                            </Text>
                            {typeof count === 'number' ? (
                              <View
                                style={[
                                  styles.countBadge,
                                  tone === 'teal'
                                    ? styles.countBadgeTeal
                                    : styles.countBadgeRed,
                                ]}
                              >
                                <Text style={styles.countBadgeTxt}>
                                  {count > 99 ? '99+' : String(count)}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                    {showSalesShopRows && menuLoading ? (
                      <View style={styles.subRow}>
                        <ActivityIndicator color={palette.teal} size="small" />
                        <Text style={styles.subHint}>
                          {t('drawer.loadingShops')}
                        </Text>
                      </View>
                    ) : null}
                    {showSalesShopRows && menuError ? (
                      <Pressable
                        style={styles.subRow}
                        onPress={() => void dispatch(fetchSalesMenuShops())}
                      >
                        <Text style={styles.subError}>{menuError}</Text>
                        <Text style={styles.subRetry}>{t('drawer.retry')}</Text>
                      </Pressable>
                    ) : null}
                    {showSalesShopRows
                      ? menuShops.map(shop => {
                          const sid = `sales:shop:${shop.id}`;
                          const subActive = activeId === sid;
                          return (
                            <Pressable
                              key={shop.id}
                              style={[
                                styles.subRow,
                                subActive && styles.subRowSelected,
                              ]}
                              onPress={() => {
                                onNavigate?.(sid);
                                onClose();
                              }}
                            >
                              <View style={styles.subGlyphSlot}>
                                <SystemIcon
                                  name="store"
                                  size={14}
                                  color={palette.textMuted}
                                />
                              </View>
                              <Text
                                style={[
                                  styles.subLabel,
                                  subActive && styles.subLabelActive,
                                ]}
                                numberOfLines={2}
                              >
                                {shop.name}
                              </Text>
                            </Pressable>
                          );
                        })
                      : null}
                  </View>
                ) : null}
              </View>
            );
          }

          if (item.id === 'settings') {
            return (
              <View key="settings-block">
                <Pressable
                  style={[
                    styles.row,
                    (settingsOpen || settingsParentActive) &&
                      styles.rowGroupExpanded,
                  ]}
                  onPress={() => setSettingsOpen(v => !v)}
                >
                  <View style={styles.rowIconSlot}>
                    <SystemIcon
                      name={item.icon}
                      size={20}
                      color={palette.textSecondary}
                    />
                  </View>
                  <Text style={styles.rowLabel}>{t(item.labelKey)}</Text>
                  <View style={styles.chevronSlot}>
                    <SystemIcon
                      name={settingsOpen ? 'chevronDown' : 'chevronForward'}
                      size={18}
                      color={palette.textMuted}
                    />
                  </View>
                </Pressable>
                {settingsOpen ? (
                  <View style={styles.sublist}>
                    {SETTINGS_ITEMS.map(row => {
                      const subActive = activeId === row.id;
                      return (
                        <Pressable
                          key={row.id}
                          style={[
                            styles.subRow,
                            subActive && styles.subRowSelected,
                          ]}
                          onPress={() => {
                            onNavigate?.(row.id);
                            onClose();
                          }}
                        >
                          <View style={styles.subGlyphSlot}>
                            <SystemIcon
                              name={row.icon}
                              size={14}
                              color={palette.textMuted}
                            />
                          </View>
                          <Text
                            style={[
                              styles.subLabel,
                              subActive && styles.subLabelActive,
                            ]}
                            numberOfLines={2}
                          >
                            {t(row.labelKey)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          }

          const active = item.id === activeId;
          return (
            <Pressable
              key={item.id}
              style={[styles.row, active && styles.rowSelected]}
              onPress={() => {
                onNavigate?.(item.id);
                onClose();
              }}
            >
              <View style={styles.rowIconSlot}>
                <SystemIcon
                  name={item.icon}
                  size={20}
                  color={active ? palette.teal : palette.textSecondary}
                />
              </View>
              <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                {t(item.labelKey)}
              </Text>
              {item.chevron ? (
                <View style={styles.chevronSlot}>
                  <SystemIcon
                    name="chevronForward"
                    size={18}
                    color={active ? palette.teal : palette.textMuted}
                  />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={styles.themeToggle}
          onPress={() => toggleMode()}
          accessibilityRole="button"
          accessibilityLabel={
            mode === 'dark'
              ? t('drawer.themeA11yLight')
              : t('drawer.themeA11yDark')
          }
        >
          <View style={styles.themeToggleIconSlot}>
            <SystemIcon
              name={mode === 'dark' ? 'sunny' : 'moon'}
              size={22}
              color={palette.textSecondary}
            />
          </View>
          <View style={styles.themeToggleTextCol}>
            <Text style={styles.themeToggleTitle}>
              {t('header.appearance')}
            </Text>
            <Text style={styles.themeToggleSub}>
              {mode === 'dark'
                ? t('drawer.themeHintDark')
                : t('drawer.themeHintLight')}
            </Text>
          </View>
          <View style={styles.chevronSlot}>
            <SystemIcon
              name="chevronForward"
              size={16}
              color={palette.textMuted}
            />
          </View>
        </Pressable>
        <Button
          title={t('drawer.logout')}
          variant="outline"
          size="sm"
          loading={loggingOut}
          onPress={() => {
            onClose();
            void dispatch(logout());
          }}
        />
      </View>
    </View>
  );
}

function create_SalesDrawerMenu_styles(c: AppColorPalette) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: c.drawerBg,
      borderRightWidth: 1,
      borderRightColor: c.drawerBorder,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    closeRing: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: c.borderMid,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgCard,
    },
    closeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.textMuted,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingBottom: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      paddingHorizontal: 14,
      marginBottom: 5,
      borderRadius: 12,
    },
    rowSelected: {
      backgroundColor: c.drawerActiveBg,
      borderLeftWidth: 3,
      borderLeftColor: c.teal,
    },
    rowGroupExpanded: {
      backgroundColor: c.drawerGroupRowBg,
    },
    rowIconSlot: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textSecondary,
    },
    rowLabelActive: {
      color: c.teal,
      fontWeight: '700',
    },
    chevronSlot: {
      width: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sublist: {
      marginLeft: 10,
      marginBottom: 10,
      paddingLeft: 6,
    },
    subRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      marginBottom: 3,
      borderRadius: 10,
      gap: 8,
    },
    subRowSelected: {
      backgroundColor: c.drawerActiveBg,
      borderLeftWidth: 3,
      borderLeftColor: c.teal,
    },
    subGlyphSlot: {
      width: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subRowMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      minWidth: 0,
    },
    subLabel: {
      flex: 1,
      flexShrink: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.textSecondary,
    },
    subLabelActive: {
      color: c.textPrimary,
      fontWeight: '700',
    },
    countBadge: {
      minWidth: 22,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countBadgeRed: {
      backgroundColor: c.red,
    },
    countBadgeTeal: {
      backgroundColor: c.teal,
    },
    countBadgeTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.surfaceWhite,
    },
    subHint: {
      fontSize: 13,
      color: c.textMuted,
      marginLeft: 8,
    },
    subError: {
      flex: 1,
      fontSize: 12,
      color: c.red,
    },
    subRetry: {
      fontSize: 12,
      fontWeight: '700',
      color: c.teal,
    },
    footer: {
      paddingHorizontal: 16,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.drawerBorder,
      gap: 10,
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      gap: 10,
    },
    themeToggleIconSlot: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeToggleTextCol: {
      flex: 1,
    },
    themeToggleTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
    },
    themeToggleSub: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 2,
    },
  });
}

export default SalesDrawerMenu;
