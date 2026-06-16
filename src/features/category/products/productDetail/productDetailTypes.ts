import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type ProductDetailTabId =
  | 'info'
  | 'images'
  | 'prices'
  | 'stock'
  | 'barcode'
  | 'shop';

export const PRODUCT_DETAIL_TABS: {
  id: ProductDetailTabId;
  label: string;
  icon: SystemIconName;
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  { id: 'images', label: 'Hình ảnh', icon: 'image' },
  { id: 'prices', label: 'Bảng giá', icon: 'cash' },
  { id: 'stock', label: 'Tồn kho', icon: 'layers' },
  { id: 'barcode', label: 'Mã vạch', icon: 'barcode' },
  { id: 'shop', label: 'Liên kết Shop', icon: 'link' },
];
