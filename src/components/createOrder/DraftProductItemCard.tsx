import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import {
  draftCopy,
  draftQuantityLimits,
  draftTaxRateLimits,
} from '@/src/configs/createOrder';
import { lightTokens } from '@/src/configs/theme';
import {
  computeLineSubtotalVnd,
  formatVndInputAmount,
  formatVndInputDigits,
  formatVndPrice,
  getDraftProductMaxQuantity,
  getDraftUnitPriceVnd,
  parseVndInputDigits,
} from '@/src/helpers/createOrder';
import type { DraftProductItem } from '@/src/types/createOrderDraft/createOrderDraft.types';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { CreateOrderFieldLabel } from './createOrderFormFields';

interface DraftProductItemCardProps {
  product: DraftProductItem;
  onChangeQuantity: (quantity: number) => void;
  onChangeUnitPrice?: (unitPriceVnd: number) => void;
  onChangeTaxRate?: (taxRatePercent: number) => void;
  onRemove: () => void;
}

interface NumericEditState {
  value: number;
  text: string;
}

function buildProductTitle(product: DraftProductItem): string {
  const variant = product.variant.trim();
  if (!variant || variant === draftCopy.defaultVariant) {
    return product.name;
  }

  return `${product.name} - ${variant}`;
}

function getNumericEditText(
  edit: NumericEditState | null,
  currentValue: number,
): string {
  return edit?.value === currentValue ? edit.text : String(currentValue);
}

function parseIntegerInput(rawValue: string): number | null {
  const parsed = Number.parseInt(rawValue.trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDecimalInput(rawValue: string): number | null {
  const normalized = rawValue.trim().replace(',', '.');
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function DraftProductItemCardComponent({
  product,
  onChangeQuantity,
  onChangeUnitPrice,
  onChangeTaxRate,
  onRemove,
}: DraftProductItemCardProps) {
  const unitPriceVnd = getDraftUnitPriceVnd(product);
  const [quantityEdit, setQuantityEdit] = useState<NumericEditState | null>(null);
  const [unitPriceEdit, setUnitPriceEdit] = useState<NumericEditState | null>(null);
  const [taxRateEdit, setTaxRateEdit] = useState<NumericEditState | null>(null);

  const quantityText = getNumericEditText(quantityEdit, product.quantity);
  const unitPriceText =
    unitPriceEdit?.value === unitPriceVnd
      ? unitPriceEdit.text
      : formatVndInputAmount(unitPriceVnd);
  const taxRateText = getNumericEditText(
    taxRateEdit,
    product.taxRatePercent ?? 0,
  );

  const lineTotalVnd = computeLineSubtotalVnd(product);
  const maxQuantity = getDraftProductMaxQuantity(product);

  const commitQuantity = useCallback(
    (rawValue: string) => {
      const parsed = parseIntegerInput(rawValue);
      setQuantityEdit(null);
      if (parsed == null) {
        return;
      }

      const nextQuantity = Math.min(
        Math.max(parsed, draftQuantityLimits.min),
        maxQuantity,
      );
      if (nextQuantity !== product.quantity) {
        onChangeQuantity(nextQuantity);
      }
    },
    [maxQuantity, onChangeQuantity, product.quantity],
  );

  const commitUnitPrice = useCallback(
    (rawValue: string) => {
      const parsed = parseVndInputDigits(rawValue);
      setUnitPriceEdit(null);
      if (parsed == null || !onChangeUnitPrice) {
        return;
      }

      const nextPrice = Math.max(0, parsed);
      if (nextPrice !== unitPriceVnd) {
        onChangeUnitPrice(nextPrice);
      }
    },
    [onChangeUnitPrice, unitPriceVnd],
  );

  const commitTaxRate = useCallback(
    (rawValue: string) => {
      const parsed = parseDecimalInput(rawValue);
      setTaxRateEdit(null);
      if (parsed == null || !onChangeTaxRate) {
        return;
      }

      const nextTaxRate = Math.min(
        draftTaxRateLimits.max,
        Math.max(draftTaxRateLimits.min, parsed),
      );
      if (nextTaxRate !== (product.taxRatePercent ?? 0)) {
        onChangeTaxRate(nextTaxRate);
      }
    },
    [onChangeTaxRate, product.taxRatePercent],
  );

  const handleQuantityChange = useCallback(
    (value: string) => {
      setQuantityEdit({
        value: product.quantity,
        text: value.replace(/[^\d]/g, ''),
      });
    },
    [product.quantity],
  );

  const handleUnitPriceChange = useCallback(
    (value: string) => {
      const digits = value.replace(/[^\d]/g, '');
      setUnitPriceEdit({
        value: unitPriceVnd,
        text: formatVndInputDigits(digits),
      });
    },
    [unitPriceVnd],
  );

  const handleTaxRateChange = useCallback(
    (value: string) => {
      setTaxRateEdit({
        value: product.taxRatePercent ?? 0,
        text: value.replace(/[^\d.,]/g, ''),
      });
    },
    [product.taxRatePercent],
  );

  return (
    <Box style={styles.card}>
      <HStack className="items-start gap-3">
        <Box style={styles.thumbnail}>
          <ProductThumbnailImage uri={product.thumbnailUrl} />
        </Box>

        <VStack className="min-w-0 flex-1" space="md">
          <HStack className="items-start justify-between gap-2">
            <Text
              size="sm"
              className="min-w-0 flex-1 font-medium text-typography-900"
              numberOfLines={2}>
              {buildProductTitle(product)}
            </Text>
            <Pressable
              onPress={onRemove}
              accessibilityRole="button"
              accessibilityLabel={draftCopy.removeProduct}
              hitSlop={8}
              style={styles.removeButton}>
              <Trash2 color={lightTokens.error500} size={18} />
            </Pressable>
          </HStack>

          <VStack space="sm">
            <HStack className="items-end gap-3">
              <VStack className="min-w-0 flex-1" space="xs">
                <CreateOrderFieldLabel label={draftCopy.unitPriceFieldLabel} />
                <Box style={styles.fieldBox}>
                  <HStack className="items-center gap-1">
                    <TextInput
                      value={unitPriceText}
                      onChangeText={handleUnitPriceChange}
                      onBlur={() => commitUnitPrice(unitPriceText)}
                      keyboardType="number-pad"
                      returnKeyType="done"
                      placeholder={draftCopy.customPricePlaceholder}
                      placeholderTextColor={lightTokens.typography500}
                      onSubmitEditing={() => commitUnitPrice(unitPriceText)}
                      style={[styles.input, styles.priceInput]}
                    />
                    <Text size="sm" className="font-medium text-typography-500">
                      đ
                    </Text>
                  </HStack>
                </Box>
              </VStack>

              <VStack className="min-w-0 flex-1" space="xs">
                <CreateOrderFieldLabel label={draftCopy.quantityLabel} />
                <Box style={styles.fieldBox}>
                  <TextInput
                    value={quantityText}
                    onChangeText={handleQuantityChange}
                    onBlur={() => commitQuantity(quantityText)}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={() => commitQuantity(quantityText)}
                    style={styles.input}
                  />
                </Box>
              </VStack>
            </HStack>

            <HStack className="items-end gap-3">
              <VStack className="min-w-0 flex-1" space="xs">
                <CreateOrderFieldLabel label={draftCopy.taxRateLabel} />
                <Box style={styles.fieldBox}>
                  <TextInput
                    value={taxRateText}
                    onChangeText={handleTaxRateChange}
                    onBlur={() => commitTaxRate(taxRateText)}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    placeholder={draftCopy.taxRatePlaceholder}
                    placeholderTextColor={lightTokens.typography500}
                    onSubmitEditing={() => commitTaxRate(taxRateText)}
                    style={styles.input}
                  />
                </Box>
              </VStack>

              <VStack className="min-w-0 flex-1 items-end" space="xs">
                <CreateOrderFieldLabel label={draftCopy.lineTotalFieldLabel} />
                <Box style={[styles.fieldBox, styles.totalBox]}>
                  <Text size="sm" className="font-bold text-tertiary-600">
                    {unitPriceVnd > 0
                      ? formatVndPrice(lineTotalVnd)
                      : draftCopy.priceOnRequest}
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline200,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    ...productThumbnailContainerStyle,
  },
  fieldBox: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline200,
    backgroundColor: lightTokens.background50,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  totalBox: {
    alignItems: 'flex-end',
    backgroundColor: lightTokens.background0,
    minWidth: 120,
  },
  input: {
    padding: 0,
    margin: 0,
    fontSize: 14,
    color: lightTokens.typography900,
  },
  priceInput: {
    flex: 1,
    minWidth: 0,
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const DraftProductItemCard = memo(DraftProductItemCardComponent);
