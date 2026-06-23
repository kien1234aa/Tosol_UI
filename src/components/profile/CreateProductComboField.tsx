import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ChevronRight, Layers } from 'lucide-react-native';
import { productsCopy } from '@/src/configs/products';
import { getFilledComboRows } from '@/src/helpers/products';
import { lightTokens } from '@/src/configs/theme';
import type { CreateProductComboRow } from '@/src/types/products';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

export interface CreateProductComboFieldProps {
  rows: CreateProductComboRow[];
  disabled?: boolean;
  error?: string;
  onPressConfigure: () => void;
}

function CreateProductComboFieldComponent({
  rows,
  disabled = false,
  error,
  onPressConfigure,
}: CreateProductComboFieldProps) {
  const filledRows = useMemo(() => getFilledComboRows(rows), [rows]);

  const summaryText =
    filledRows.length === 0
      ? productsCopy.comboSummaryEmpty
      : productsCopy.comboSummaryCount(filledRows.length);

  return (
    <VStack space="sm">
      <Text size="sm" className="font-medium text-typography-700">
        {productsCopy.comboItemsSection}
      </Text>

      <Pressable
        onPress={onPressConfigure}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={productsCopy.comboConfigureButton}
        style={[styles.card, disabled ? styles.disabled : undefined]}>
        <HStack className="items-center gap-3">
          <Box style={styles.iconWrap}>
            <Layers color={lightTokens.tertiary600} size={20} />
          </Box>
          <VStack className="min-w-0 flex-1" space="xs">
            <Text size="md" className="font-semibold text-typography-900">
              {productsCopy.comboConfigureButton}
            </Text>
            <Text size="sm" className="text-typography-500">
              {summaryText}
            </Text>
          </VStack>
          <ChevronRight color={lightTokens.typography500} size={18} />
        </HStack>
      </Pressable>

      {filledRows.length > 0 ? (
        <VStack space="xs" style={styles.previewList}>
          {filledRows.map(row => (
            <Text
              key={row.rowId}
              size="sm"
              className="text-typography-600"
              numberOfLines={1}>
              • {row.name} × {row.quantity} {row.unitLabel || row.unit}
            </Text>
          ))}
        </VStack>
      ) : null}

      {error ? (
        <Text size="xs" className="text-error-500">
          {error}
        </Text>
      ) : null}
    </VStack>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.tertiary50,
  },
  previewList: {
    paddingHorizontal: 4,
  },
  disabled: {
    opacity: 0.65,
  },
});

export const CreateProductComboField = memo(CreateProductComboFieldComponent);
