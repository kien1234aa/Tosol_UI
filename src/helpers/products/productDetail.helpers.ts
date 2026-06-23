import { productsCopy } from '@/src/configs/products';
import { getProductUnitLabel } from '@/src/helpers/products/createProduct.helpers';
import type {
  ProductDetailApiItem,
  ProductImageApi,
  ProductRecipeItemApi,
  ProductSellerApi,
  ProfileProductDetail,
  ProfileProductDetailImage,
  ProfileProductDetailRecipeItem,
  ProfileProductDetailSeller,
} from '@/src/types/products';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function parseApiNumber(value: string | null | undefined): number {
  if (value == null || value === '') {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseOptionalApiNumber(
  value: string | null | undefined,
): number | null {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapImage(image: ProductImageApi): ProfileProductDetailImage {
  return {
    id: image.id,
    originalUrl: image.original_url,
    thumbnailUrl: image.thumbnail_url,
    altText: image.alt_text,
    isPrimary: image.is_primary,
    sortOrder: image.sort_order,
    mimeType: image.mime_type,
    fileSizeHuman: image.file_size_human,
  };
}

function mapSeller(seller: ProductSellerApi): ProfileProductDetailSeller {
  return {
    id: seller.id,
    uuid: seller.uuid,
    code: seller.code,
    name: seller.name,
    email: seller.email,
    phone: seller.phone,
    address: seller.address,
    taxNumber: seller.tax_number,
    isActive: seller.is_active,
    createdAt: seller.created_at,
    updatedAt: seller.updated_at,
  };
}

function mapRecipeItem(item: ProductRecipeItemApi): ProfileProductDetailRecipeItem {
  return {
    id: item.id ?? null,
    quantity: item.quantity != null ? String(item.quantity) : null,
    componentName: item.component?.name ?? null,
    componentSku: item.component?.sku ?? null,
  };
}

export function formatProductDetailDateTime(
  value: string | null | undefined,
): string {
  if (!value?.trim()) {
    return productsCopy.detailEmptyValue;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return productsCopy.detailEmptyValue;
  }

  return DATE_TIME_FORMATTER.format(date);
}

export function formatProductDetailText(
  value: string | null | undefined,
): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : productsCopy.detailEmptyValue;
}

export function formatProductDetailNumber(
  value: number | null | undefined,
  suffix = '',
): string {
  if (value == null || Number.isNaN(value)) {
    return productsCopy.detailEmptyValue;
  }

  const formatted = Number.isInteger(value)
    ? value.toLocaleString('vi-VN')
    : value.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });

  return suffix ? `${formatted}${suffix}` : formatted;
}

export function formatProductDetailBoolean(
  value: boolean | null | undefined,
): string {
  if (value == null) {
    return productsCopy.detailEmptyValue;
  }

  return value ? productsCopy.detailYes : productsCopy.detailNo;
}

export function formatProductDetailActiveStatus(isActive: boolean): string {
  return isActive ? productsCopy.active : productsCopy.inactive;
}

export function formatProductDetailComboType(isCombo: boolean): string {
  return isCombo ? productsCopy.detailCombo : productsCopy.detailSimple;
}

/** Maps GET /products/{id}?include=seller,images,recipeItems,recipeItems.component */
export function mapProductDetailApiToProfileDetail(
  item: ProductDetailApiItem,
): ProfileProductDetail {
  const images = (item.images ?? []).map(mapImage);
  const primaryImage = item.primary_image
    ? mapImage(item.primary_image)
    : images.find(image => image.isPrimary) ?? null;

  return {
    id: item.id,
    uuid: item.uuid,
    sellerId: item.seller_id,
    name: item.name,
    description: item.description,
    sku: item.sku,
    unit: item.unit,
    unitLabel: getProductUnitLabel(item.unit),
    barcode: item.barcode,
    priceRaw: item.price,
    priceVnd: parseApiNumber(item.price),
    imageUrl: item.image_url,
    thumbnailUrl: item.thumbnail_url,
    isActive: item.is_active,
    isCombo: item.is_combo,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    totalStock: parseApiNumber(item.total_stock),
    availableStock: parseApiNumber(item.available_stock),
    reservedStock: parseApiNumber(item.reserved_stock),
    warehousesCount: item.warehouses_count,
    minStock: parseOptionalApiNumber(item.min_stock),
    isInStock: item.is_in_stock,
    isLowStock: item.is_low_stock,
    isBelowMinStock: item.is_below_min_stock,
    isOutOfStock: item.is_out_of_stock,
    weight: parseOptionalApiNumber(item.weight),
    length: parseOptionalApiNumber(item.length),
    width: parseOptionalApiNumber(item.width),
    height: parseOptionalApiNumber(item.height),
    volumetricWeight:
      item.volumetric_weight != null && Number.isFinite(item.volumetric_weight)
        ? item.volumetric_weight
        : null,
    seller: item.seller ? mapSeller(item.seller) : null,
    images,
    primaryImage,
    recipeItems: (item.recipe_items ?? []).map(mapRecipeItem),
  };
}

export function getProductDetailHeroImageUrl(
  product: ProfileProductDetail,
): string | null {
  return (
    product.primaryImage?.originalUrl ??
    product.imageUrl ??
    product.primaryImage?.thumbnailUrl ??
    product.thumbnailUrl ??
    product.images[0]?.originalUrl ??
    product.images[0]?.thumbnailUrl ??
    null
  );
}

export function getProductDetailStockStatusLabel(
  product: ProfileProductDetail,
): string | null {
  if (product.isOutOfStock) {
    return productsCopy.detailIsOutOfStockLabel;
  }

  if (product.isLowStock) {
    return productsCopy.detailIsLowStockLabel;
  }

  if (product.isInStock) {
    return productsCopy.detailIsInStockLabel;
  }

  return null;
}
