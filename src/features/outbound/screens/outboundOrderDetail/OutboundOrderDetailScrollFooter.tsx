import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { quickActionPaint, type QuickActionTone } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { OutboundOrderApi } from '@services/warehouse/outboundOrderApiTypes';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';

type QuickItem = {
  key: string;
  label: string;
  icon: SystemIconName;
  tone: QuickActionTone;
};

export type OutboundOrderDetailOverviewSectionProps = {
  o: OutboundOrderApi;
  pickPct: number;
  itemLineCount: number;
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

export function OutboundOrderDetailOverviewSection({
  o,
  pickPct,
  itemLineCount,
}: OutboundOrderDetailOverviewSectionProps) {
  const { t } = useTranslation();
  const totalQ = toNum(o.total_quantity);
  const pickedQ = toNum(o.total_picked_quantity);
  const qty =
    totalQ > 0 ? `${pickedQ} / ${totalQ}` : t('common.dash');

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        {
          label: t('warehouseOutbound.footer.lineItems'),
          value: String(itemLineCount),
          icon: 'list',
        },
        {
          label: t('warehouseOutbound.footer.quantity'),
          value: qty,
          icon: 'cube',
        },
      ]}
      progress={{
        title: t('warehouseOutbound.footer.pickProgress').toUpperCase(),
        items: [
          {
            label: t('warehouseOutbound.footer.pickProgress'),
            percent: pickPct,
          },
        ],
      }}
      title={t('warehouseOutbound.footer.overviewTitle')}
      icon="truck"
    >
      <DetailRow
        label={t('warehouseOutbound.footer.lineItems')}
        value={t('warehouseOutbound.footer.linesCount', {
          count: itemLineCount,
        })}
      />
      <DetailRow
        label={t('warehouseOutbound.footer.quantity')}
        value={qty}
        last
      />
    </CanvasDetailOverviewPanel>
  );
}

export type OutboundOrderDetailQuickDockProps = {
  onQuickActionPress?: (key: string) => void;
};

export function OutboundOrderDetailQuickDock({
  onQuickActionPress,
}: OutboundOrderDetailQuickDockProps) {
  const { t } = useTranslation();
  const c = useAppColors();
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);

  const quickActions = useMemo((): QuickItem[] => {
    return [
      {
        key: 'pick',
        label: t('warehouseOutbound.footer.actionPick'),
        icon: 'download',
        tone: 'neutral',
      },
      {
        key: 'ship',
        label: t('warehouseOutbound.footer.actionShip'),
        icon: 'truck',
        tone: 'warning',
      },
      {
        key: 'cancel',
        label: t('warehouseOutbound.footer.actionCancel'),
        icon: 'close',
        tone: 'danger',
      },
    ];
  }, [t]);

  return (
    <View style={qd.dockCard}>
      <Text style={qd.dockTitle}>
        {t('warehouseOutbound.footer.quickDockTitle')}
      </Text>
      <View style={qd.dockCol}>
        {quickActions.map(a => {
          const paint = quickActionPaint(c, a.tone);
          return (
            <Pressable
              key={a.key}
              onPress={() => {
                onQuickActionPress?.(a.key);
              }}
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

function create_OutboundOrderDetailScrollFooter_styles(c: AppColorPalette) {
  return StyleSheet.create({
    overviewWrap: {
      marginBottom: 10,
      paddingHorizontal: 16,
    },
    sectionCard: {
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textSecondary,
      marginBottom: 10,
    },
    overviewProg: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    overviewProgLab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 6,
    },
    miniBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.border,
      overflow: 'hidden',
      marginBottom: 4,
    },
    miniBarFill: { height: '100%', backgroundColor: c.teal, borderRadius: 3 },
    overviewPct: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textSecondary,
      textAlign: 'right',
    },
  });
}
