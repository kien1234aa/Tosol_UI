import axios from 'axios';
import api from '@shared/services/api';
import type {
  ProductPriceApi,
  ProductPriceCurrencyApi,
  ProductPricePriceListApi,
  ProductPriceProductApi,
  ProductPricesApiResponse,
  ProductPricesMeta,
} from './productPriceApiTypes';

export const PRODUCT_PRICES_BY_PRICE_LIST_INCLUDE = 'product';
export const PRODUCT_PRICES_BY_PRODUCT_INCLUDE = 'priceList.currency';

/** @deprecated Dùng `PRODUCT_PRICES_BY_PRICE_LIST_INCLUDE`. */
export const PRODUCT_PRICES_LIST_INCLUDE = PRODUCT_PRICES_BY_PRICE_LIST_INCLUDE;

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function normalizeCurrencyNested(
  raw: Record<string, unknown>,
): ProductPriceCurrencyApi | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  const symbol =
    typeof raw.symbol === 'string' && raw.symbol.trim()
      ? raw.symbol.trim()
      : 'đ';
  const decimalPlaces = Number(raw.decimal_places ?? raw.decimalPlaces);
  return {
    id,
    code: String(raw.code ?? ''),
    name: typeof raw.name === 'string' ? raw.name : undefined,
    symbol,
    decimal_places: Number.isFinite(decimalPlaces) ? decimalPlaces : 0,
  };
}

function normalizePriceListNested(
  raw: Record<string, unknown>,
): ProductPricePriceListApi | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  const currencyRaw = asRecord(raw.currency) ?? asRecord(raw.Currency);
  const currency = currencyRaw ? normalizeCurrencyNested(currencyRaw) : null;
  return {
    id,
    name: String(raw.name ?? ''),
    code: String(raw.code ?? ''),
    is_default: raw.is_default === true || raw.isDefault === true,
    is_active: raw.is_active !== false && raw.isActive !== false,
    currency,
  };
}

function normalizeProductNested(
  raw: Record<string, unknown>,
): ProductPriceProductApi | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  return {
    id,
    uuid: typeof raw.uuid === 'string' ? raw.uuid : undefined,
    sku:
      typeof raw.sku === 'string'
        ? raw.sku
        : raw.sku == null
          ? null
          : String(raw.sku),
    name:
      typeof raw.name === 'string'
        ? raw.name
        : raw.name == null
          ? null
          : String(raw.name),
    thumbnail_url:
      typeof raw.thumbnail_url === 'string'
        ? raw.thumbnail_url
        : typeof raw.thumbnailUrl === 'string'
          ? raw.thumbnailUrl
          : null,
    image_url:
      typeof raw.image_url === 'string'
        ? raw.image_url
        : typeof raw.imageUrl === 'string'
          ? raw.imageUrl
          : null,
    is_active: raw.is_active !== false && raw.isActive !== false,
  };
}

function normalizeProductPriceRow(raw: unknown): ProductPriceApi | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const id = Number(row.id);
  const priceListId = Number(row.price_list_id ?? row.priceListId);
  const productId = Number(row.product_id ?? row.productId);
  if (!Number.isFinite(id)) {
    return null;
  }

  const productRaw = asRecord(row.product) ?? asRecord(row.Product);
  const product = productRaw ? normalizeProductNested(productRaw) : null;

  const priceListRaw =
    asRecord(row.price_list) ??
    asRecord(row.priceList) ??
    asRecord(row.PriceList);
  const price_list = priceListRaw
    ? normalizePriceListNested(priceListRaw)
    : null;

  const priceRaw =
    row.price ?? row.unit_price ?? row.unitPrice ?? row.amount ?? null;

  let price: string | number | null = null;
  if (typeof priceRaw === 'number' && Number.isFinite(priceRaw)) {
    price = priceRaw;
  } else if (typeof priceRaw === 'string' && priceRaw.trim() !== '') {
    price = priceRaw.trim();
  }

  const minQty = row.min_quantity ?? row.minQuantity;
  let min_quantity: number | string | null = null;
  if (minQty != null && minQty !== '') {
    min_quantity =
      typeof minQty === 'number' || typeof minQty === 'string' ? minQty : null;
  }

  return {
    id,
    price_list_id: Number.isFinite(priceListId)
      ? priceListId
      : (price_list?.id ?? 0),
    product_id: Number.isFinite(productId) ? productId : 0,
    price,
    min_quantity,
    is_active: row.is_active !== false && row.isActive !== false,
    created_at:
      typeof row.created_at === 'string'
        ? row.created_at
        : typeof row.createdAt === 'string'
          ? row.createdAt
          : null,
    updated_at:
      typeof row.updated_at === 'string'
        ? row.updated_at
        : typeof row.updatedAt === 'string'
          ? row.updatedAt
          : null,
    product,
    price_list,
  };
}

export type GetProductPricesPageParams = {
  page?: number;
  per_page?: number;
  sort?: string;
  include?: string;
  filterPriceListId?: number;
  filterProductId?: number;
  signal?: AbortSignal;
};

export type ProductPricesPageResult = {
  items: ProductPriceApi[];
  meta: ProductPricesMeta | null;
};

function buildQueryParams(
  p: GetProductPricesPageParams,
): Record<string, string | number> {
  const {
    page = 1,
    per_page = 15,
    sort = '-created_at',
    include,
    filterPriceListId,
    filterProductId,
  } = p;

  const params: Record<string, string | number> = {
    page,
    per_page,
    sort,
  };

  if (include != null && include.trim() !== '') {
    params.include = include.trim();
  } else if (
    filterProductId != null &&
    Number.isFinite(filterProductId) &&
    filterProductId > 0
  ) {
    params.include = PRODUCT_PRICES_BY_PRODUCT_INCLUDE;
  } else {
    params.include = PRODUCT_PRICES_BY_PRICE_LIST_INCLUDE;
  }

  if (
    filterPriceListId != null &&
    Number.isFinite(filterPriceListId) &&
    filterPriceListId > 0
  ) {
    params['filter[price_list_id]'] = filterPriceListId;
  }
  if (
    filterProductId != null &&
    Number.isFinite(filterProductId) &&
    filterProductId > 0
  ) {
    params['filter[product_id]'] = filterProductId;
  }

  return params;
}

async function fetchProductPricesPage(
  params: GetProductPricesPageParams,
): Promise<ProductPricesPageResult> {
  if (
    !(
      (params.filterPriceListId != null &&
        Number.isFinite(params.filterPriceListId) &&
        params.filterPriceListId > 0) ||
      (params.filterProductId != null &&
        Number.isFinite(params.filterProductId) &&
        params.filterProductId > 0)
    )
  ) {
    throw new Error('Thiếu bộ lọc product-prices');
  }

  const { data } = await api.get<ProductPricesApiResponse>('/product-prices', {
    params: buildQueryParams(params),
    signal: params.signal,
  });
  if (!data.success) {
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : 'Không tải được giá sản phẩm',
    );
  }
  const items = (data.data ?? [])
    .map(normalizeProductPriceRow)
    .filter((row): row is ProductPriceApi => row != null);
  return {
    items,
    meta: data.meta ?? null,
  };
}

/** GET `/product-prices?include=product&filter[price_list_id]=…` */
export async function getProductPricesPage(
  params: GetProductPricesPageParams,
): Promise<ProductPricesPageResult> {
  try {
    return await fetchProductPricesPage(params);
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('Không tải được giá sản phẩm');
  }
}
