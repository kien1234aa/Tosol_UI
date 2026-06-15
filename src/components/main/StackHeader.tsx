import React, { memo, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { lightTokens } from '@/src/configs/theme';
import { buttonContentCenter } from '@/src/configs/theme/buttonLayout';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Heading } from '@/src/uikits/heading';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';

export const STACK_HEADER_SLOT_WIDTH = 72;
export const STACK_HEADER_BACK_SIZE = 40;

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
      <HStack className="relative w-full items-center">
        <Center style={styles.sideSlot}>
          {onPressBack ? (
            <Pressable
              onPress={onPressBack}
              accessibilityRole="button"
              accessibilityLabel={backAccessibilityLabel}
              style={styles.backButton}>
              <ChevronLeft color={lightTokens.typography900} size={24} />
            </Pressable>
          ) : null}
        </Center>

        <Heading
          size="md"
          numberOfLines={1}
          className={
            uppercase
              ? 'absolute inset-x-0 text-center font-bold uppercase text-typography-900'
              : 'absolute inset-x-0 text-center font-bold text-typography-900'
          }
          pointerEvents="none">
          {title}
        </Heading>

        <Center style={styles.sideSlot}>{rightAction ?? null}</Center>
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
  },
  backButton: {
    width: STACK_HEADER_BACK_SIZE,
    height: STACK_HEADER_BACK_SIZE,
    borderRadius: STACK_HEADER_BACK_SIZE / 2,
    ...buttonContentCenter,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
});

export const StackHeader = memo(StackHeaderComponent);
