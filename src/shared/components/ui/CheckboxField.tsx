import React from 'react';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SystemIcon } from '../icons/SystemIcon';
import { TextLink } from './TextLink';

export type CheckboxFieldVariant = 'light' | 'dark';

export type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  variant?: CheckboxFieldVariant;
  /** Ví dụ: "Quên mật khẩu?" bên phải */
  endAction?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function CheckboxField({
  label,
  checked,
  onChange,
  variant = 'light',
  endAction,
  style,
  disabled = false,
}: CheckboxFieldProps) {
  const styles = useThemeStyleSheet(create_CheckboxField_styles);

  const isDark = variant === 'dark';

  return (
    <View style={[styles.row, style]}>
      <Pressable
        style={styles.checkboxRow}
        onPress={() => !disabled && onChange(!checked)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
      >
        <View
          style={[
            styles.checkbox,
            isDark && styles.checkboxDark,
            checked && styles.checkboxChecked,
          ]}
        >
          {checked ? <SystemIcon name="check" size={12} color="#fff" /> : null}
        </View>
        <Text
          style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}
        >
          {label}
        </Text>
      </Pressable>

      {endAction ? (
        <TextLink variant="primary" onPress={endAction.onPress}>
          {endAction.label}
        </TextLink>
      ) : null}
    </View>
  );
}

function create_CheckboxField_styles(c: AppColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 1,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1.5,
      borderColor: '#ccc',
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxDark: {
      borderColor: c.borderLight,
      backgroundColor: c.bgInput,
    },
    checkboxChecked: {
      backgroundColor: c.teal,
      borderColor: c.teal,
    },
    label: {
      fontSize: 13,
      flexShrink: 1,
    },
    labelLight: {
      color: '#555',
    },
    labelDark: {
      color: c.textSecondary,
    },
  });
}

export default CheckboxField;
