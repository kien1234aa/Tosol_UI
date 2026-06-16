import React, { useMemo } from 'react';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { quickActionPaint, type QuickActionTone } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { PackingOrderApi } from '@services/warehouse/packingOrderApiTypes';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';

type QuickItem = {
  key: string;
  label: string;
  icon: SystemIconName;
  tone: QuickActionTone;
};

export type PackingOrderDetailOverviewSectionProps = {
  po: PackingOrderApi;
  pickPct: number;
  packPct: number;
  totalBoxes: number;
  packedBoxes: number;
};

function toNum(v: number | string | null | undefined, fb = 0): number {
  if (v == null) {
    return fb;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : fb;
}

export function PackingOrderDetailOverviewSection({
  po,
  pickPct,
  packPct,
  totalBoxes,
  packedBoxes,
}: PackingOrderDetailOverviewSectionProps) {
  const boxLabel =
    totalBoxes > 0 ? `${totalBoxes} hộp` : `${toNum(po.box_count)} hộp`;
  const packedLabel =
    totalBoxes > 0 ? `${packedBoxes} / ${totalBoxes}` : String(packedBoxes);

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        { label: 'Tổng hộp', value: boxLabel, icon: 'package' },
        { label: 'Đã đóng', value: packedLabel, icon: 'check' },
      ]}
      progress={{
        title: 'TIẾN ĐỘ',
        items: [
          { label: 'Lấy hàng', percent: pickPct },
          { label: 'Đóng gói', percent: packPct },
        ],
      }}
      title="Tổng quan đóng gói"
      icon="package"
    >
      <DetailRow label="Tổng số hộp" value={boxLabel} />
      <DetailRow label="Hộp đã đóng" value={packedLabel} last />
    </CanvasDetailOverviewPanel>
  );
}

export type PackingOrderDetailQuickDockProps = {
  onQuickActionPress?: (key: string) => void;
};

export function PackingOrderDetailQuickDock({
  onQuickActionPress,
}: PackingOrderDetailQuickDockProps) {
  const c = useAppColors();
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);

  const quickActions = useMemo((): QuickItem[] => {
    return [
      {
        key: 'start_pack',
        label: 'Bắt đầu đóng gói',
        icon: 'package',
        tone: 'neutral',
      },
      { key: 'self_assign', label: 'Tự nhận', icon: 'person', tone: 'neutral' },
      { key: 'assign', label: 'Phân công', icon: 'business', tone: 'neutral' },
      {
        key: 'quick_pack',
        label: 'Đóng gói nhanh',
        icon: 'check',
        tone: 'success',
      },
      { key: 'cancel', label: 'Hủy', icon: 'close', tone: 'danger' },
    ];
  }, []);

  return (
    <View style={qd.dockCard}>
      <Text style={qd.dockTitle}>Thao tác nhanh</Text>
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

function create_PackingOrderDetailScrollFooter_styles(c: AppColorPalette) {
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
    miniBarFillPack: {
      height: '100%',
      backgroundColor: c.green,
      borderRadius: 3,
    },
    overviewPct: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textSecondary,
      textAlign: 'right',
    },
  });
}
