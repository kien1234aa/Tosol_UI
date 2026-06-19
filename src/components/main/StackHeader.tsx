import React, { memo, type ReactNode } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import { buttonContentCenter } from '@/src/configs/theme/buttonLayout';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import { Box } from '@/src/uikits/box';
import { Heading } from '@/src/uikits/heading';
import { HStack } from '@/src/uikits/hstack';

export const STACK_HEADER_SLOT_WIDTH = 72;
export const STACK_HEADER_BACK_SIZE = 40;

const BACK_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

interface StackHeaderProps {
  title: string;
  onPressBack?: () => void;
  backAccessibilityLabel?: string;
  rightAction?: ReactNode;
  uppercase?: boolean;
}

function StackHeaderComponent({
  title,
  onPressBack,
  backAccessibilityLabel = 'Quay lại',
  rightAction,
  uppercase = true,
}: StackHeaderProps) {
  const { horizontalPadding, scale } = useResponsiveLayout();
  const backSize = scale(STACK_HEADER_BACK_SIZE);
  const sideSlotWidth = scale(STACK_HEADER_SLOT_WIDTH);

  return (
    <Box
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          paddingVertical: scale(14),
        },
      ]}>
      <HStack className="w-full items-center justify-between">
        <Box style={[styles.sideSlot, { width: sideSlotWidth, minHeight: backSize }]}>
          {onPressBack ? (
            <RNPressable
              onPress={onPressBack}
              accessibilityRole="button"
              accessibilityLabel={backAccessibilityLabel}
              hitSlop={BACK_HIT_SLOP}
              style={[
                styles.backButton,
                {
                  width: backSize,
                  height: backSize,
                  borderRadius: backSize / 2,
                },
              ]}>
              <ChevronLeft color={lightTokens.typography900} size={scale(24)} />
            </RNPressable>
          ) : null}
        </Box>

        <Box style={styles.titleContainer}>
          <Heading
            size="md"
            numberOfLines={1}
            className={
              uppercase
                ? 'text-center font-bold uppercase text-typography-900'
                : 'text-center font-bold text-typography-900'
            }
            style={styles.title}>
            {title}
          </Heading>
        </Box>

        <Box style={[styles.sideSlot, { width: sideSlotWidth }]}>{rightAction ?? null}</Box>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTokens.tertiary50,
    borderBottomWidth: 1,
    borderBottomColor: lightTokens.outline100,
  },
  sideSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    width: '100%',
    textAlign: 'center',
  },
  backButton: {
    ...buttonContentCenter,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const StackHeader = memo(StackHeaderComponent);
