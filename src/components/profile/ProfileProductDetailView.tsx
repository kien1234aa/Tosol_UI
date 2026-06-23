import React, { memo, useMemo } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { productsCopy } from '@/src/configs/products';
import { searchCopy } from '@/src/configs/search';
import {
  formatCatalogPrice,
  formatStockQuantity,
} from '@/src/helpers/search';
import {
  formatProductDetailActiveStatus,
  formatProductDetailBoolean,
  formatProductDetailComboType,
  formatProductDetailDateTime,
  formatProductDetailNumber,
  formatProductDetailText,
  getProductDetailHeroImageUrl,
  getProductDetailStockStatusLabel,
} from '@/src/helpers/products';
import { lightTokens } from '@/src/configs/theme';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import type { ProfileProductDetail } from '@/src/types/products';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

const HERO_HORIZONTAL_PADDING = 32;
const HERO_MAX_HEIGHT = 320;

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

function InfoRow({ label, value }: { label: string; value: string }) {
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

interface ProfileProductDetailViewProps {
  product: ProfileProductDetail;
}

function ProfileProductDetailViewComponent({
  product,
}: ProfileProductDetailViewProps) {
  const { width: windowWidth } = useWindowDimensions();

  const heroHeight = useMemo(() => {
    const contentWidth = windowWidth - HERO_HORIZONTAL_PADDING;
    return Math.min(Math.max(contentWidth, 0), HERO_MAX_HEIGHT);
  }, [windowWidth]);

  const heroImageUrl = useMemo(
    () => getProductDetailHeroImageUrl(product),
    [product],
  );

  const stockStatusLabel = useMemo(
    () => getProductDetailStockStatusLabel(product),
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
          value={`${product.unitLabel} (${product.unit})`}
        />
        <InfoRow
          label={productsCopy.detailPriceLabel}
          value={formatCatalogPrice(product.priceVnd)}
        />
        <InfoRow
          label={productsCopy.detailStatusLabel}
          value={formatProductDetailActiveStatus(product.isActive)}
        />
        <InfoRow
          label={productsCopy.detailIsComboLabel}
          value={formatProductDetailComboType(product.isCombo)}
        />
      </DetailSection>

      <DetailSection title={productsCopy.detailStockSection}>
        <InfoRow
          label={productsCopy.detailAvailableStockLabel}
          value={formatStockQuantity(product.availableStock)}
        />
        <InfoRow
          label={productsCopy.detailReservedStockLabel}
          value={formatStockQuantity(product.reservedStock)}
        />
        <InfoRow
          label={productsCopy.detailTotalStockLabel}
          value={formatStockQuantity(product.totalStock)}
        />
        <InfoRow
          label={productsCopy.detailMinStockLabel}
          value={formatProductDetailNumber(product.minStock)}
        />
        <InfoRow
          label={productsCopy.detailWarehousesCountLabel}
          value={String(product.warehousesCount)}
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
        <InfoRow
          label={productsCopy.detailVolumetricWeightLabel}
          value={formatProductDetailNumber(product.volumetricWeight)}
        />
      </DetailSection>

      <DetailSection title={productsCopy.detailSellerSection}>
        {product.seller ? (
          <>
            <InfoRow
              label={productsCopy.detailSellerCodeLabel}
              value={formatProductDetailText(product.seller.code)}
            />
            <InfoRow
              label={productsCopy.detailSellerNameLabel}
              value={formatProductDetailText(product.seller.name)}
            />
            <InfoRow
              label={productsCopy.detailSellerEmailLabel}
              value={formatProductDetailText(product.seller.email)}
            />
            <InfoRow
              label={productsCopy.detailSellerPhoneLabel}
              value={formatProductDetailText(product.seller.phone)}
            />
            <InfoRow
              label={productsCopy.detailSellerAddressLabel}
              value={formatProductDetailText(product.seller.address)}
            />
            <InfoRow
              label={productsCopy.detailSellerTaxLabel}
              value={formatProductDetailText(product.seller.taxNumber)}
            />
            <InfoRow
              label={productsCopy.detailSellerStatusLabel}
              value={formatProductDetailActiveStatus(product.seller.isActive)}
            />
            <InfoRow
              label={productsCopy.detailCreatedAtLabel}
              value={formatProductDetailDateTime(product.seller.createdAt)}
            />
            <InfoRow
              label={productsCopy.detailUpdatedAtLabel}
              value={formatProductDetailDateTime(product.seller.updatedAt)}
            />
          </>
        ) : (
          <Text size="sm" className="text-typography-500">
            {productsCopy.detailEmptyValue}
          </Text>
        )}
      </DetailSection>

      <DetailSection title={productsCopy.detailRecipeSection}>
        {product.recipeItems.length === 0 ? (
          <Text size="sm" className="text-typography-500">
            {productsCopy.detailNoRecipeItems}
          </Text>
        ) : (
          product.recipeItems.map((item, index) => (
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
          ))
        )}
      </DetailSection>

      <DetailSection title={productsCopy.detailTimestampsSection}>
        <InfoRow
          label={productsCopy.detailCreatedAtLabel}
          value={formatProductDetailDateTime(product.createdAt)}
        />
        <InfoRow
          label={productsCopy.detailUpdatedAtLabel}
          value={formatProductDetailDateTime(product.updatedAt)}
        />
      </DetailSection>

      <DetailSection title={productsCopy.detailDescriptionSection}>
        <Text size="sm" className="leading-6 text-typography-700">
          {product.description?.trim() || productsCopy.detailNoDescription}
        </Text>
      </DetailSection>
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
  recipeItemCard: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: lightTokens.background50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
});

export const ProfileProductDetailView = memo(ProfileProductDetailViewComponent);
