import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Package, Star, Store } from 'lucide-react-native';
import { productDetailCopy } from '@/src/configs/search';
import {
  formatCnyPrice,
  formatExchangeRate,
  formatProductPrice,
  formatSoldCount,
} from '@/src/helpers/search';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonFlex,
  buttonFooterAction,
  buttonLabelStyle,
} from '@/src/configs/theme/buttonLayout';
import type {
  ProductDetailPricing,
  SearchProduct,
} from '@/src/types/search/search.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { StackHeader } from '@/src/components/main';
import { ProductQuantitySelector } from './ProductQuantitySelector';

interface ProductDetailHeaderProps {
  onPressBack: () => void;
}

function ProductDetailHeaderComponent({ onPressBack }: ProductDetailHeaderProps) {
  return (
    <StackHeader
      title={productDetailCopy.screenTitle}
      onPressBack={onPressBack}
      backAccessibilityLabel={productDetailCopy.back}
      uppercase={false}
    />
  );
}

interface ProductDetailContentProps {
  product: SearchProduct;
  quantity: number;
  pricing: ProductDetailPricing;
  canDecreaseQuantity: boolean;
  canIncreaseQuantity: boolean;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
}

const HERO_ICON_SIZE = 56;
const STAR_ICON_SIZE = 16;

function ProductDetailContentComponent({
  product,
  quantity,
  pricing,
  canDecreaseQuantity,
  canIncreaseQuantity,
  onDecreaseQuantity,
  onIncreaseQuantity,
}: ProductDetailContentProps) {
  const showOriginalPrice =
    pricing.originalUnitPriceCny != null &&
    pricing.originalUnitPriceCny > pricing.unitPriceCny;

  return (
    <VStack className="w-full" space="lg">
      <Center style={styles.hero}>
        <Package color={lightTokens.tertiary500} size={HERO_ICON_SIZE} />
      </Center>

      <VStack space="sm">
        <Text size="xl" className="font-bold leading-7 text-typography-900">
          {product.name}
        </Text>

        <HStack className="items-end gap-2">
          <Text size="2xl" className="font-bold text-tertiary-600">
            {formatCnyPrice(pricing.unitPriceCny)}
          </Text>
          <Text size="sm" className="pb-1 text-typography-500">
            {productDetailCopy.approxLabel}{' '}
            {formatProductPrice(pricing.unitPriceVnd)}
          </Text>
          {showOriginalPrice ? (
            <Text
              size="sm"
              className="pb-1 text-typography-500"
              style={styles.originalPrice}>
              {formatCnyPrice(pricing.originalUnitPriceCny!)}
            </Text>
          ) : null}
          {pricing.discountPercent != null ? (
            <Box style={styles.discountBadge}>
              <Text size="xs" className="font-semibold text-typography-0">
                -{pricing.discountPercent}%
              </Text>
            </Box>
          ) : null}
        </HStack>

        <HStack className="items-center gap-4">
          <HStack className="items-center gap-1">
            <Star
              color={lightTokens.tertiary500}
              size={STAR_ICON_SIZE}
              fill={lightTokens.tertiary500}
            />
            <Text size="sm" className="font-medium text-typography-900">
              {product.rating.toFixed(1)}
            </Text>
            <Text size="sm" className="text-typography-500">
              {productDetailCopy.ratingLabel}
            </Text>
          </HStack>
          <Text size="sm" className="text-typography-500">
            {formatSoldCount(product.soldCount)} {productDetailCopy.soldLabel}
          </Text>
        </HStack>
      </VStack>

      <Box style={styles.sectionCard}>
        <VStack space="md">
          <HStack className="items-center justify-between">
            <Text size="sm" className="font-semibold text-typography-900">
              {productDetailCopy.quantitySection}
            </Text>
            <ProductQuantitySelector
              quantity={quantity}
              canDecrease={canDecreaseQuantity}
              canIncrease={canIncreaseQuantity}
              onDecrease={onDecreaseQuantity}
              onIncrease={onIncreaseQuantity}
            />
          </HStack>

          <Box style={styles.innerDivider} />

          <VStack space="sm">
            <Text size="sm" className="font-semibold text-typography-900">
              {productDetailCopy.exchangeSection}
            </Text>
            <Text size="xs" className="text-typography-500">
              {productDetailCopy.exchangeRateLabel}:{' '}
              {formatExchangeRate(pricing.exchangeRate)}
            </Text>

            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                {productDetailCopy.unitPriceLabel}
              </Text>
              <VStack className="items-end" space="xs">
                <Text size="sm" className="font-medium text-typography-900">
                  {formatCnyPrice(pricing.unitPriceCny)}
                </Text>
                <Text size="xs" className="text-typography-500">
                  {productDetailCopy.approxLabel}{' '}
                  {formatProductPrice(pricing.unitPriceVnd)}
                </Text>
              </VStack>
            </HStack>

            <HStack className="items-center justify-between">
              <Text size="sm" className="font-semibold text-typography-900">
                {productDetailCopy.totalLabel} ({quantity})
              </Text>
              <VStack className="items-end" space="xs">
                <Text size="md" className="font-bold text-tertiary-600">
                  {formatCnyPrice(pricing.totalPriceCny)}
                </Text>
                <Text size="sm" className="font-semibold text-typography-900">
                  {productDetailCopy.approxLabel}{' '}
                  {formatProductPrice(pricing.totalPriceVnd)}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </Box>

      <Box style={styles.sectionCard}>
        <HStack className="items-center gap-2">
          <Store color={lightTokens.tertiary600} size={18} />
          <VStack space="xs">
            <Text size="xs" className="text-typography-500">
              {productDetailCopy.sellerSection}
            </Text>
            <Text size="sm" className="font-semibold text-typography-900">
              {product.seller}
            </Text>
          </VStack>
        </HStack>
      </Box>

      <VStack space="sm">
        <Text size="lg" className="font-bold text-typography-900">
          {productDetailCopy.descriptionSection}
        </Text>
        <Box style={styles.sectionCard}>
          <Text size="sm" className="leading-6 text-typography-700">
            {product.description}
          </Text>
        </Box>
      </VStack>
    </VStack>
  );
}

interface ProductDetailActionsProps {
  pricing: ProductDetailPricing;
  onPressAddToCart?: () => void;
  onPressBuyNow?: () => void;
}

function ProductDetailActionsComponent({
  pricing,
  onPressAddToCart,
  onPressBuyNow,
}: ProductDetailActionsProps) {
  return (
    <VStack space="sm">
      <HStack className="items-center justify-between">
        <Text size="sm" className="text-typography-500">
          {productDetailCopy.totalLabel}
        </Text>
        <VStack className="items-end" space="xs">
          <Text size="sm" className="font-bold text-tertiary-600">
            {formatCnyPrice(pricing.totalPriceCny)}
          </Text>
          <Text size="xs" className="font-semibold text-typography-900">
            {productDetailCopy.approxLabel}{' '}
            {formatProductPrice(pricing.totalPriceVnd)}
          </Text>
        </VStack>
      </HStack>

      <HStack className="w-full" space="md">
        <Pressable
          onPress={onPressAddToCart}
          accessibilityRole="button"
          accessibilityLabel={productDetailCopy.addToCart}
          style={[buttonFooterAction, buttonFlex, styles.outlineButton]}>
          <Text
            size="sm"
            className="font-semibold text-tertiary-600"
            style={buttonLabelStyle}>
            {productDetailCopy.addToCart}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPressBuyNow}
          accessibilityRole="button"
          accessibilityLabel={productDetailCopy.buyNow}
          style={[buttonFooterAction, buttonFlex, styles.primaryButton]}>
          <Text
            size="sm"
            className="font-semibold text-typography-0"
            style={buttonLabelStyle}>
            {productDetailCopy.buyNow}
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
  discountBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    backgroundColor: lightTokens.error500,
  },
  sectionCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
  innerDivider: {
    height: 1,
    backgroundColor: lightTokens.outline100,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: lightTokens.tertiary500,
    backgroundColor: lightTokens.background0,
  },
  primaryButton: {
    backgroundColor: lightTokens.tertiary500,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
});

export const ProductDetailHeader = memo(ProductDetailHeaderComponent);
export const ProductDetailContent = memo(ProductDetailContentComponent);
export const ProductDetailActions = memo(ProductDetailActionsComponent);
