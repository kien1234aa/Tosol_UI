export type ShopProductMappingListRow = {
  key: string;
  mappingId: number;
  productId: number;
  productSku: string | null;
  productName: string | null;
  thumbUrl: string | null;
  platformProductId: string | null;
  platformSku: string | null;
  syncStatusLabel: string | null;
  lastSyncedDisplay: string | null;
};
