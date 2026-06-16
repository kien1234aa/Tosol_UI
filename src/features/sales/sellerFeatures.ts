/**
 * Danh sách chức năng seller — đồng bộ `salesSectionNavConfig` + `roleNavPolicy`.
 */
import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type SellerFeature = {
  id: string;
  label: string;
  hint: string;
  icon: SystemIconName;
};

/** Tab Bán hàng */
export const SELLER_SALES_FEATURES: SellerFeature[] = [
  {
    id: 'sales:orders-all',
    label: 'Đơn hàng',
    hint: 'Tạo, xem, cập nhật đơn bán',
    icon: 'cart',
  },
  {
    id: 'sales:shipping',
    label: 'Đơn vận chuyển',
    hint: 'Theo dõi giao hàng',
    icon: 'truck',
  },
  {
    id: 'sales:returns',
    label: 'Trả hàng',
    hint: 'Đơn hoàn / trả',
    icon: 'refresh',
  },
  {
    id: 'sales:shop:1',
    label: 'Cửa hàng Shopee',
    hint: 'Đơn theo kênh bán',
    icon: 'store',
  },
  {
    id: 'sales:shop:2',
    label: 'Cửa hàng TikTok',
    hint: 'Đơn theo kênh bán',
    icon: 'store',
  },
];

/** Tab Danh mục */
export const SELLER_CATALOG_FEATURES: SellerFeature[] = [
  {
    id: 'category:products',
    label: 'Sản phẩm',
    hint: 'SKU, giá, ảnh',
    icon: 'cube',
  },
  {
    id: 'category:prices',
    label: 'Bảng giá',
    hint: 'Chính sách giá bán',
    icon: 'cash',
  },
  {
    id: 'category:suppliers',
    label: 'Nhà cung cấp',
    hint: 'Đối tác cung ứng',
    icon: 'business',
  },
  {
    id: 'category:customers',
    label: 'Khách hàng',
    hint: 'Danh sách khách',
    icon: 'person',
  },
];

/** Tab Hàng hóa */
export const SELLER_GOODS_FEATURES: SellerFeature[] = [
  {
    id: 'goods:my-inventory',
    label: 'Tồn kho của tôi',
    hint: 'Số lượng tồn theo kho',
    icon: 'layers',
  },
  {
    id: 'goods:purchase',
    label: 'Mua hàng',
    hint: 'Đơn mua / nhập hàng',
    icon: 'download',
  },
  {
    id: 'goods:combo-pack',
    label: 'Đóng gói combo',
    hint: 'Lắp ráp bộ sản phẩm',
    icon: 'package',
  },
];

/** Tab Tài chính */
export const SELLER_FINANCE_FEATURES: SellerFeature[] = [
  {
    id: 'finance:invoices',
    label: 'Hóa đơn',
    hint: 'Phí dịch vụ, billing',
    icon: 'document',
  },
  {
    id: 'finance:settlements',
    label: 'Quyết toán',
    hint: 'Đối soát kỳ',
    icon: 'compare',
  },
  {
    id: 'finance:payments',
    label: 'Thanh toán',
    hint: 'Lịch sử thanh toán',
    icon: 'card',
  },
  {
    id: 'finance:gateway',
    label: 'Cổng giao dịch TT',
    hint: 'Giao dịch qua cổng',
    icon: 'wallet',
  },
  {
    id: 'finance:service-pricing',
    label: 'Bảng giá dịch vụ',
    hint: 'Phí lưu kho, xử lý…',
    icon: 'wallet',
  },
];

/** Avatar / Cài đặt */
export const SELLER_SETTINGS_FEATURES: SellerFeature[] = [
  {
    id: 'settings:shops',
    label: 'Cửa hàng',
    hint: 'Kênh bán, API shop',
    icon: 'store',
  },
  {
    id: 'settings:bank-accounts',
    label: 'Tài khoản ngân hàng',
    hint: 'Thu chi, đối soát',
    icon: 'card',
  },
  {
    id: 'settings:carriers',
    label: 'Đối tác vận chuyển',
    hint: 'GHN, GHTK, TOSOL…',
    icon: 'truck',
  },
  {
    id: 'settings:webhooks',
    label: 'Webhooks',
    hint: 'Sự kiện hệ thống',
    icon: 'link',
  },
  {
    id: 'settings:staff',
    label: 'Nhân viên',
    hint: 'Tài khoản nhân sự',
    icon: 'person',
  },
];
