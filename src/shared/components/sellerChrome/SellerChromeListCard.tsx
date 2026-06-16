import React, { type ReactNode } from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSellerChromeStyles } from './useSellerChromeStyles';

export type SellerChromeListCardProps = {
  title: string;
  subtitle?: string;
  metaLeft?: string;
  metaRight?: string;
  onPress?: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Thẻ danh sách kiểu sellerUiDemo. */
export function SellerChromeListCard({
  title,
  subtitle,
  metaLeft,
  metaRight,
  onPress,
  children,
  style,
}: SellerChromeListCardProps) {
  const s = useSellerChromeStyles();
  const inner = (
    <View style={[s.listCard, style]}>
      <Text style={s.listCardTitle}>{title}</Text>
      {subtitle ? <Text style={s.listCardSubtitle}>{subtitle}</Text> : null}
      {children}
      {metaLeft != null || metaRight != null ? (
        <View style={s.listCardFooter}>
          {metaLeft != null ? (
            <Text style={s.listCardMeta}>{metaLeft}</Text>
          ) : (
            <View />
          )}
          {metaRight != null ? (
            <Text style={s.listCardAccent}>{metaRight}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {inner}
      </Pressable>
    );
  }
  return inner;
}
