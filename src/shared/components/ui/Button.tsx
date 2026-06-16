import React, { useMemo } from 'react';
import type { AppColorPalette } from '../../theme/colorPalettes';
import { useAppColors } from '../../theme/ThemeContext';
import { useThemeStyleSheet } from '../../theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Convenience when you only need text */
  title?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Spinner color; defaults by variant */
  loadingColor?: string;
  /** Press opacity feedback (default 0.85) */
  activeOpacity?: number;
};

type VariantTokens = {
  container: ViewStyle;
  text: TextStyle;
  disabledContainer: ViewStyle;
  loadingColor: string;
};

function buildVariants(
  p: AppColorPalette,
): Record<ButtonVariant, VariantTokens> {
  return {
    primary: {
      container: {
        backgroundColor: p.teal,
        borderWidth: 1,
        borderColor: p.teal,
      },
      text: { color: '#ffffff' },
      disabledContainer: { opacity: 0.7 },
      loadingColor: '#ffffff',
    },
    secondary: {
      container: {
        backgroundColor: p.buttonSecondarySurface,
        borderWidth: 1,
        borderColor: p.buttonSecondaryBorder,
      },
      text: { color: p.textPrimary },
      disabledContainer: { opacity: 0.6 },
      loadingColor: p.teal,
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: p.teal,
      },
      text: { color: p.teal },
      disabledContainer: { opacity: 0.55 },
      loadingColor: p.teal,
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      text: { color: p.teal },
      disabledContainer: { opacity: 0.5 },
      loadingColor: p.teal,
    },
    danger: {
      container: {
        backgroundColor: p.red,
      },
      text: { color: '#ffffff' },
      disabledContainer: { opacity: 0.7 },
      loadingColor: '#ffffff',
    },
  };
}

const SIZES: Record<
  ButtonSize,
  { minHeight: number; paddingH: number; fontSize: number; radius: number }
> = {
  sm: { minHeight: 40, paddingH: 14, fontSize: 14, radius: 10 },
  md: { minHeight: 50, paddingH: 18, fontSize: 16, radius: 12 },
  lg: { minHeight: 56, paddingH: 22, fontSize: 17, radius: 12 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  title,
  children,
  style,
  textStyle,
  loadingColor,
  activeOpacity = 0.85,
  onPress,
  ...rest
}: ButtonProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_Button_styles);
  const VARIANTS = useMemo(() => buildVariants(palette), [palette]);

  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = Boolean(disabled || loading);
  const spinnerColor = loadingColor ?? v.loadingColor;

  const label = title ?? children;
  const showText = typeof label === 'string' || typeof label === 'number';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: s.minHeight,
          paddingHorizontal: s.paddingH,
          borderRadius: s.radius,
          opacity: pressed && !isDisabled ? activeOpacity : 1,
        },
        v.container,
        isDisabled && v.disabledContainer,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : showText ? (
        <Text
          style={[
            styles.labelBase,
            { fontSize: s.fontSize },
            v.text,
            textStyle,
          ]}
        >
          {label}
        </Text>
      ) : (
        label
      )}
    </Pressable>
  );
}

function create_Button_styles(_c: AppColorPalette) {
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    labelBase: {
      fontWeight: '700',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
  });
}

export default Button;
