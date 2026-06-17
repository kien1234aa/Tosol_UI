import { cartCopy, cartQuantityLimits } from '@/src/configs/cart';
import type {
  AddToCartPayload,
  AddToCartResult,
  CartGroup,
  CartProductItem,
} from '@/src/types/cart/cart.types';
import type { SearchProduct } from '@/src/types/search/search.types';

export function buildCartVariant(product: SearchProduct): string {
  if (product.sku) {
    return `SKU: ${product.sku}`;
  }

  const trimmed = product.description.trim();
  if (!trimmed || trimmed === cartCopy.defaultVariant) {
    return cartCopy.defaultVariant;
  }

  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed;
}

export function buildAddToCartPayload(
  product: SearchProduct,
  quantity: number,
): AddToCartPayload {
  const availableStock = product.availableStock ?? 0;

  return {
    productId: product.id,
    name: product.name,
    seller: product.sellerName || product.seller || cartCopy.defaultSupplier,
    priceCny: product.priceCny,
    priceVnd: product.priceVnd ?? 0,
    thumbnailUrl: product.thumbnailUrl ?? product.imageUrl,
    sku: product.sku,
    maxStock:
      availableStock > 0
        ? Math.floor(availableStock)
        : cartQuantityLimits.max,
    isOutOfStock: product.isOutOfStock ?? false,
    quantity,
    variant: buildCartVariant(product),
  };
}

export function getCartProductMaxQuantity(product: CartProductItem): number {
  if (product.maxStock != null && product.maxStock > 0) {
    return Math.min(cartQuantityLimits.max, product.maxStock);
  }

  return cartQuantityLimits.max;
}

export function getAddToCartMaxQuantity(payload: AddToCartPayload): number {
  if (payload.maxStock != null && payload.maxStock > 0) {
    return Math.min(cartQuantityLimits.max, payload.maxStock);
  }

  return cartQuantityLimits.max;
}

export function findCartProductQuantity(
  groups: CartGroup[],
  productId: string,
): number {
  for (const group of groups) {
    const product = group.products.find(item => item.id === productId);
    if (product) {
      return product.quantity;
    }
  }

  return 0;
}

export function validateAddToCart(
  groups: CartGroup[],
  payload: AddToCartPayload,
  quantityToAdd: number,
): AddToCartResult {
  if (payload.isOutOfStock) {
    return { success: false, message: cartCopy.outOfStockError };
  }

  const maxQuantity = getAddToCartMaxQuantity(payload);
  const currentQuantity = findCartProductQuantity(groups, payload.productId);
  const nextQuantity = currentQuantity + quantityToAdd;

  if (nextQuantity > maxQuantity) {
    if (currentQuantity > 0) {
      return {
        success: false,
        message: cartCopy.exceedsStockInCart.replace(
          '{max}',
          String(maxQuantity),
        ),
      };
    }

    return {
      success: false,
      message: cartCopy.exceedsStock.replace('{max}', String(maxQuantity)),
    };
  }

  return { success: true };
}
