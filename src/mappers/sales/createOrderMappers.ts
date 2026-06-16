import type { CustomerEntity, ProductEntity } from '@shared/types/order';

export type CustomerOption = {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
};

export type ProductSuggestionOption = {
  id: string;
  name: string;
  sku?: string;
  availableStock: number;
  price: string;
};

export type ProductDraft = {
  productId?: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  discountPercent: string;
  taxPercent: string;
};

export type ProductLine = {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
};

export type ShippingMode = 'seller' | 'warehouse' | 'pickup';

export type NewCustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export const DEFAULT_PRODUCT_DRAFT: ProductDraft = {
  productId: undefined,
  productName: '',
  quantity: '1',
  unitPrice: '0',
  discountPercent: '0',
  taxPercent: '0',
};

export const mapCustomerToOption = (
  customer: CustomerEntity,
): CustomerOption => ({
  id: String(customer.id ?? customer.uuid),
  code: customer.uuid,
  name: customer.name,
  email: customer.email ?? undefined,
  phone: customer.phone ?? '',
  address: customer.full_address || customer.address || undefined,
});

export const mapProductToOption = (
  product: ProductEntity,
): ProductSuggestionOption => ({
  id: String(product.id ?? product.uuid),
  name: product.name,
  sku: product.sku ?? undefined,
  availableStock: Number(product.available_stock ?? 0) || 0,
  price: String(product.price ?? '0'),
});

export const draftToProductLine = (draft: ProductDraft): ProductLine => ({
  id: `LINE-${Date.now()}`,
  productId: draft.productId,
  productName: draft.productName.trim(),
  quantity: Math.max(1, Number(draft.quantity) || 1),
  unitPrice: Math.max(0, Number(draft.unitPrice) || 0),
  discountPercent: Math.min(
    100,
    Math.max(0, Number(draft.discountPercent) || 0),
  ),
  taxPercent: Math.min(100, Math.max(0, Number(draft.taxPercent) || 0)),
});

export const buildCustomerFromForm = (
  form: NewCustomerForm,
): CustomerOption => ({
  id: `CUS-${Date.now()}`,
  code: `NEW-${Date.now().toString().slice(-6)}`,
  name: form.name.trim(),
  phone: form.phone.trim(),
  email: form.email.trim() || undefined,
  address: form.address.trim() || undefined,
});
