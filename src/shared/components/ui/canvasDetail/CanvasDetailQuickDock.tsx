import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SystemIconName } from '../../icons/SystemIcon';
import { SystemIcon } from '../../icons/SystemIcon';
import { quickActionPaint, type QuickActionTone } from '../../../theme/quickActionPaint';
import { useAppColors } from '../../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../../theme/useThemeStyleSheet';
import { createDetailQuickDockThemeStyles } from '../detailQuickDockSharedStyles';

export type CanvasDetailQuickDockAction = {
  key: string;
  label: string;
  icon: SystemIconName;
  tone?: QuickActionTone;
  disabled?: boolean;
  /** Nút teal full-width; mặc định action đầu tiên nếu không chỉ định. */
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
};

export type CanvasDetailQuickDockProps = {
  title?: string;
  actions: CanvasDetailQuickDockAction[];
  /** Mọi action đều kiểu secondary (không có nút primary teal). */
  stackOnly?: boolean;
  /** Fallback khi action không có `onPress`. */
  onActionPress?: (key: string) => void;
};

/**
 * Khối «Thao tác nhanh» chuẩn canvas — thay ~15 component `*QuickDock` riêng lẻ.
 */
export function CanvasDetailQuickDock({
  title = 'Thao tác nhanh',
  actions,
  stackOnly = false,
  onActionPress,
}: CanvasDetailQuickDockProps) {
  const c = useAppColors();
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);

  if (actions.length === 0) {
    return null;
  }

  const primaryIndex = stackOnly
    ? -1
    : actions.findIndex(a => a.variant === 'primary');
  const primaryIdx = primaryIndex >= 0 ? primaryIndex : stackOnly ? -1 : 0;
  const primary = primaryIdx >= 0 ? actions[primaryIdx] : null;
  const secondary = actions.filter((_, i) => i !== primaryIdx);

  const runAction = (action: CanvasDetailQuickDockAction) => {
    if (action.onPress) {
      action.onPress();
      return;
    }
    onActionPress?.(action.key);
  };

  return (
    <View style={qd.dockCard}>
      <Text style={qd.dockTitle}>{title}</Text>
      <View style={qd.dockCol}>
        {primary != null && !stackOnly ? (
          <Pressable
            disabled={primary.disabled}
            onPress={() => runAction(primary)}
            style={({ pressed }) => [
              qd.dockBtnPrimary,
              primary.disabled && qd.dockBtnDisabled,
              pressed && qd.dockBtnPressed,
            ]}
          >
            <SystemIcon name={primary.icon} size={18} color="#fff" />
            <Text style={qd.dockBtnPrimaryLabel}>{primary.label}</Text>
          </Pressable>
        ) : null}
        {(stackOnly ? actions : secondary).map(action => {
          const paint = quickActionPaint(c, action.tone ?? 'neutral');
          return (
            <Pressable
              key={action.key}
              disabled={action.disabled}
              onPress={() => runAction(action)}
              style={({ pressed }) => [
                qd.dockBtn,
                { backgroundColor: paint.bg, borderColor: paint.border },
                action.disabled && qd.dockBtnDisabled,
                pressed && qd.dockBtnPressed,
              ]}
            >
              <SystemIcon name={action.icon} size={16} color={paint.fg} />
              <Text style={[qd.dockBtnLabel, { color: paint.fg }]}>
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
