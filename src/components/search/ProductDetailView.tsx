import React, { memo, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Store } from 'lucide-react-native';
import { productDetailCopy, searchCopy } from '@/src/configs/search';
import {
  formatCatalogPrice,
  formatProductDimensions,
  formatProductUnit,
  formatStockQuantity,
  getProductHeroImageUrl,
  getProductStockStatusLabel,
} from '@/src/helpers/search';
import { lightTokens } from '@/src/configs/theme';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import {
  buttonContentCenter,
  buttonLabelStyle,
} from '@/src/configs/theme/buttonLayout';
import type {
  ProductDetailPricing,
  SearchProduct,
} from '@/src/types/search/search.types';
import { Box } from '@/src/uikits/box';
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
  canDecreaseQuantity: boolean;
  canIncreaseQuantity: boolean;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
}

const HERO_HORIZONTAL_PADDING = 32;
const HERO_MAX_HEIGHT = 320;

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <HStack className="items-start justify-between gap-3">
      <Text size="sm" className="text-typography-500">
        {label}
      </Text>
      <Text
        size="sm"
        className="flex-1 text-right font-medium text-typography-900">
        {value}
      </Text>
    </HStack>
  );
}

function ProductDetailContentComponent({
  product,
  quantity,
  canDecreaseQuantity,
  canIncreaseQuantity,
  onDecreaseQuantity,
  onIncreaseQuantity,
}: ProductDetailContentProps) {
  const { width: windowWidth } = useWindowDimensions();
  const heroHeight = useMemo(() => {
    const contentWidth = windowWidth - HERO_HORIZONTAL_PADDING;
    return Math.min(Math.max(contentWidth, 0), HERO_MAX_HEIGHT);
  }, [windowWidth]);
  const heroImageUrl = useMemo(
    () => getProductHeroImageUrl(product),
    [product],
  );
  const stockStatusLabel = useMemo(
    () => getProductStockStatusLabel(product),
    [product],
  );
  const dimensions = useMemo(
    () => formatProductDimensions(product),
    [product],
  );

  const stockBadgeStyle = useMemo(() => {
    if (product.isOutOfStock) {
      return styles.stockBadgeDanger;
    }

    if (product.isLowStock) {
      return styles.stockBadgeWarning;
    }

    return styles.stockBadgeSuccess;
  }, [product.isLowStock, product.isOutOfStock]);

  return (
    <VStack className="w-full" space="lg">
      <Box style={[styles.hero, { height: heroHeight }]}>
        <ProductThumbnailImage uri={heroImageUrl} />

        {stockStatusLabel ? (
          <View style={[styles.stockBadge, stockBadgeStyle]}>
            <Text size="xs" className="font-semibold text-typography-0">
              {stockStatusLabel}
            </Text>
          </View>
        ) : null}
      </Box>

      <VStack space="sm">
        <Text size="xl" className="font-bold leading-7 text-typography-900">
          {product.name}
        </Text>

        <Text size="2xl" className="font-bold text-tertiary-600">
          {formatCatalogPrice(product.priceVnd)}
        </Text>

        {product.sku ? (
          <Text size="sm" className="text-typography-500">
            {searchCopy.skuLabel}: {product.sku}
          </Text>
        ) : null}
      </VStack>

      <Box style={styles.sectionCard}>
        <VStack space="sm">
          <Text size="sm" className="font-semibold text-typography-900">
            {productDetailCopy.stockSection}
          </Text>
          <InfoRow
            label={productDetailCopy.availableStockLabel}
            value={formatStockQuantity(product.availableStock ?? 0)}
          />
          <InfoRow
            label={productDetailCopy.reservedStockLabel}
            value={formatStockQuantity(product.reservedStock ?? 0)}
          />
          <InfoRow
            label={productDetailCopy.totalStockLabel}
            value={formatStockQuantity(product.totalStock ?? 0)}
          />
          {(product.warehousesCount ?? 0) > 0 ? (
            <InfoRow
              label={searchCopy.warehouseCountLabel}
              value={String(product.warehousesCount)}
            />
          ) : null}
        </VStack>
      </Box>

      <Box style={styles.sectionCard}>
        <HStack className="items-center justify-between">
          <VStack space="xs">
            <Text size="sm" className="font-semibold text-typography-900">
              {productDetailCopy.quantitySection}
            </Text>
            <Text size="xs" className="text-typography-500">
              {productDetailCopy.unitPriceLabel}:{' '}
              {formatCatalogPrice(product.priceVnd)}
            </Text>
          </VStack>
          <ProductQuantitySelector
            quantity={quantity}
            canDecrease={canDecreaseQuantity}
            canIncrease={canIncreaseQuantity}
            onDecrease={onDecreaseQuantity}
            onIncrease={onIncreaseQuantity}
          />
        </HStack>
      </Box>

      {(product.weight ?? 0) > 0 || dimensions ? (
        <Box style={styles.sectionCard}>
          <VStack space="sm">
            <Text size="sm" className="font-semibold text-typography-900">
              {productDetailCopy.dimensionsSection}
            </Text>
            {(product.weight ?? 0) > 0 ? (
              <InfoRow
                label={productDetailCopy.weightLabel}
                value={`${formatStockQuantity(product.weight ?? 0)} g`}
              />
            ) : null}
            {dimensions ? (
              <InfoRow
                label={productDetailCopy.dimensionsLabel}
                value={dimensions}
              />
            ) : null}
            {product.unit ? (
              <InfoRow
                label={productDetailCopy.unitLabel}
                value={formatProductUnit(product.unit)}
              />
            ) : null}
            {product.barcode ? (
              <InfoRow
                label={productDetailCopy.barcodeLabel}
                value={product.barcode}
              />
            ) : null}
          </VStack>
        </Box>
      ) : null}

      {product.sellerName ? (
        <Box style={styles.sectionCard}>
          <HStack className="items-start gap-2">
            <Store color={lightTokens.tertiary600} size={18} />
            <VStack className="flex-1" space="xs">
              <Text size="xs" className="text-typography-500">
                {productDetailCopy.sellerSection}
              </Text>
              <Text size="sm" className="font-semibold text-typography-900">
                {product.sellerName}
              </Text>
              {product.sellerPhone ? (
                <Text size="sm" className="text-typography-600">
                  {product.sellerPhone}
                </Text>
              ) : null}
              {product.sellerEmail ? (
                <Text size="sm" className="text-typography-500">
                  {product.sellerEmail}
                </Text>
              ) : null}
            </VStack>
          </HStack>
        </Box>
      ) : null}

      <VStack space="sm">
        <Text size="lg" className="font-bold text-typography-900">
          {productDetailCopy.descriptionSection}
        </Text>
        <Box style={styles.sectionCard}>
          <Text size="sm" className="leading-6 text-typography-700">
            {product.description || productDetailCopy.noDescription}
          </Text>
        </Box>
      </VStack>
    </VStack>
  );
}

interface ProductDetailActionsProps {
  pricing: ProductDetailPricing;
  disabled?: boolean;
  onPressBuyNow?: () => void;
}

function ProductDetailActionsComponent({
  pricing,
  disabled = false,
  onPressBuyNow,
}: ProductDetailActionsProps) {
  return (
    <VStack style={styles.actionsContainer}>
      <HStack className="items-center justify-between">
        <Text size="xs" className="text-typography-500">
          {productDetailCopy.totalLabel}
        </Text>
        <Text size="sm" className="font-bold text-tertiary-600">
          {formatCatalogPrice(pricing.totalPriceVnd)}
        </Text>
      </HStack>

      <Pressable
        onPress={onPressBuyNow}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={productDetailCopy.createOrder}
        accessibilityState={{ disabled }}
        style={[
          styles.actionButton,
          styles.primaryButton,
          disabled && styles.disabledButton,
        ]}>
        <Text
          size="sm"
          className="font-semibold text-typography-0"
          style={buttonLabelStyle}>
          {productDetailCopy.createOrder}
        </Text>
      </Pressable>
    </VStack>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 16,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    ...productThumbnailContainerStyle,
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stockBadgeSuccess: {
    backgroundColor: lightTokens.tertiary600,
  },
  stockBadgeWarning: {
    backgroundColor: 'rgb(217, 119, 6)',
  },
  stockBadgeDanger: {
    backgroundColor: lightTokens.error500,
  },
  sectionCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  actionsContainer: {
    gap: 8,
  },
  actionsRow: {
    width: '100%',
    gap: 10,
  },
  actionButton: {
    ...buttonContentCenter,
    height: 40,
    borderRadius: 10,
  },
  outlineButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary500,
    backgroundColor: lightTokens.background0,
  },
  primaryButton: {
    backgroundColor: lightTokens.tertiary500,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export const ProductDetailHeader = memo(ProductDetailHeaderComponent);
export const ProductDetailContent = memo(ProductDetailContentComponent);
export const ProductDetailActions = memo(ProductDetailActionsComponent);
