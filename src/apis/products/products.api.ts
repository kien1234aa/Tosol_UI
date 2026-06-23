import { deleteJson, getJson, getJsonPaginated, postFormData, postJson, putJson } from '@/src/apis/http';
import {
  apiEndpoints,
  productDetailIncludes,
  productsPageSize,
} from '@/src/configs/api';
import { productCreateUploadTimeoutMs } from '@/src/configs/products';
import { mapProductSuggestionApiToItem } from '@/src/helpers/products';
import type {
  CreateProductImagePart,
  CreateProductPayload,
  ProductApiItem,
  ProductDetailApiItem,
  ProductSuggestionApiItem,
  ProductSuggestionItem,
  ProductsListResult,
  ProductsPaginationMeta,
  UpdateProductPayload,
} from '@/src/types/products';

export interface ListProductsOptions {
  page?: number;
  perPage?: number;
  sellerId?: number;
  /** Chỉ sản phẩm thường — `filter[is_combo]=0`. */
  simpleOnly?: boolean;
}

export interface ProductSuggestionsOptions {
  sellerId: number;
  warehouseId?: number | null;
  search?: string;
  excludeCombos?: boolean;
  signal?: AbortSignal;
}

export interface IProductsService {
  list(options?: ListProductsOptions): Promise<ProductsListResult>;
  getById(productId: string | number): Promise<ProductDetailApiItem>;
  suggestions(options: ProductSuggestionsOptions): Promise<ProductSuggestionItem[]>;
  create(payload: CreateProductPayload): Promise<ProductApiItem>;
  createWithImage(
    payload: CreateProductPayload,
    image: CreateProductImagePart,
  ): Promise<ProductApiItem>;
  update(
    productId: string | number,
    payload: UpdateProductPayload,
  ): Promise<ProductApiItem>;
  updateWithImage(
    productId: string | number,
    payload: UpdateProductPayload,
    image: CreateProductImagePart,
  ): Promise<ProductApiItem>;
  delete(productId: string | number): Promise<void>;
}

function appendCreateProductFormFields(
  formData: FormData,
  payload: CreateProductPayload,
): void {
  formData.append('seller_id', String(payload.seller_id));
  formData.append('sku', payload.sku);
  formData.append('name', payload.name);
  formData.append('description', payload.description);
  formData.append('barcode', payload.barcode);
  formData.append('price', String(payload.price));
  formData.append('unit', payload.unit);
  formData.append('min_stock', String(payload.min_stock));
  formData.append('weight', String(payload.weight));
  formData.append('length', String(payload.length));
  formData.append('width', String(payload.width));
  formData.append('height', String(payload.height));
  formData.append('is_active', payload.is_active ? '1' : '0');
  formData.append('is_combo', payload.is_combo ? '1' : '0');
  formData.append('image_url', payload.image_url);

  payload.recipe_items?.forEach((item, index) => {
    formData.append(
      `recipe_items[${index}][component_product_id]`,
      String(item.component_product_id),
    );
    formData.append(
      `recipe_items[${index}][quantity]`,
      String(item.quantity),
    );
  });
}

function appendUpdateProductFormFields(
  formData: FormData,
  payload: UpdateProductPayload,
): void {
  formData.append('sku', payload.sku);
  formData.append('name', payload.name);
  formData.append('description', payload.description);
  formData.append('unit', payload.unit);
  formData.append('price', String(payload.price));
  formData.append('weight', String(payload.weight));
  formData.append('length', String(payload.length));
  formData.append('width', String(payload.width));
  formData.append('height', String(payload.height));
  formData.append('min_stock', payload.min_stock);
  formData.append('is_active', payload.is_active ? '1' : '0');
}

class HttpProductsService implements IProductsService {
  async list(options: ListProductsOptions = {}): Promise<ProductsListResult> {
    const {
      page = 1,
      perPage = productsPageSize,
      sellerId,
      simpleOnly = false,
    } = options;

    const params: Record<string, string | number> = {
      page,
      per_page: perPage,
    };

    if (sellerId != null && Number.isFinite(sellerId)) {
      params['filter[seller_id]'] = sellerId;
    }

    if (simpleOnly) {
      params['filter[is_combo]'] = 0;
    }

    const { data, meta } = await getJsonPaginated<ProductApiItem[]>(
      apiEndpoints.products,
      params,
    );

    return {
      products: data,
      meta: meta as ProductsPaginationMeta,
    };
  }

  async getById(productId: string | number): Promise<ProductDetailApiItem> {
    return getJson<ProductDetailApiItem>(
      `${apiEndpoints.products}/${productId}`,
      { include: productDetailIncludes },
    );
  }

  async suggestions(
    options: ProductSuggestionsOptions,
  ): Promise<ProductSuggestionItem[]> {
    const params: Record<string, string | number> = {
      seller_id: options.sellerId,
    };

    if (options.warehouseId != null && Number.isFinite(options.warehouseId)) {
      params.warehouse_id = options.warehouseId;
    }

    if (options.search?.trim()) {
      params.search = options.search.trim();
    }

    if (options.excludeCombos !== false) {
      params.exclude_combos = 1;
    }

    const data = await getJson<ProductSuggestionApiItem[]>(
      apiEndpoints.productSuggestions,
      params,
      { signal: options.signal },
    );

    return data.map(mapProductSuggestionApiToItem);
  }

  async create(payload: CreateProductPayload): Promise<ProductApiItem> {
    return postJson<ProductApiItem>(apiEndpoints.products, payload);
  }

  async createWithImage(
    payload: CreateProductPayload,
    image: CreateProductImagePart,
  ): Promise<ProductApiItem> {
    const formData = new FormData();
    appendCreateProductFormFields(formData, {
      ...payload,
      image_url: '',
    });
    formData.append('image', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);

    return postFormData<ProductApiItem>(apiEndpoints.products, formData, {
      timeoutMs: productCreateUploadTimeoutMs,
    });
  }

  async update(
    productId: string | number,
    payload: UpdateProductPayload,
  ): Promise<ProductApiItem> {
    return putJson<ProductApiItem>(
      `${apiEndpoints.products}/${productId}`,
      payload,
    );
  }

  async updateWithImage(
    productId: string | number,
    payload: UpdateProductPayload,
    image: CreateProductImagePart,
  ): Promise<ProductApiItem> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    appendUpdateProductFormFields(formData, payload);
    formData.append('image', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);

    return postFormData<ProductApiItem>(
      `${apiEndpoints.products}/${productId}`,
      formData,
      { timeoutMs: productCreateUploadTimeoutMs },
    );
  }

  async delete(productId: string | number): Promise<void> {
    await deleteJson(`${apiEndpoints.products}/${productId}`);
  }
}

export const productsService: IProductsService = new HttpProductsService();
