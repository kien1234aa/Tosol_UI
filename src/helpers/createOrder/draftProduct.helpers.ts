import { draftCopy, draftQuantityLimits } from '@/src/configs/createOrder/draft.constants';
import type {
  AddDraftProductPayload,
  AddDraftProductResult,
  DraftProductGroup,
  DraftProductItem,
} from '@/src/types/createOrderDraft/createOrderDraft.types';
import type { SearchProduct } from '@/src/types/search/search.types';

export function buildDraftVariant(product: SearchProduct): string {
  if (product.sku) {
    return `SKU: ${product.sku}`;
  }

  const trimmed = product.description.trim();
  if (!trimmed || trimmed === draftCopy.defaultVariant) {
    return draftCopy.defaultVariant;
  }

  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed;
}

export function buildAddDraftProductPayload(
  product: SearchProduct,
  quantity: number,
): AddDraftProductPayload {
  const availableStock = product.availableStock ?? 0;

  return {
    productId: product.id,
    name: product.name,
    seller: product.sellerName || product.seller || draftCopy.defaultSupplier,
    priceCny: product.priceCny,
    priceVnd: product.priceVnd ?? 0,
    thumbnailUrl: product.thumbnailUrl ?? product.imageUrl,
    sku: product.sku,
    maxStock:
      availableStock > 0
        ? Math.floor(availableStock)
        : draftQuantityLimits.max,
    isOutOfStock: product.isOutOfStock ?? false,
    quantity,
    variant: buildDraftVariant(product),
    isCustomPricing: (product.priceVnd ?? 0) <= 0 && (product.priceCny ?? 0) <= 0,
  };
}

export function getAddDraftMaxQuantity(payload: AddDraftProductPayload): number {
  if (payload.maxStock != null && payload.maxStock > 0) {
    return Math.min(draftQuantityLimits.max, payload.maxStock);
  }

  return draftQuantityLimits.max;
}

export function findDraftProductQuantity(
  groups: DraftProductGroup[],
  productId: string,
): number {
  for (const group of groups) {
    for (const product of group.products) {
      if (product.id === productId) {
        return product.quantity;
      }
    }
  }

  return 0;
}

export function validateAddDraftProduct(
  groups: DraftProductGroup[],
  payload: AddDraftProductPayload,
  quantityToAdd: number,
): AddDraftProductResult {
  if (payload.isOutOfStock) {
    return { success: false, message: draftCopy.outOfStockError };
  }

  const maxQuantity = getAddDraftMaxQuantity(payload);
  const currentQuantity = findDraftProductQuantity(groups, payload.productId);
  const nextQuantity = currentQuantity + quantityToAdd;

  if (nextQuantity > maxQuantity) {
    if (currentQuantity > 0) {
      return {
        success: false,
        message: draftCopy.exceedsStockInDraft.replace(
          '{max}',
          String(maxQuantity),
        ),
      };
    }

    return {
      success: false,
      message: draftCopy.exceedsStock.replace('{max}', String(maxQuantity)),
    };
  }

  return { success: true };
}

export function getDraftProductMaxQuantity(product: DraftProductItem): number {
  if (product.maxStock != null && product.maxStock > 0) {
    return Math.min(draftQuantityLimits.max, product.maxStock);
  }

  return draftQuantityLimits.max;
}
