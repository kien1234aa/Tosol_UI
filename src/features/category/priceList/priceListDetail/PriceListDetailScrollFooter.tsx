import React from 'react';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { quickActionPaint } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';

export type PriceListDetailQuickDockProps = {
  busy: boolean;
  isDefault: boolean;
  isActive: boolean;
  onSetDefault: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function PriceListDetailQuickDock({
  busy,
  isDefault,
  isActive,
  onSetDefault,
  onToggleActive,
  onEdit,
  onDelete,
}: PriceListDetailQuickDockProps) {
  const c = useAppColors();
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);
  const paintWarning = quickActionPaint(c, 'warning');
  const paintNeutral = quickActionPaint(c, 'neutral');
  const paintSuccess = quickActionPaint(c, 'success');
  const paintDanger = quickActionPaint(c, 'danger');

  return (
    <View style={qd.dockCard}>
      <Text style={qd.dockTitle}>Thao tác nhanh</Text>
      <View style={qd.dockCol}>
        {!isDefault ? (
          <Pressable
            onPress={onSetDefault}
            disabled={busy}
            style={({ pressed }) => [
              qd.dockBtn,
              {
                backgroundColor: paintWarning.bg,
                borderColor: paintWarning.border,
              },
              busy && qd.dockBtnDisabled,
              pressed && !busy && qd.dockBtnPressed,
            ]}
          >
            <SystemIcon name="star" size={16} color={paintWarning.fg} />
            <Text style={[qd.dockBtnLabel, { color: paintWarning.fg }]}>
              Đặt làm mặc định
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onToggleActive}
          disabled={busy}
          style={({ pressed }) => [
            qd.dockBtn,
            {
              backgroundColor: isActive ? paintNeutral.bg : paintSuccess.bg,
              borderColor: isActive ? paintNeutral.border : paintSuccess.border,
            },
            busy && qd.dockBtnDisabled,
            pressed && !busy && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon
            name={isActive ? 'ban' : 'check'}
            size={16}
            color={isActive ? paintNeutral.fg : paintSuccess.fg}
          />
          <Text
            style={[
              qd.dockBtnLabel,
              { color: isActive ? paintNeutral.fg : paintSuccess.fg },
            ]}
          >
            {isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onEdit}
          disabled={busy}
          style={({ pressed }) => [
            qd.dockBtn,
            {
              backgroundColor: paintNeutral.bg,
              borderColor: paintNeutral.border,
            },
            busy && qd.dockBtnDisabled,
            pressed && !busy && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon name="pencil" size={16} color={paintNeutral.fg} />
          <Text style={[qd.dockBtnLabel, { color: paintNeutral.fg }]}>Sửa</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          disabled={busy}
          style={({ pressed }) => [
            qd.dockBtn,
            {
              backgroundColor: paintDanger.bg,
              borderColor: paintDanger.border,
            },
            busy && qd.dockBtnDisabled,
            pressed && !busy && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon name="trash" size={16} color={paintDanger.fg} />
          <Text style={[qd.dockBtnLabel, { color: paintDanger.fg }]}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}
