import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type ShopDetailTabId =
  | 'info'
  | 'products'
  | 'banks'
  | 'carriers'
  | 'payments'
  | 'activity';

export type ShopDetailTabDef = {
  id: ShopDetailTabId;
  label: string;
  icon: SystemIconName;
};

export const SHOP_DETAIL_TABS: readonly ShopDetailTabDef[] = [
  { id: 'info', label: 'Thông tin', icon: 'time' },
  { id: 'products', label: 'Liên kết sản phẩm', icon: 'link' },
  { id: 'banks', label: 'Tài khoản ngân hàng', icon: 'card' },
  { id: 'carriers', label: 'Đối tác vận chuyển', icon: 'truck' },
  { id: 'payments', label: 'Thanh toán', icon: 'wallet' },
  { id: 'activity', label: 'Nhật ký hoạt động', icon: 'activity' },
] as const;
