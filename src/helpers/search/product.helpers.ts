import { productDetailCopy, searchCopy } from '@/src/configs/search';
import { exchangeConfig } from '@/src/configs/search';
import { formatProductPrice } from '@/src/helpers/search/search.helpers';
import {
  getProductDetailHeroImageUrl,
  mapProductDetailApiToProfileDetail,
} from '@/src/helpers/products';
import type {
  ProductApiItem,
  ProductDetailApiItem,
} from '@/src/types/products';
import type { SearchProduct } from '@/src/types/search/search.types';

function parseApiNumber(value: string | null | undefined): number {
  if (value == null || value === '') {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapBaseProductFields(item: ProductApiItem): SearchProduct {
  const priceVnd = parseApiNumber(item.price);
  const availableStock = parseApiNumber(item.available_stock);
  const totalStock = parseApiNumber(item.total_stock);
  const reservedStock = parseApiNumber(item.reserved_stock);

  return {
    id: String(item.id),
    name: item.name,
    priceCny: priceVnd > 0 ? priceVnd / exchangeConfig.cnyToVnd : 0,
    description: item.description ?? '',
    seller: item.sku,
    rating: 0,
    soldCount: availableStock,
    thumbnailUrl: item.thumbnail_url ?? item.image_url,
    imageUrl: item.image_url,
    priceVnd,
    sku: item.sku,
    unit: item.unit,
    availableStock,
    totalStock,
    reservedStock,
    warehousesCount: item.warehouses_count,
    isInStock: item.is_in_stock,
    isLowStock: item.is_low_stock,
    isOutOfStock: item.is_out_of_stock,
    weight: parseApiNumber(item.weight),
    length: parseApiNumber(item.length),
    width: parseApiNumber(item.width),
    height: parseApiNumber(item.height),
    volumetricWeight: item.volumetric_weight,
    barcode: item.barcode,
  };
}

export function formatStockQuantity(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString('vi-VN');
  }

  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatCatalogPrice(priceVnd: number | undefined): string {
  if (priceVnd == null || priceVnd <= 0) {
    return searchCopy.priceOnRequest;
  }

  return formatProductPrice(priceVnd);
}

export function formatProductUnit(unit: string | undefined): string {
  if (!unit) {
    return '—';
  }

  if (unit === 'piece') {
    return 'Cái';
  }

  return unit;
}

export function formatProductDimensions(product: SearchProduct): string | null {
  const { length, width, height } = product;

  if (!length && !width && !height) {
    return null;
  }

  return `${formatStockQuantity(length ?? 0)} × ${formatStockQuantity(width ?? 0)} × ${formatStockQuantity(height ?? 0)} cm`;
}

export function getProductHeroImageUrl(product: SearchProduct): string | null {
  return product.imageUrl ?? product.thumbnailUrl ?? null;
}

export function getProductStockStatusLabel(product: SearchProduct): string | null {
  if (product.isOutOfStock) {
    return searchCopy.outOfStockLabel;
  }

  if (product.isLowStock) {
    return searchCopy.lowStockLabel;
  }

  if (product.isInStock) {
    return searchCopy.inStockLabel;
  }

  return null;
}

export function mapApiProductToSearchProduct(
  item: ProductApiItem,
): SearchProduct {
  return mapBaseProductFields(item);
}

export function mapApiProductDetailToSearchProduct(
  item: ProductDetailApiItem,
): SearchProduct {
  const profile = mapProductDetailApiToProfileDetail(item);
  const product = mapBaseProductFields(item);

  return {
    ...product,
    imageUrl: getProductDetailHeroImageUrl(profile),
    thumbnailUrl:
      profile.primaryImage?.thumbnailUrl ??
      profile.thumbnailUrl ??
      product.thumbnailUrl,
    seller: profile.seller?.name ?? product.seller,
    sellerName: profile.seller?.name,
    sellerEmail: profile.seller?.email,
    sellerPhone: profile.seller?.phone,
    sellerCode: profile.seller?.code,
    sellerAddress: profile.seller?.address,
    sellerTaxNumber: profile.seller?.taxNumber,
    sellerIsActive: profile.seller?.isActive,
    description:
      profile.description?.trim() || productDetailCopy.noDescription,
    isActive: profile.isActive,
    isCombo: profile.isCombo,
    minStock: profile.minStock,
    isBelowMinStock: profile.isBelowMinStock,
    unitLabel: profile.unitLabel,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    recipeItems: profile.recipeItems,
  };
}
