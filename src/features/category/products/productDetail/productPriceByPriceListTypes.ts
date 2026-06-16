export type ProductPriceByPriceListRow = {
  key: string;
  productPriceId: number;
  priceListId: number;
  priceListName: string | null;
  priceListCode: string | null;
  isDefaultPriceList: boolean;
  priceListActive: boolean;
  currencyCode: string | null;
  priceDisplay: string | null;
  minQuantityLabel: string | null;
  isActive: boolean;
};
