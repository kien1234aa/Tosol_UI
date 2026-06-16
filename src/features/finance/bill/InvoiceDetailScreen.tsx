import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { statusSurface } from '@shared/theme/statusColors';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  coerceDetailActiveTabId,
  invoiceDetailTabsForAppRole,
} from '@features/auth/utils/roleNavPolicy';
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { DetailScreenTabScroll } from '@shared/components/ui/DetailScreenTabScroll';
import {
  detailScreenMainScrollContentTopPad,
  detailScreenScrollBottomInset,
  detailScreenTabPanelsPad,
} from '@shared/components/ui/detailScreenScrollDock';
import {
  detailScreenBody,
  detailScreenMainCol,
  detailScreenMainColumn,
  detailScreenRoot,
  detailScreenScrollFlex,
} from '@shared/components/ui/detailScreenLayout';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import {
  DetailCard,
  DetailRow,
} from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import {
  formatOrderDateLocale,
  resolveAppNumberLocale,
} from '../../sales/screens/orderDetail/orderDetailFormatters';
import {
  getInvoiceDetail,
  INVOICES_LIST_INCLUDE,
} from '@services/finance/invoiceAPI';
import type {
  InvoiceApi,
  InvoiceTotalApi,
} from '@services/finance/invoiceApiTypes';
import {
  apiInvoiceStatusToRowStatus,
  invoiceRowStatusLabel,
} from '@mappers/finance/invoiceListMappers';
import type { InvoiceRowStatus } from './invoiceListTypes';
import { InvoiceDetailTabBar } from './invoiceDetail/InvoiceDetailTabBar';
import { InvoiceDetailTabPanels } from './invoiceDetail/InvoiceDetailTabPanels';
import type { InvoiceLineItemApi } from '@services/finance/invoiceApiTypes';
import type { InvoiceDetailTabId } from './invoiceDetail/invoiceDetailTypes';

export type InvoiceDetailScreenProps = {
  invoiceId: string;
  onOpenDrawer: () => void;
  onBack: () => void;
  onOpenSettlement?: (settlementRef: string) => void;
};

function collectInvoiceLineItems(inv: InvoiceApi): InvoiceLineItemApi[] {
  return inv.items ?? inv.invoice_items ?? [];
}

function pillColors(p: AppColorPalette, s: InvoiceRowStatus) {
  let tone: Parameters<typeof statusSurface>[1] = 'neutral';
  switch (s) {
    case 'pending':
      tone = 'warning';
      break;
    case 'partial':
      tone = 'info';
      break;
    case 'paid':
      tone = 'success';
      break;
    case 'overdue':
      tone = 'danger';
      break;
    default:
      break;
  }
  const surf = statusSurface(p, tone);
  return { bg: surf.backgroundColor, border: surf.borderColor };
}

function fmtMoneyNum(n: number, symbol: string, numberLocale: string): string {
  if (!Number.isFinite(n)) {
    return '—';
  }
  return `${Math.round(n).toLocaleString(numberLocale)}${symbol}`;
}

function fmtMoneyFromTotal(
  t: InvoiceTotalApi | null,
  numberLocale: string,
): {
  sub: string;
  tax: string;
  total: string;
  taxPct: string;
} {
  if (!t) {
    return { sub: '—', tax: '—', total: '—', taxPct: '0' };
  }
  const sym = t.currency?.symbol ?? '\u20AB';
  const pct = Number.isFinite(t.tax_rate)
    ? String(Math.round(t.tax_rate))
    : '0';
  return {
    sub: fmtMoneyNum(t.subtotal, sym, numberLocale),
    tax: fmtMoneyNum(t.tax_amount, sym, numberLocale),
    total: fmtMoneyNum(t.total_amount, sym, numberLocale),
    taxPct: pct,
  };
}

export function InvoiceDetailScreen({
  invoiceId,
  onOpenDrawer,
  onBack,
  onOpenSettlement,
}: InvoiceDetailScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_InvoiceDetailScreen_styles);
  const appRole = useAppSelector(selectNormalizedAppRole);
  const numberLocale = resolveAppNumberLocale();
  const invoiceDetailTabs = useMemo(
    () => invoiceDetailTabsForAppRole(appRole),
    [appRole],
  );
  const [inv, setInv] = useState<InvoiceApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<InvoiceDetailTabId>('info');

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getInvoiceDetail(invoiceId);
      setInv(data);
    } catch {
      try {
        const data = await getInvoiceDetail(invoiceId, {
          include: INVOICES_LIST_INCLUDE,
        });
        setInv(data);
        setError(null);
      } catch (e2: unknown) {
        setInv(null);
        setError(
          e2 instanceof Error
            ? e2.message
            : t('financeInvoice.detail.loadFailed'),
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [invoiceId, t]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    setTab(prev => coerceDetailActiveTabId(prev, invoiceDetailTabs, 'info'));
  }, [invoiceDetailTabs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const lineItems = useMemo(
    () => (inv ? collectInvoiceLineItems(inv) : []),
    [inv],
  );
  const rowStatus = inv ? apiInvoiceStatusToRowStatus(inv.status) : 'pending';
  const statusLabel = invoiceRowStatusLabel(rowStatus);
  const pill = pillColors(palette, rowStatus);
  const total0 = inv?.totals?.[0] ?? null;
  const money = fmtMoneyFromTotal(total0, numberLocale);
  const warehouseName = inv?.warehouse?.name?.trim() || null;
  const settlementRef =
    inv?.settlement?.settlement_number?.trim() ||
    inv?.settlement?.reference?.trim() ||
    null;

  const showPendingBanner = rowStatus === 'pending' || rowStatus === 'overdue';

  const heroTrailing = useMemo(
    () => (
      <View style={styles.heroIconPh}>
        <SystemIcon name="document" size={26} color={palette.textMuted} />
      </View>
    ),
    [styles.heroIconPh, palette.textMuted],
  );

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={palette.textSecondary}
      />
    ),
    [refreshing, onRefresh, palette.textSecondary],
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <View style={detailScreenMainCol}>
        <Text style={styles.breadcrumb} numberOfLines={2}>
          {t('financeInvoice.detail.breadcrumb')}
          {inv?.invoice_number ? ` · ${inv.invoice_number}` : ''}
        </Text>

        {loading && !inv ? (
          <DetailScreenSkeleton />
        ) : error ? (
          <ScrollView
            style={detailScreenScrollFlex}
            contentContainerStyle={[ canvasListScrollContent(),
              { paddingBottom: insets.bottom + 24 },
            ]}
            nestedScrollEnabled
          >
            <View style={styles.errBox}>
              <Text style={styles.errTxt}>{error}</Text>
              <Pressable onPress={() => void load()} style={styles.retryBtn}>
                <Text style={styles.retryTxt}>{t('common.retry')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : inv ? (
          <View style={detailScreenBody}>
            <View style={detailScreenMainColumn}>
              <DetailScreenTabScroll
                style={detailScreenScrollFlex}
                contentContainerStyle={[
                  detailScreenMainScrollContentTopPad,
                  {
                    paddingBottom: detailScreenScrollBottomInset(insets.bottom),
                  },
                ]}
                refreshControl={memoizedRefreshControl}
              >
                <CanvasDetailHeroCard
                  title={inv.invoice_number}
                  subtitle={inv.seller?.name?.trim() || '—'}
                  healthLabel={t('financeInvoice.detail.dueDate')}
                  healthValue={formatOrderDateLocale(inv.due_at)}
                  statusSlot={
                    <View style={styles.pillRow}>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: pill.bg,
                            borderColor: pill.border,
                          },
                        ]}
                      >
                        <View style={styles.pillIconRow}>
                          <SystemIcon
                            name="time"
                            size={12}
                            color={palette.textPrimary}
                          />
                          <Text style={styles.statusPillTxt}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                      {warehouseName ? (
                        <View style={styles.whPill}>
                          <View style={styles.pillIconRow}>
                            <SystemIcon
                              name="business"
                              size={12}
                              color={palette.teal}
                            />
                            <Text style={styles.whPillTxt}>{warehouseName}</Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  }
                  trailing={heroTrailing}
                  footer={
                    <Text style={styles.heroMeta} numberOfLines={2}>
                      {t('financeInvoice.detail.billingPeriod')}{' '}
                      {formatOrderDateLocale(inv.billing_period_from)} -{' '}
                      {formatOrderDateLocale(inv.billing_period_to)}
                    </Text>
                  }
                />

                {showPendingBanner ? (
                  <View style={styles.warnBanner}>
                    <SystemIcon
                      name="warning"
                      size={20}
                      color={palette.orange}
                    />
                    <Text style={styles.warnTxt}>
                      {rowStatus === 'overdue'
                        ? t('financeInvoice.detail.bannerOverdue')
                        : t('financeInvoice.detail.bannerPending')}
                    </Text>
                  </View>
                ) : null}

                <InvoiceDetailTabBar
                  tabs={invoiceDetailTabs}
                  activeTab={tab}
                  itemCount={lineItems.length}
                  onSelectTab={setTab}
                />

                <View style={detailScreenTabPanelsPad}>
                  <InvoiceDetailTabPanels
                    activeTab={tab}
                    inv={inv}
                    lineItems={lineItems}
                    onOpenSettlement={onOpenSettlement}
                  />
                </View>

                <DetailCard
                  title={t('financeInvoice.detail.summaryTitle')}
                  icon="cash"
                >
                  <DetailRow
                    label={t('financeInvoice.detail.subtotal')}
                    value={money.sub}
                  />
                  <DetailRow
                    label={t('financeInvoice.detail.taxLine', {
                      pct: money.taxPct,
                    })}
                    value={money.tax}
                  />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLab}>
                      {t('financeInvoice.detail.grandTotal')}
                    </Text>
                    <Text style={styles.totalVal}>{money.total}</Text>
                  </View>
                  <View style={styles.tealInfo}>
                    <SystemIcon
                      name="info"
                      size={16}
                      color={palette.tealLight}
                    />
                    <Text style={styles.tealInfoTxt}>
                      {t('financeInvoice.detail.settlementNote')}
                    </Text>
                  </View>
                  <Pressable
                    style={[
                      styles.linkBtn,
                      !settlementRef && styles.linkBtnDisabled,
                    ]}
                    disabled={!settlementRef}
                    onPress={() =>
                      settlementRef
                        ? onOpenSettlement?.(settlementRef)
                        : undefined
                    }
                  >
                    <Text
                      style={[
                        styles.linkBtnTxt,
                        !settlementRef && styles.linkBtnTxtDim,
                      ]}
                    >
                      {settlementRef
                        ? t('financeInvoice.detail.settlementLinkWithRef', {
                            ref: settlementRef,
                          })
                        : t('financeInvoice.detail.settlementLink')}
                    </Text>
                  </Pressable>
                </DetailCard>
              </DetailScreenTabScroll>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function create_InvoiceDetailScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    breadcrumb: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 10,
      lineHeight: 18,
      paddingHorizontal: 16,
    },
    errBox: {
      margin: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    errTxt: { fontSize: 14, fontWeight: '600', color: c.red, marginBottom: 12 },
    retryBtn: { alignSelf: 'flex-start' },
    retryTxt: { fontSize: 14, fontWeight: '800', color: c.cyan },
    heroIconPh: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    statusPill: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    statusPillTxt: { fontSize: 11, fontWeight: '800', color: c.textPrimary },
    whPill: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: 'rgba(45,212,191,0.12)',
      borderColor: 'rgba(45,212,191,0.45)',
    },
    whPillTxt: { fontSize: 11, fontWeight: '800', color: c.tealLight },
    heroMeta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
    },
    warnBanner: {
      marginHorizontal: 16,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(251,146,60,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(251,146,60,0.4)',
    },
    warnTxt: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: c.orange,
      lineHeight: 18,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    totalLab: { fontSize: 14, fontWeight: '800', color: c.textPrimary },
    totalVal: { fontSize: 18, fontWeight: '800', color: c.textPrimary },
    tealInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 12,
      padding: 10,
      borderRadius: 8,
      backgroundColor: 'rgba(45,212,191,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(45,212,191,0.3)',
    },
    tealInfoTxt: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: c.tealLight,
      lineHeight: 17,
    },
    linkBtn: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 4 },
    linkBtnDisabled: { opacity: 0.45 },
    linkBtnTxt: { fontSize: 13, fontWeight: '800', color: c.cyan },
    linkBtnTxtDim: { color: c.textMuted },
  });
}
