import React from 'react';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { quickActionPaint } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { ShopDetailApi } from '@services/settings/shopResponseTypes';

function isShopConsideredActive(shop: ShopDetailApi): boolean {
  return shop.is_active !== false;
}

export type ShopDetailQuickDockProps = {
  shop: ShopDetailApi;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
  submitting?: boolean;
};

export function ShopDetailQuickDock({
  shop,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  submitting = false,
}: ShopDetailQuickDockProps) {
  const c = useAppColors();
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);
  const active = isShopConsideredActive(shop);
  const paintNeutral = quickActionPaint(c, 'neutral');
  const paintWarning = quickActionPaint(c, 'warning');
  const paintSuccess = quickActionPaint(c, 'success');
  const paintDanger = quickActionPaint(c, 'danger');

  return (
    <View style={qd.dockCard}>
      <Text style={qd.dockTitle}>Thao tác nhanh</Text>
      <View style={qd.dockCol}>
        <Pressable
          onPress={() => onEdit?.()}
          disabled={!onEdit || submitting}
          style={({ pressed }) => [
            qd.dockBtn,
            {
              backgroundColor: paintNeutral.bg,
              borderColor: paintNeutral.border,
            },
            pressed && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon name="pencil" size={16} color={paintNeutral.fg} />
          <Text style={[qd.dockBtnLabel, { color: paintNeutral.fg }]}>Sửa</Text>
        </Pressable>
        {active ? (
          <Pressable
            onPress={() => onDeactivate?.()}
            disabled={!onDeactivate || submitting}
            style={({ pressed }) => [
              qd.dockBtn,
              {
                backgroundColor: paintWarning.bg,
                borderColor: paintWarning.border,
              },
              pressed && qd.dockBtnPressed,
            ]}
          >
            <SystemIcon name="eyeOff" size={16} color={paintWarning.fg} />
            <Text style={[qd.dockBtnLabel, { color: paintWarning.fg }]}>
              Vô hiệu hóa
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => onActivate?.()}
            disabled={!onActivate || submitting}
            style={({ pressed }) => [
              qd.dockBtn,
              {
                backgroundColor: paintSuccess.bg,
                borderColor: paintSuccess.border,
              },
              pressed && qd.dockBtnPressed,
            ]}
          >
            <SystemIcon name="check" size={16} color={paintSuccess.fg} />
            <Text style={[qd.dockBtnLabel, { color: paintSuccess.fg }]}>
              Kích hoạt
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => onDelete?.()}
          disabled={!onDelete || submitting}
          style={({ pressed }) => [
            qd.dockBtn,
            {
              backgroundColor: paintDanger.bg,
              borderColor: paintDanger.border,
            },
            pressed && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon name="trash" size={16} color={paintDanger.fg} />
          <Text style={[qd.dockBtnLabel, { color: paintDanger.fg }]}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}
