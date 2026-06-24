import {
  PRODUCT_UNIT_OPTIONS,
  productsCopy,
  type ProductUnitValue,
} from '@/src/configs/products';
import { formatProductUnit } from '@/src/helpers/search/product.helpers';
import type {
  CreateProductComboRow,
  CreateProductFormValues,
  CreateProductPayload,
  CreateProductValidationErrors,
  ProductApiItem,
  ProductDetailApiItem,
  ProductListItem,
  ProductSuggestionApiItem,
  ProductSuggestionItem,
  UpdateProductPayload,
} from '@/src/types/products';

let comboRowCounter = 0;

function nextComboRowId(): string {
  comboRowCounter += 1;
  return `combo-row-${comboRowCounter}`;
}

function parseApiNumber(value: string | null | undefined): number {
  if (value == null || value === '') {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseFormNumber(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  const parsed = Number.parseFloat(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function getProductUnitLabel(unit: string): string {
  const match = PRODUCT_UNIT_OPTIONS.find(option => option.value === unit);
  return match?.label ?? formatProductUnit(unit);
}

export function mapProductApiItemToListItem(item: ProductApiItem): ProductListItem {
  return {
    id: item.id,
    uuid: item.uuid,
    sku: item.sku,
    name: item.name,
    priceVnd: parseApiNumber(item.price),
    unit: item.unit,
    unitLabel: getProductUnitLabel(item.unit),
    thumbnailUrl: item.thumbnail_url ?? item.image_url,
    isActive: item.is_active,
    availableStock: parseApiNumber(item.available_stock),
    isInStock: item.is_in_stock,
    isLowStock: item.is_low_stock,
    isOutOfStock: item.is_out_of_stock,
  };
}

export function createEmptyCreateProductFormValues(): CreateProductFormValues {
  return {
    sku: '',
    name: '',
    barcode: '',
    price: '',
    unit: 'piece',
    minStock: '0',
    description: '',
    weight: '0',
    length: '0',
    width: '0',
    height: '0',
    isActive: true,
    isCombo: false,
  };
}

export function validateCreateProductForm(
  values: CreateProductFormValues,
  comboRows: CreateProductComboRow[] = [],
): CreateProductValidationErrors {
  const errors: CreateProductValidationErrors = {};

  if (!values.sku.trim()) {
    errors.sku = productsCopy.skuRequired;
  }

  if (!values.name.trim()) {
    errors.name = productsCopy.nameRequired;
  }

  const price = parseFormNumber(values.price);
  if (Number.isNaN(price) || price < 0) {
    errors.price = productsCopy.priceInvalid;
  }

  if (values.isCombo && getFilledComboRows(comboRows).length === 0) {
    errors.comboItems = productsCopy.comboItemsRequired;
  }

  return errors;
}

export function isCreateProductFormValid(
  errors: CreateProductValidationErrors,
): boolean {
  return Object.keys(errors).length === 0;
}

export function toCreateProductPayload(
  values: CreateProductFormValues,
  sellerId: number,
  comboRows: CreateProductComboRow[] = [],
): CreateProductPayload {
  const price = parseFormNumber(values.price);
  const minStock = parseFormNumber(values.minStock);
  const weight = parseFormNumber(values.weight);
  const length = parseFormNumber(values.length);
  const width = parseFormNumber(values.width);
  const height = parseFormNumber(values.height);

  const recipeItems = values.isCombo
    ? getFilledComboRows(comboRows).map(row => ({
        component_product_id: row.productId as number,
        quantity: parseComboRowQuantity(row.quantity) || 1,
      }))
    : undefined;

  return {
    seller_id: sellerId,
    sku: values.sku.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    barcode: values.barcode.trim(),
    price: Number.isNaN(price) ? 0 : price,
    unit: values.unit as ProductUnitValue,
    min_stock: Number.isNaN(minStock) ? 0 : minStock,
    weight: Number.isNaN(weight) ? 0 : weight,
    length: Number.isNaN(length) ? 0 : length,
    width: Number.isNaN(width) ? 0 : width,
    height: Number.isNaN(height) ? 0 : height,
    is_active: values.isActive,
    is_combo: values.isCombo,
    image_url: '',
    recipe_items: recipeItems,
  };
}

export function createEmptyComboRow(): CreateProductComboRow {
  return {
    rowId: nextComboRowId(),
    productId: null,
    sku: '',
    name: '',
    unit: 'piece',
    unitLabel: getProductUnitLabel('piece'),
    thumbnailUrl: null,
    quantity: '1',
  };
}

export function mapProductSuggestionApiToItem(
  item: ProductSuggestionApiItem,
  options: { useWarehouseStock?: boolean } = {},
): ProductSuggestionItem {
  const totalStock = parseApiNumber(item.available_stock);
  const warehouseStock =
    item.warehouse_available_stock != null &&
    Number.isFinite(item.warehouse_available_stock)
      ? item.warehouse_available_stock
      : null;
  const availableStock = options.useWarehouseStock
    ? (warehouseStock ?? totalStock)
    : totalStock;

  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    unit: item.unit,
    unitLabel: getProductUnitLabel(item.unit),
    thumbnailUrl: item.thumbnail_url ?? item.image_url,
    priceVnd: parseApiNumber(item.price),
    availableStock,
    isOutOfStock: availableStock <= 0,
  };
}

export function applySuggestionToComboRow(
  row: CreateProductComboRow,
  product: ProductSuggestionItem,
): CreateProductComboRow {
  return {
    ...row,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    unitLabel: product.unitLabel,
    thumbnailUrl: product.thumbnailUrl,
  };
}

export function getFilledComboRows(
  rows: CreateProductComboRow[],
): CreateProductComboRow[] {
  return rows.filter(row => row.productId != null);
}

export function parseComboRowQuantity(value: string): number {
  const parsed = parseFormNumber(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return Number.NaN;
  }

  return parsed;
}

function parseProductUnitValue(unit: string): ProductUnitValue {
  const match = PRODUCT_UNIT_OPTIONS.find(option => option.value === unit);
  return (match?.value ?? 'piece') as ProductUnitValue;
}

function formatFormNumber(value: string | null | undefined): string {
  if (value == null || value === '') {
    return '0';
  }

  const parsed = parseApiNumber(value);
  return Number.isInteger(parsed) ? String(parsed) : String(parsed);
}

/** Khởi tạo form sửa từ GET /products/{id}. */
export function mapProductDetailApiToFormValues(
  item: ProductDetailApiItem,
): CreateProductFormValues {
  const minStock =
    item.min_stock != null && String(item.min_stock).trim() !== ''
      ? formatFormNumber(item.min_stock)
      : '0';

  return {
    sku: item.sku,
    name: item.name,
    barcode: item.barcode ?? '',
    price: formatFormNumber(item.price),
    unit: parseProductUnitValue(item.unit),
    minStock,
    description: item.description ?? '',
    weight: formatFormNumber(item.weight),
    length: formatFormNumber(item.length),
    width: formatFormNumber(item.width),
    height: formatFormNumber(item.height),
    isActive: item.is_active,
    isCombo: item.is_combo,
  };
}

export function validateEditProductForm(
  values: CreateProductFormValues,
): CreateProductValidationErrors {
  return validateCreateProductForm({ ...values, isCombo: false }, []);
}

export function toUpdateProductPayload(
  values: CreateProductFormValues,
): UpdateProductPayload {
  const price = parseFormNumber(values.price);
  const minStock = parseFormNumber(values.minStock);
  const weight = parseFormNumber(values.weight);
  const length = parseFormNumber(values.length);
  const width = parseFormNumber(values.width);
  const height = parseFormNumber(values.height);
  const parsedMinStock = Number.isNaN(minStock) ? 0 : minStock;

  return {
    sku: values.sku.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    unit: values.unit as ProductUnitValue,
    price: Number.isNaN(price) ? 0 : price,
    weight: Number.isNaN(weight) ? 0 : weight,
    length: Number.isNaN(length) ? 0 : length,
    width: Number.isNaN(width) ? 0 : width,
    height: Number.isNaN(height) ? 0 : height,
    min_stock: parsedMinStock.toFixed(2),
    is_active: values.isActive,
  };
}
