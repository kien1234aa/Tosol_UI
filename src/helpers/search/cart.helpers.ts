import { buildDefaultVariant } from '@/src/helpers/cart';
import type { AddToCartPayload } from '@/src/types/cart/cart.types';
import type { SearchProduct } from '@/src/types/search/search.types';

export function buildAddToCartPayload(
  product: SearchProduct,
  quantity: number,
): AddToCartPayload {
  return {
    productId: product.id,
    name: product.name,
    seller: product.seller,
    priceCny: product.priceCny,
    quantity,
    variant: buildDefaultVariant(product.description),
  };
}
