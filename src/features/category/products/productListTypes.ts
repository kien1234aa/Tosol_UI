export type ProductRowStatus = 'active' | 'inactive';

export type ProductListRow = {
  id: number;
  key: string;
  sku: string;
  name: string;
  priceDisplay: string;
  totalStock: number;
  reserved: number;
  warehouseCount: number;
  status: ProductRowStatus;
  thumbUrl?: string | null;
};
