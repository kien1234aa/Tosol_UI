import React, { memo, type ReactNode } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import { buttonContentCenter } from '@/src/configs/theme/buttonLayout';
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
  return (
    <Box style={styles.container}>
      <HStack className="w-full items-center justify-between">
        <Box style={styles.sideSlot}>
          {onPressBack ? (
            <RNPressable
              onPress={onPressBack}
              accessibilityRole="button"
              accessibilityLabel={backAccessibilityLabel}
              hitSlop={BACK_HIT_SLOP}
              style={styles.backButton}>
              <ChevronLeft color={lightTokens.typography900} size={24} />
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

        <Box style={styles.sideSlot}>{rightAction ?? null}</Box>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: lightTokens.tertiary50,
    borderBottomWidth: 1,
    borderBottomColor: lightTokens.outline100,
  },
  sideSlot: {
    width: STACK_HEADER_SLOT_WIDTH,
    minHeight: STACK_HEADER_BACK_SIZE,
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
    width: STACK_HEADER_BACK_SIZE,
    height: STACK_HEADER_BACK_SIZE,
    borderRadius: STACK_HEADER_BACK_SIZE / 2,
    ...buttonContentCenter,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const StackHeader = memo(StackHeaderComponent);
