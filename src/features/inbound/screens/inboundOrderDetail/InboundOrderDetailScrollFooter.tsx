import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { quickActionPaint, type QuickActionTone } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, Text, View } from 'react-native';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { InboundOrderApi } from '@services/warehouse/inboundOrderApiTypes';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { resolveAppNumberLocale } from '../../../sales/screens/orderDetail/orderDetailFormatters';

type QuickItem = {
  key: string;
  label: string;
  icon: SystemIconName;
  tone: QuickActionTone;
};

export type InboundOrderDetailOverviewSectionProps = {
  o: InboundOrderApi;
  receivePct: number;
  inboundLineCount: number;
};

function toNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  return Number(String(v).replace(',', '.')) || 0;
}

function formatQtyDisplay(v: number, locale: string): string {
  return Number.isInteger(v)
    ? String(v)
    : v.toLocaleString(locale, { maximumFractionDigits: 2 });
}

export function InboundOrderDetailOverviewSection({
  o,
  receivePct,
  inboundLineCount,
}: InboundOrderDetailOverviewSectionProps) {
  const { t } = useTranslation();
  const numLoc = resolveAppNumberLocale();
  const exp = toNum(o.total_expected_quantity);
  const rec = toNum(o.total_received_quantity);
  const qtyLabel =
    exp > 0 || rec > 0
      ? `${formatQtyDisplay(rec, numLoc)} / ${formatQtyDisplay(exp, numLoc)}`
      : t('common.dash');

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        {
          label: t('warehouseInbound.footer.inboundLines'),
          value: String(inboundLineCount),
          icon: 'list',
        },
        {
          label: t('warehouseInbound.footer.quantity'),
          value: qtyLabel,
          icon: 'cube',
        },
      ]}
      progress={{
        title: t('warehouseInbound.footer.receiveProgress').toUpperCase(),
        items: [
          {
            label: t('warehouseInbound.footer.receiveProgress'),
            percent: receivePct,
          },
        ],
      }}
      title={t('warehouseInbound.footer.overviewTitle')}
      icon="download"
    >
      <DetailRow
        label={t('warehouseInbound.footer.inboundLines')}
        value={t('warehouseInbound.footer.linesCount', {
          count: inboundLineCount,
        })}
      />
      <DetailRow
        label={t('warehouseInbound.footer.quantity')}
        value={qtyLabel}
        last
      />
    </CanvasDetailOverviewPanel>
  );
}

export type InboundOrderDetailQuickDockProps = {
  onQuickActionPress?: (key: string) => void;
};

export function InboundOrderDetailQuickDock({
  onQuickActionPress,
}: InboundOrderDetailQuickDockProps) {
  const { t } = useTranslation();
  const c = useAppColors();
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);

  const quickActions = useMemo((): QuickItem[] => {
    return [
      {
        key: 'receive',
        label: t('warehouseInbound.footer.actionReceive'),
        icon: 'download',
        tone: 'neutral',
      },
      {
        key: 'complete',
        label: t('warehouseInbound.footer.actionComplete'),
        icon: 'check',
        tone: 'success',
      },
      {
        key: 'cancel',
        label: t('warehouseInbound.footer.actionCancel'),
        icon: 'close',
        tone: 'danger',
      },
    ];
  }, [t]);

  return (
    <View style={qd.dockCard}>
      <Text style={qd.dockTitle}>
        {t('warehouseInbound.footer.quickDockTitle')}
      </Text>
      <View style={qd.dockCol}>
        {quickActions.map((a, i) => {
          const paint = quickActionPaint(c, a.tone);
          if (i === 0) {
            return (
              <Pressable
                key={a.key}
                onPress={() => onQuickActionPress?.(a.key)}
                style={({ pressed }) => [
                  qd.dockBtnPrimary,
                  pressed && qd.dockBtnPressed,
                ]}
              >
                <SystemIcon name={a.icon} size={18} color="#fff" />
                <Text style={qd.dockBtnPrimaryLabel}>{a.label}</Text>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={a.key}
              onPress={() => onQuickActionPress?.(a.key)}
              style={({ pressed }) => [
                qd.dockBtn,
                { backgroundColor: paint.bg, borderColor: paint.border },
                pressed && qd.dockBtnPressed,
              ]}
            >
              <SystemIcon name={a.icon} size={16} color={paint.fg} />
              <Text style={[qd.dockBtnLabel, { color: paint.fg }]}>
                {a.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

