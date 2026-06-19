import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { lightTokens } from '@/src/configs/theme';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
}

function QuickActionCardComponent({
  label,
  icon: Icon,
  onPress,
}: QuickActionCardProps) {
  const { scale } = useResponsiveLayout();
  const iconSize = scale(20);
  const cardHeight = scale(68);
  const cardRadius = scale(12);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-full">
      <HStack
        className="w-full items-center justify-between"
        style={[
          styles.card,
          { height: cardHeight, borderRadius: cardRadius, paddingHorizontal: scale(14) },
        ]}>
        <Text
          size="sm"
          className="flex-1 pr-2 font-medium leading-5 text-typography-900"
          numberOfLines={2}>
          {label}
        </Text>
        <Box className="shrink-0">
          <Icon
            color={lightTokens.tertiary600}
            size={iconSize}
            strokeWidth={1.75}
          />
        </Box>
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightTokens.tertiary50,
  },
});

export const QuickActionCard = memo(QuickActionCardComponent);
