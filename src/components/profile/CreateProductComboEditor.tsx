import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ChevronRight, Package, Plus, X } from 'lucide-react-native';
import { productsCopy } from '@/src/configs/products';
import { lightTokens } from '@/src/configs/theme';
import { buttonContentCenter } from '@/src/configs/theme/buttonLayout';
import type {
  CreateProductComboRow,
  ProductSuggestionItem,
} from '@/src/types/products';
import { ComboProductPickerSheet } from '@/src/components/profile/ComboProductPickerSheet';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

export interface CreateProductComboEditorProps {
  rows: CreateProductComboRow[];
  sellerId: number | null;
  warehouseId: number | null;
  disabled?: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onSelectProduct: (rowId: string, product: ProductSuggestionItem) => void;
  onChangeQuantity: (rowId: string, quantity: string) => void;
}

function CreateProductComboEditorComponent({
  rows,
  sellerId,
  warehouseId,
  disabled = false,
  onAddRow,
  onRemoveRow,
  onSelectProduct,
  onChangeQuantity,
}: CreateProductComboEditorProps) {
  const [pickerRowId, setPickerRowId] = useState<string | null>(null);

  const selectedProductIds = useMemo(
    () =>
      rows
        .map(row => row.productId)
        .filter((productId): productId is number => productId != null),
    [rows],
  );

  const pickerRow = useMemo(
    () => rows.find(row => row.rowId === pickerRowId) ?? null,
    [pickerRowId, rows],
  );

  const excludedForPicker = useMemo(() => {
    if (!pickerRow?.productId) {
      return selectedProductIds;
    }

    return selectedProductIds.filter(id => id !== pickerRow.productId);
  }, [pickerRow, selectedProductIds]);

  const openPicker = useCallback(
    (rowId: string) => {
      if (!disabled) {
        setPickerRowId(rowId);
      }
    },
    [disabled],
  );

  const closePicker = useCallback(() => {
    setPickerRowId(null);
  }, []);

  const handleSelectProduct = useCallback(
    (product: ProductSuggestionItem) => {
      if (pickerRowId) {
        onSelectProduct(pickerRowId, product);
      }
    },
    [onSelectProduct, pickerRowId],
  );

  return (
    <>
      <Box style={styles.tableCard}>
        <HStack className="items-center gap-3 px-4 py-3" style={styles.tableHeader}>
          <Text
            size="xs"
            className="flex-1 font-semibold uppercase tracking-wide text-typography-500">
            {productsCopy.comboSelectIngredientHeader}
          </Text>
          <Text
            size="xs"
            className="font-semibold uppercase tracking-wide text-typography-500"
            style={styles.quantityHeader}>
            {productsCopy.comboQuantityPerComboHeader}
          </Text>
          <Box style={styles.removeHeaderSpacer} />
        </HStack>

        <VStack space="sm" style={styles.tableBody}>
          {rows.map(row => (
            <ComboIngredientRow
              key={row.rowId}
              row={row}
              disabled={disabled}
              onOpenPicker={() => openPicker(row.rowId)}
              onRemove={() => onRemoveRow(row.rowId)}
              onChangeQuantity={quantity =>
                onChangeQuantity(row.rowId, quantity)
              }
            />
          ))}
        </VStack>
      </Box>

      <Pressable
        onPress={onAddRow}
        disabled={disabled || sellerId == null}
        accessibilityRole="button"
        accessibilityLabel={productsCopy.addComboItem}
        style={[
          styles.addButton,
          disabled || sellerId == null ? styles.disabled : undefined,
        ]}>
        <HStack className="items-center gap-2">
          <Plus color={lightTokens.tertiary600} size={18} />
          <Text size="md" className="font-medium text-tertiary-700">
            {productsCopy.addComboItem}
          </Text>
        </HStack>
      </Pressable>

      <ComboProductPickerSheet
        visible={pickerRowId != null}
        sellerId={sellerId}
        warehouseId={warehouseId}
        excludedProductIds={excludedForPicker}
        onClose={closePicker}
        onSelect={handleSelectProduct}
      />
    </>
  );
}

interface ComboIngredientRowProps {
  row: CreateProductComboRow;
  disabled: boolean;
  onOpenPicker: () => void;
  onRemove: () => void;
  onChangeQuantity: (quantity: string) => void;
}

function ComboIngredientRow({
  row,
  disabled,
  onOpenPicker,
  onRemove,
  onChangeQuantity,
}: ComboIngredientRowProps) {
  const hasProduct = row.productId != null;

  return (
    <View style={styles.rowWrap}>
      <HStack className="items-center gap-3 px-3 py-3">
        <Pressable
          onPress={onOpenPicker}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={productsCopy.comboSelectProduct}
          style={[styles.selectTrigger, disabled ? styles.disabled : undefined]}>
          <HStack className="min-w-0 flex-1 items-center gap-3">
            <Box style={styles.selectIconWrap}>
              {hasProduct ? (
                <ProductThumbnailImage uri={row.thumbnailUrl} />
              ) : (
                <Package color={lightTokens.typography500} size={20} />
              )}
            </Box>
            <Text
              size="md"
              className={
                hasProduct
                  ? 'min-w-0 flex-1 font-medium text-typography-900'
                  : 'min-w-0 flex-1 text-typography-500'
              }
              numberOfLines={3}>
              {hasProduct ? row.name : productsCopy.comboSelectProduct}
            </Text>
            <ChevronRight color={lightTokens.typography500} size={18} />
          </HStack>
        </Pressable>

        <HStack className="items-center gap-2" style={styles.quantityCell}>
          <TextInput
            value={row.quantity}
            onChangeText={onChangeQuantity}
            editable={!disabled && hasProduct}
            keyboardType="numeric"
            style={[
              styles.quantityInput,
              !hasProduct ? styles.quantityInputDisabled : undefined,
            ]}
            selectTextOnFocus
          />
          <Text size="sm" className="text-typography-500" numberOfLines={1}>
            {row.unitLabel || row.unit}
          </Text>
        </HStack>

        <Pressable
          onPress={onRemove}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={productsCopy.removeComboItem}
          style={[styles.removeButton, disabled ? styles.disabled : undefined]}>
          <X color={lightTokens.error500} size={18} />
        </Pressable>
      </HStack>
    </View>
  );
}

const styles = StyleSheet.create({
  tableCard: {
    borderRadius: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  tableHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTokens.outline100,
    backgroundColor: lightTokens.background50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tableBody: {
    paddingVertical: 12,
  },
  quantityHeader: {
    width: 108,
    textAlign: 'center',
  },
  removeHeaderSpacer: {
    width: 36,
  },
  rowWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightTokens.outline100,
  },
  selectTrigger: {
    flex: 1,
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  selectIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    overflow: 'hidden',
    ...productThumbnailContainerStyle,
  },
  quantityCell: {
    width: 108,
  },
  quantityInput: {
    width: 52,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 8,
    textAlign: 'center',
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    color: lightTokens.typography900,
    fontSize: 16,
  },
  quantityInputDisabled: {
    backgroundColor: lightTokens.background50,
    color: lightTokens.typography500,
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    ...buttonContentCenter,
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  disabled: {
    opacity: 0.65,
  },
});

export const CreateProductComboEditor = memo(CreateProductComboEditorComponent);
