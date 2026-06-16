import React, { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { SystemIconName } from '../../icons/SystemIcon';
import { SystemIcon } from '../../icons/SystemIcon';
import { useAppColors } from '../../../theme/ThemeContext';
import { useCanvasScreenStyles } from './canvasScreenTheme';

export type CanvasFormSectionProps = {
  title?: string;
  icon?: SystemIconName;
  children: ReactNode;
  /** Bỏ padding ngang ngoài khi scroll form đã có pad. */
  inset?: boolean;
};

/** Nhóm field form trong thẻ canvas (viền trái teal). */
export function CanvasFormSection({
  title,
  icon,
  children,
  inset = true,
}: CanvasFormSectionProps) {
  const c = useAppColors();
  const styles = useCanvasScreenStyles();

  return (
    <View style={[inset && styles.screenPad, { marginBottom: 12 }]}>
      <View style={styles.formSection}>
        {title != null ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            {icon != null ? (
              <SystemIcon name={icon} size={18} color={c.teal} />
            ) : null}
            <Text
              style={{
                fontSize: 15,
                fontWeight: '800',
                color: c.textPrimary,
              }}
            >
              {title}
            </Text>
          </View>
        ) : null}
        {children}
      </View>
    </View>
  );
}
