import React, { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Package, Trash2 } from 'lucide-react-native';
import { draftCopy } from '@/src/configs/createOrder';
import { lightTokens } from '@/src/configs/theme';
import type { DraftOrderSummary } from '@/src/types/createOrderDraft/createOrderDraft.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface CreateOrderDraftCardProps {
  summary: DraftOrderSummary;
  onPress: (draftId: string) => void;
  onRemove: (draftId: string) => void;
}

function formatDraftDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CreateOrderDraftCardComponent({
  summary,
  onPress,
  onRemove,
}: CreateOrderDraftCardProps) {
  const handlePress = useCallback(() => {
    onPress(summary.id);
  }, [onPress, summary.id]);

  const handleRemove = useCallback(() => {
    onRemove(summary.id);
  }, [onRemove, summary.id]);

  return (
    <Box style={styles.card}>
      <HStack className="items-center" space="md">
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={summary.title}
          style={styles.bodyPressable}>
          <HStack className="min-w-0 flex-1 items-center" space="md">
            <Box style={styles.iconWrap}>
              <Package color={lightTokens.tertiary600} size={22} />
            </Box>

            <VStack className="min-w-0 flex-1" space="xs">
              <Text size="sm" className="font-semibold text-typography-900">
                {summary.title}
              </Text>
              <Text size="xs" className="text-typography-500">
                {summary.subtitle}
              </Text>
              <Text size="xs" className="text-typography-400">
                {formatDraftDate(summary.updatedAt)}
              </Text>
            </VStack>
          </HStack>
        </Pressable>

        <Pressable
          onPress={handleRemove}
          accessibilityRole="button"
          accessibilityLabel={draftCopy.deleteDraft}
          hitSlop={8}
          style={styles.deleteButton}>
          <Trash2 color={lightTokens.error500} size={18} />
        </Pressable>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  bodyPressable: {
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.tertiary50,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const CreateOrderDraftCard = memo(CreateOrderDraftCardComponent);
