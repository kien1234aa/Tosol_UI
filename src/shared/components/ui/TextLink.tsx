import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useAppColors } from '../../theme/ThemeContext';

export type TextLinkVariant = 'primary' | 'muted' | 'danger';

export type TextLinkProps = Omit<PressableProps, 'children'> & {
  children: React.ReactNode;
  variant?: TextLinkVariant;
  textStyle?: StyleProp<TextStyle>;
};

export function TextLink({
  children,
  variant = 'primary',
  textStyle,
  hitSlop = { top: 8, bottom: 8, left: 8, right: 8 },
  ...rest
}: TextLinkProps) {
  const c = useAppColors();
  const variantText = useMemo(
    () =>
      ({
        primary: { color: c.textLink, fontWeight: '600' as const },
        muted: { color: c.textSecondary, fontWeight: '500' as const },
        danger: { color: c.red, fontWeight: '600' as const },
      } satisfies Record<TextLinkVariant, TextStyle>),
    [c],
  );

  return (
    <Pressable hitSlop={hitSlop} accessibilityRole="link" {...rest}>
      <Text style={[sheet.text, variantText[variant], textStyle]}>
        {children}
      </Text>
    </Pressable>
  );
}

const sheet = StyleSheet.create({
  text: {
    fontSize: 13,
  },
});

export default TextLink;
