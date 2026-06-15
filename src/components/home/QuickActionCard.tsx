import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { lightTokens } from '@/src/configs/theme';

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
}

const ICON_SIZE = 20;
const CARD_HEIGHT = 68;
const CARD_RADIUS = 12;

function QuickActionCardComponent({
  label,
  icon: Icon,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-full">
      <HStack
        className="w-full items-center justify-between px-3.5"
        style={styles.card}>
        <Text
          size="sm"
          className="flex-1 pr-2 font-medium leading-5 text-typography-900"
          numberOfLines={2}>
          {label}
        </Text>
        <Box className="shrink-0">
          <Icon
            color={lightTokens.tertiary600}
            size={ICON_SIZE}
            strokeWidth={1.75}
          />
        </Box>
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    backgroundColor: lightTokens.tertiary50,
  },
});

export const QuickActionCard = memo(QuickActionCardComponent);
