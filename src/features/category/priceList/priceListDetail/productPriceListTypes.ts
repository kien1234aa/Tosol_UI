export type ProductPriceListRow = {
  key: string;
  productPriceId: number;
  productId: number;
  productSku: string | null;
  productName: string | null;
  thumbUrl: string | null;
  priceDisplay: string | null;
  minQuantityLabel: string | null;
  isActive: boolean;
};
