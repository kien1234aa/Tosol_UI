/**
 * Lọc danh sách cửa hàng — `filter[platform]` / `filter[is_active]` qua `getShopDirectory`.
 * Key rỗng = không gửi platform (tất cả sàn).
 */
export type ShopListPlatformFilterKey =
  | ''
  | 'manual'
  | 'shopee'
  | 'lazada'
  | 'tiktok'
  | 'other';

export type ShopListStatusFilterKey = 'all' | 'active' | 'inactive';

export const SHOP_LIST_PLATFORM_OPTIONS: {
  key: ShopListPlatformFilterKey;
  label: string;
}[] = [
  { key: '', label: 'Tất cả sàn' },
  { key: 'shopee', label: 'Shopee' },
  { key: 'lazada', label: 'Lazada' },
  { key: 'tiktok', label: 'TikTok Shop' },
  { key: 'manual', label: 'Bán trực tiếp' },
  { key: 'other', label: 'Khác' },
];

export const SHOP_LIST_STATUS_OPTIONS: {
  key: ShopListStatusFilterKey;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'active', label: 'Hoạt động' },
  { key: 'inactive', label: 'Không hoạt động' },
];
