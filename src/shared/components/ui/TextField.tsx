import React, { useRef, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SystemIcon } from '../icons/SystemIcon';
import { useAppColors, useThemeMode } from '../../theme/ThemeContext';
import { RADIUS } from '../../theme/designTokens';

export type TextFieldVariant = 'light' | 'dark';
export type TextFieldSize = 'sm' | 'md' | 'lg';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  /** Bo trong neu chi can o nhap (khong hien nhan). */
  label?: string;
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  isPassword?: boolean;
  showPasswordToggle?: boolean;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  /** Icon / ký tự bên trái trong khung nhập (ví dụ modal tạo khách). */
  startIcon?: ReactNode;
  /** Không viền — nền xám nhạt (form đăng nhập). */
  borderless?: boolean;
  /** Nút hiện/ẩn mật khẩu: chữ hoặc icon mắt. */
  passwordToggleVariant?: 'text' | 'icon';
};

const SIZES: Record<
  TextFieldSize,
  { height: number; fontSize: number; radius: number }
> = {
  sm: { height: 40, fontSize: 14, radius: RADIUS.sm },
  md: { height: 48, fontSize: 15, radius: RADIUS.control },
  lg: { height: 54, fontSize: 16, radius: RADIUS.md },
};

export function TextField({
  ref,
  label = '',
  variant = 'light',
  size = 'md',
  isPassword = false,
  showPasswordToggle = true,
  showPasswordLabel = 'Hien',
  hidePasswordLabel = 'An',
  error,
  containerStyle,
  inputStyle,
  startIcon,
  borderless = false,
  passwordToggleVariant = 'text',
  placeholderTextColor,
  onFocus,
  onBlur,
  editable = true,
  showSoftInputOnFocus = true,
  ...rest
}: TextFieldProps & { ref?: React.Ref<TextInput> }) {
    const { mode } = useThemeMode();
    const colors = useAppColors();
    const inputRef = useRef<TextInput | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const setInputRef = (node: TextInput | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<TextInput | null>).current = node;
      }
    };
    const s = SIZES[size];
    /** `variant="dark"` trên nền sáng (light mode) dùng hàng nhập sáng để đồng bộ theme. */
    const isDark = variant === 'dark' && mode === 'dark';
    const multiline = Boolean(rest.multiline);
    const placeholderColor = placeholderTextColor ?? colors.textMuted;

    const rowMinHeight = multiline ? Math.max(s.height, 88) : s.height;

    const borderColor = borderless
      ? 'transparent'
      : error
        ? colors.red
        : focused
          ? colors.teal
          : colors.borderMid;
    const backgroundColor = borderless
      ? isDark
        ? colors.bgInput
        : colors.inputLight
      : focused && !error && !isDark
        ? colors.inputLightFocus
        : colors.bgInput;

    const rowStyle = [
      styles.inputRow,
      {
        borderRadius: s.radius,
        minHeight: rowMinHeight,
        backgroundColor,
        borderColor,
        borderWidth: borderless ? 0 : 1.5,
      },
      borderless && styles.inputRowBorderless,
      multiline && styles.inputRowMultiline,
    ];

    const showLabel = Boolean(label.trim());

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {showLabel ? (
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
        ) : null}
        <View style={rowStyle}>
          {startIcon != null ? (
            <View
              style={[
                styles.startIconWrap,
                multiline && styles.startIconWrapMultiline,
              ]}
            >
              {startIcon}
            </View>
          ) : null}
          <TextInput
            ref={setInputRef}
            style={[
              styles.input,
              {
                fontSize: s.fontSize,
                minHeight: multiline
                  ? Math.max(72, rowMinHeight - 20)
                  : s.height - 2,
              },
              { color: colors.textPrimary },
              multiline && styles.inputMultiline,
              inputStyle,
            ]}
            {...rest}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor={placeholderColor}
            textAlignVertical={multiline ? 'top' : 'center'}
            editable={editable}
            showSoftInputOnFocus={showSoftInputOnFocus}
            onFocus={e => {
              setFocused(true);
              onFocus?.(e);
              /** Một số máy Android / Modal (Fabric) không bật IME sau lần focus đầu — gọi lại focus ở frame sau. */
              if (Platform.OS === 'android' && editable) {
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }
            }}
            onBlur={e => {
              setFocused(false);
              onBlur?.(e);
            }}
            autoCapitalize="none"
          />
          {isPassword && showPasswordToggle && (
            <Pressable
              onPress={() => setShowPassword(v => !v)}
              style={styles.eyeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? hidePasswordLabel : showPasswordLabel
              }
            >
              {passwordToggleVariant === 'icon' ? (
                <SystemIcon
                  name={showPassword ? 'eyeOff' : 'eye'}
                  size={20}
                  color={colors.textMuted}
                />
              ) : (
                <Text style={[styles.eyeIcon, { color: colors.teal }]}>
                  {showPassword ? hidePasswordLabel : showPasswordLabel}
                </Text>
              )}
            </Pressable>
          )}
        </View>
        {error ? (
          <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
        ) : null}
      </View>
    );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  inputRowBorderless: {
    paddingHorizontal: 16,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  startIconWrap: {
    justifyContent: 'center',
    marginRight: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  startIconWrapMultiline: {
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  inputMultiline: {
    paddingTop: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TextField;
