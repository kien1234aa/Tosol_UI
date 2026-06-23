import React, { memo, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Store } from 'lucide-react-native';
import { productsCopy } from '@/src/configs/products';
import { productDetailCopy, searchCopy } from '@/src/configs/search';
import {
  formatCatalogPrice,
  formatProductDimensions,
  formatProductUnit,
  formatStockQuantity,
  getProductHeroImageUrl,
  getProductStockStatusLabel,
} from '@/src/helpers/search';
import {
  formatProductDetailActiveStatus,
  formatProductDetailBoolean,
  formatProductDetailComboType,
  formatProductDetailDateTime,
  formatProductDetailNumber,
  formatProductDetailText,
} from '@/src/helpers/products';
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
      <Text size="sm" className="shrink text-typography-500">
        {label}
      </Text>
      <Text
        size="sm"
        selectable
        className="flex-1 text-right font-medium text-typography-900">
        {value}
      </Text>
    </HStack>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box style={styles.sectionCard}>
      <Text size="sm" className="mb-3 font-semibold text-typography-900">
        {title}
      </Text>
      <VStack space="sm">{children}</VStack>
    </Box>
  );
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: 'success' | 'neutral' | 'combo';
}) {
  const style =
    variant === 'success'
      ? styles.activeBadge
      : variant === 'combo'
        ? styles.comboBadge
        : styles.inactiveBadge;

  return (
    <Box style={[styles.statusBadge, style]}>
      <Text size="2xs" className="font-medium text-typography-700">
        {label}
      </Text>
    </Box>
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
        <ProductThumbnailImage uri={heroImageUrl} priority="high" />

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

        <HStack className="flex-wrap gap-2">
          {product.isActive != null ? (
            <StatusBadge
              label={formatProductDetailActiveStatus(product.isActive)}
              variant={product.isActive ? 'success' : 'neutral'}
            />
          ) : null}
          {product.isCombo ? (
            <StatusBadge
              label={productsCopy.detailCombo}
              variant="combo"
            />
          ) : null}
        </HStack>

        {product.sku ? (
          <Text size="sm" className="text-typography-500">
            {searchCopy.skuLabel}: {product.sku}
          </Text>
        ) : null}
      </VStack>

      <DetailSection title={productsCopy.detailBasicSection}>
        <InfoRow
          label={productsCopy.skuLabel}
          value={formatProductDetailText(product.sku)}
        />
        <InfoRow
          label={productsCopy.detailBarcodeLabel}
          value={formatProductDetailText(product.barcode)}
        />
        <InfoRow
          label={productsCopy.detailUnitLabel}
          value={
            product.unitLabel && product.unit
              ? `${product.unitLabel} (${product.unit})`
              : formatProductUnit(product.unit)
          }
        />
        <InfoRow
          label={productsCopy.detailPriceLabel}
          value={formatCatalogPrice(product.priceVnd)}
        />
        {product.isActive != null ? (
          <InfoRow
            label={productsCopy.detailStatusLabel}
            value={formatProductDetailActiveStatus(product.isActive)}
          />
        ) : null}
        {product.isCombo != null ? (
          <InfoRow
            label={productsCopy.detailIsComboLabel}
            value={formatProductDetailComboType(product.isCombo)}
          />
        ) : null}
      </DetailSection>

      <DetailSection title={productsCopy.detailStockSection}>
        <InfoRow
          label={productsCopy.detailAvailableStockLabel}
          value={formatStockQuantity(product.availableStock ?? 0)}
        />
        <InfoRow
          label={productsCopy.detailReservedStockLabel}
          value={formatStockQuantity(product.reservedStock ?? 0)}
        />
        <InfoRow
          label={productsCopy.detailTotalStockLabel}
          value={formatStockQuantity(product.totalStock ?? 0)}
        />
        <InfoRow
          label={productsCopy.detailMinStockLabel}
          value={formatProductDetailNumber(product.minStock)}
        />
        <InfoRow
          label={productsCopy.detailWarehousesCountLabel}
          value={String(product.warehousesCount ?? 0)}
        />
        <InfoRow
          label={productsCopy.detailIsInStockLabel}
          value={formatProductDetailBoolean(product.isInStock)}
        />
        <InfoRow
          label={productsCopy.detailIsLowStockLabel}
          value={formatProductDetailBoolean(product.isLowStock)}
        />
        <InfoRow
          label={productsCopy.detailIsBelowMinStockLabel}
          value={formatProductDetailBoolean(product.isBelowMinStock)}
        />
        <InfoRow
          label={productsCopy.detailIsOutOfStockLabel}
          value={formatProductDetailBoolean(product.isOutOfStock)}
        />
      </DetailSection>

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

      <DetailSection title={productsCopy.detailDimensionsSection}>
        <InfoRow
          label={productsCopy.detailWeightLabel}
          value={formatProductDetailNumber(product.weight, ' g')}
        />
        <InfoRow
          label={productsCopy.detailLengthLabel}
          value={formatProductDetailNumber(product.length, ' cm')}
        />
        <InfoRow
          label={productsCopy.detailWidthLabel}
          value={formatProductDetailNumber(product.width, ' cm')}
        />
        <InfoRow
          label={productsCopy.detailHeightLabel}
          value={formatProductDetailNumber(product.height, ' cm')}
        />
        {dimensions ? (
          <InfoRow
            label={productDetailCopy.dimensionsLabel}
            value={dimensions}
          />
        ) : null}
        <InfoRow
          label={productsCopy.detailVolumetricWeightLabel}
          value={formatProductDetailNumber(product.volumetricWeight)}
        />
      </DetailSection>

      {product.sellerName ? (
        <DetailSection title={productsCopy.detailSellerSection}>
          <HStack className="mb-1 items-start gap-2">
            <Store color={lightTokens.tertiary600} size={18} />
            <Text size="sm" className="flex-1 font-semibold text-typography-900">
              {product.sellerName}
            </Text>
          </HStack>
          {product.sellerCode ? (
            <InfoRow
              label={productsCopy.detailSellerCodeLabel}
              value={formatProductDetailText(product.sellerCode)}
            />
          ) : null}
          {product.sellerPhone ? (
            <InfoRow
              label={productsCopy.detailSellerPhoneLabel}
              value={formatProductDetailText(product.sellerPhone)}
            />
          ) : null}
          {product.sellerEmail ? (
            <InfoRow
              label={productsCopy.detailSellerEmailLabel}
              value={formatProductDetailText(product.sellerEmail)}
            />
          ) : null}
          {product.sellerAddress ? (
            <InfoRow
              label={productsCopy.detailSellerAddressLabel}
              value={formatProductDetailText(product.sellerAddress)}
            />
          ) : null}
          {product.sellerTaxNumber ? (
            <InfoRow
              label={productsCopy.detailSellerTaxLabel}
              value={formatProductDetailText(product.sellerTaxNumber)}
            />
          ) : null}
          {product.sellerIsActive != null ? (
            <InfoRow
              label={productsCopy.detailSellerStatusLabel}
              value={formatProductDetailActiveStatus(product.sellerIsActive)}
            />
          ) : null}
        </DetailSection>
      ) : null}

      {product.isCombo && (product.recipeItems?.length ?? 0) > 0 ? (
        <DetailSection title={productsCopy.detailRecipeSection}>
          {product.recipeItems?.map((item, index) => (
            <Box
              key={item.id ?? `recipe-${index}`}
              style={styles.recipeItemCard}>
              <VStack space="xs">
                <InfoRow
                  label={productsCopy.detailRecipeComponentLabel}
                  value={formatProductDetailText(item.componentName)}
                />
                <InfoRow
                  label={searchCopy.skuLabel}
                  value={formatProductDetailText(item.componentSku)}
                />
                <InfoRow
                  label={productsCopy.detailRecipeQuantityLabel}
                  value={formatProductDetailText(item.quantity)}
                />
              </VStack>
            </Box>
          ))}
        </DetailSection>
      ) : null}

      <DetailSection title={productsCopy.detailDescriptionSection}>
        <Text size="sm" className="leading-6 text-typography-700">
          {product.description || productsCopy.detailNoDescription}
        </Text>
      </DetailSection>

      {product.createdAt || product.updatedAt ? (
        <DetailSection title={productsCopy.detailTimestampsSection}>
          {product.createdAt ? (
            <InfoRow
              label={productsCopy.detailCreatedAtLabel}
              value={formatProductDetailDateTime(product.createdAt)}
            />
          ) : null}
          {product.updatedAt ? (
            <InfoRow
              label={productsCopy.detailUpdatedAtLabel}
              value={formatProductDetailDateTime(product.updatedAt)}
            />
          ) : null}
        </DetailSection>
      ) : null}
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
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: 'rgb(220, 252, 231)',
  },
  inactiveBadge: {
    backgroundColor: lightTokens.background100,
  },
  comboBadge: {
    backgroundColor: lightTokens.tertiary50,
  },
  recipeItemCard: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const ProductDetailHeader = memo(ProductDetailHeaderComponent);
export const ProductDetailContent = memo(ProductDetailContentComponent);
export const ProductDetailActions = memo(ProductDetailActionsComponent);
