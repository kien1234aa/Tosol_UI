import { dateToIsoDateOnly } from '@/src/helpers/orders/orderFilters.helpers';
import { labelFromCustomerLocationField, normalizeCustomerPhone } from '@/src/helpers/createOrder/createOrder.helpers';
import type {
  CreateOrderFormState,
  CreateOrderSelectOption,
  CreateOrderShippingMethod,
  CustomerApiItem,
  CustomerSearchResult,
  SellerWarehouseApiItem,
  WarehouseShippingPartnerApiItem,
  ShopApiItem,
} from '@/src/types/orders/createOrder.types';

export const createOrderCopy = {
  title: 'Tạo đơn hàng',
  sectionSetup: 'Thiết lập đơn hàng',
  sectionShipping: 'Giao hàng & Thanh toán',
  sectionAdvanced: 'Nâng cao',
  shopLabel: 'Cửa hàng',
  packagingWarehouseLabel: 'Kho đóng gói',
  customerLabel: 'Khách hàng',
  shippingMethodTitle: 'PHƯƠNG THỨC GIAO HÀNG',
  shippingSellerPartner: 'Đối tác của seller',
  shippingWarehousePartner: 'Đối tác của kho',
  shippingCustomerPickup: 'Khách tự đến lấy',
  warehousePartnerLabel: 'Chọn đối tác của kho',
  sellerPartnerLabel: 'Đơn vị vận chuyển',
  recipientSectionTitle: 'THÔNG TIN NGƯỜI NHẬN',
  recipientNameLabel: 'Tên người nhận',
  recipientPhoneLabel: 'Số điện thoại',
  recipientAddressLabel: 'Địa chỉ',
  shippingFeeLabel: 'Phí vận chuyển',
  provinceLabel: 'Tỉnh/Thành phố',
  districtLabel: 'Quận/Huyện',
  wardLabel: 'Phường/Xã',
  codLabel: 'Thu hộ COD',
  orderDateLabel: 'Ngày đặt hàng',
  selectOrderDate: 'Chọn ngày',
  orderDatePickerTitle: 'Chọn ngày đặt hàng',
  shippingWarehouseLabel: 'Kho xuất hàng',
  selectShippingWarehouse: 'Chọn kho xuất hàng',
  shippingWarehousePickerTitle: 'Chọn kho xuất hàng',
  discountPercentLabel: 'Giảm giá (%)',
  discountPercentPlaceholder: '0',
  discountPercentSuffix: '%',
  orderNoteLabel: 'Ghi chú',
  orderNotePlaceholder: 'Nhập ghi chú cho đơn hàng',
  orderDateRequired: 'Vui lòng chọn ngày đặt hàng',
  discountPercentInvalid: 'Giảm giá phải từ 0 đến 100',
  totalLabel: 'Tổng cộng',
  submit: 'Tạo Đơn Hàng',
  cancel: 'Hủy',
  requiredMark: '*',
  selectShop: 'Chọn cửa hàng',
  selectWarehouse: 'Chọn kho đóng gói',
  selectCustomer: 'Chọn khách hàng',
  searchCustomerPlaceholder: 'Tìm khách hàng (tối thiểu 2 ký tự)',
  searchCustomerHint: 'Nhập ít nhất 2 ký tự để tìm khách hàng',
  searchCustomerEmpty: 'Không tìm thấy khách hàng',
  searchCustomerError: 'Không thể tìm khách hàng',
  selectPartner: 'Chọn đối tác của kho',
  selectProvince: 'Tỉnh/Thành phố',
  selectDistrict: 'Quận/Huyện',
  selectWard: 'Phường/Xã',
  shopPickerTitle: 'Chọn cửa hàng',
  warehousePickerTitle: 'Chọn kho đóng gói',
  customerPickerTitle: 'Chọn khách hàng',
  partnerPickerTitle: 'Chọn đối tác của kho',
  provincePickerTitle: 'Chọn Tỉnh/Thành phố',
  districtPickerTitle: 'Chọn Quận/Huyện',
  wardPickerTitle: 'Chọn Phường/Xã',
  loadingOptions: 'Đang tải...',
  loadError: 'Không thể tải dữ liệu',
  retry: 'Thử lại',
  noOptions: 'Không có dữ liệu',
  customerComingSoon: 'Chưa có danh sách khách hàng',
  partnerComingSoon: 'Chưa có danh sách đối tác',
  locationComingSoon: 'Chưa có danh sách địa chỉ',
  searchWarehouseRequired: 'Vui lòng chọn kho ở màn hình tìm kiếm',
  itemsRequired: 'Vui lòng chọn ít nhất một sản phẩm',
  locationRequired: 'Vui lòng chọn đủ Tỉnh / Quận / Phường',
  customerRequired: 'Vui lòng chọn khách hàng',
  submitError: 'Không thể tạo đơn hàng',
  submitSuccessTitle: 'Tạo đơn thành công',
  submitSuccessPrefix: 'Đơn ',
  submitSuccessTotalLabel: 'Tổng: ',
  shopRequired: 'Vui lòng chọn cửa hàng',
  warehouseRequired: 'Vui lòng chọn kho đóng gói',
  recipientNameRequired: 'Vui lòng nhập tên người nhận',
  recipientPhoneRequired: 'Vui lòng nhập số điện thoại',
  recipientAddressRequired: 'Vui lòng nhập địa chỉ',
  partnerRequired: 'Vui lòng chọn đối tác của kho',
  shippingPartnersLoadError: 'Không thể tải đối tác vận chuyển',
  shippingEstimateError: 'Không thể ước tính phí vận chuyển',
  provincesLoadError: 'Không thể tải Tỉnh/Thành phố',
  districtsLoadError: 'Không thể tải Quận/Huyện',
  wardsLoadError: 'Không thể tải Phường/Xã',
} as const;

export const createOrderShippingMethods: {
  value: CreateOrderShippingMethod;
  label: string;
}[] = [
  { value: 'seller_partner', label: createOrderCopy.shippingSellerPartner },
  { value: 'warehouse_partner', label: createOrderCopy.shippingWarehousePartner },
  { value: 'customer_pickup', label: createOrderCopy.shippingCustomerPickup },
];

/** Local-only id for the fixed Best Express option when shipping via seller partner. */
export const sellerBestExpressPartnerId = -1;

export const sellerBestExpressPartnerOption: CreateOrderSelectOption = {
  id: sellerBestExpressPartnerId,
  label: 'Best Express',
};

export const defaultCreateOrderFormState: CreateOrderFormState = {
  shopId: null,
  packagingWarehouseId: null,
  customerId: null,
  shippingMethod: 'warehouse_partner',
  warehousePartnerId: null,
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  provinceId: null,
  districtId: null,
  wardId: null,
  isCodEnabled: false,
  isAdvancedOpen: false,
  orderDate: dateToIsoDateOnly(new Date()),
  shippingWarehouseId: null,
  discountPercent: '',
  note: '',
};

export function mapShopToSelectOption(shop: ShopApiItem): CreateOrderSelectOption {
  return {
    id: shop.id,
    label: shop.name,
  };
}

export function mapWarehouseToSelectOption(
  warehouse: SellerWarehouseApiItem,
): CreateOrderSelectOption {
  return {
    id: warehouse.id,
    label: warehouse.name,
    subtitle: warehouse.code,
  };
}

export function formatWarehouseOptionLabel(option: CreateOrderSelectOption): string {
  if (option.subtitle) {
    return `${option.label} (${option.subtitle})`;
  }

  return option.label;
}

export function findSelectOptionLabel(
  options: CreateOrderSelectOption[],
  selectedId: number | null,
  placeholder: string,
): string {
  if (selectedId == null) {
    return placeholder;
  }

  const option = options.find(item => item.id === selectedId);
  if (!option) {
    return placeholder;
  }

  return formatWarehouseOptionLabel(option);
}

export function findShopOptionLabel(
  options: CreateOrderSelectOption[],
  selectedId: number | null,
): string {
  if (selectedId == null) {
    return createOrderCopy.selectShop;
  }

  return (
    options.find(item => item.id === selectedId)?.label ??
    createOrderCopy.selectShop
  );
}

export function mapCustomerToSearchResult(
  customer: CustomerApiItem,
): CustomerSearchResult {
  return {
    id: customer.id,
    name: customer.name,
    phone: normalizeCustomerPhone(customer.phone),
    address: customer.address?.trim() || '',
    fullAddress: customer.full_address?.trim() || '',
    email: customer.email,
    provinceLabel: labelFromCustomerLocationField(customer.province),
    districtLabel: labelFromCustomerLocationField(customer.district),
    wardLabel: labelFromCustomerLocationField(customer.ward),
  };
}

export function getWarehouseCodeFromOptions(
  options: CreateOrderSelectOption[],
  warehouseId: number | null,
): string | null {
  if (warehouseId == null) {
    return null;
  }

  const code = options.find(item => item.id === warehouseId)?.subtitle?.trim();
  return code || null;
}

export function mapShippingPartnerToSelectOption(
  partner: WarehouseShippingPartnerApiItem,
): CreateOrderSelectOption {
  const partnerName =
    partner.shipping_partner_config.shipping_partner.name.trim();
  const description = partner.description.trim();

  return {
    id: partner.id,
    label: partnerName,
    subtitle:
      description && description !== partnerName ? description : undefined,
    estimatePartnerId: partner.id,
  };
}
