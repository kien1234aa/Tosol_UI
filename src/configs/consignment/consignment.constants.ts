import type {
  ConsignmentOrderItem,
  ConsignmentOrderStatus,
} from '@/src/types/consignment/consignment.types';

/** Static, localized copy for the create-consignment surface. */
export const consignmentCopy = {
  screenTitle: 'Tạo đơn ký gửi',
  back: 'Quay lại',
  sectionTitle: 'Thông tin kiện hàng',
  addPackage: 'Thêm kiện',
  packageLabel: 'Kiện',
  removePackage: 'Xoá kiện',
  trackingCodePlaceholder: 'Mã vận đơn *',
  productNamePlaceholder: 'Tên sản phẩm *',
  notePlaceholder: 'Ghi chú',
  submit: 'Tạo đơn ký gửi',
  requiredTrackingCode: 'Vui lòng nhập mã vận đơn',
  requiredProductName: 'Vui lòng nhập tên sản phẩm',
  submitSuccess: 'Đã tạo đơn ký gửi (mock)',
} as const;

export const consignmentLimits = {
  maxPackages: 20,
} as const;

/** Localized copy for the consignment order list surface. */
export const consignmentListCopy = {
  title: 'Danh sách đơn ký gửi',
  filter: 'Lọc',
  filterTitle: 'Lọc đơn ký gửi',
  filterAll: 'Tất cả',
  addOrder: 'Tạo đơn',
  createdAtLabel: 'Ngày tạo:',
  statusLabel: 'Trạng thái:',
  productNameLabel: 'Tên sản phẩm:',
  weightLabel: 'Cân nặng:',
  costLabel: 'Chi phí:',
  viewDetail: 'Xem chi tiết',
  deleteOrder: 'Xoá đơn',
  empty: 'Chưa có đơn ký gửi nào',
  emptyFiltered: 'Không có đơn phù hợp bộ lọc',
} as const;

/** Localized copy for the consignment order detail surface. */
export const consignmentDetailCopy = {
  screenTitle: 'Chi tiết đơn ký gửi',
  back: 'Quay lại',
  notFound: 'Không tìm thấy đơn ký gửi',
  infoTitle: 'Thông tin kiện hàng',
  trackingCodeLabel: 'Mã vận đơn:',
  productNameLabel: 'Tên sản phẩm:',
  weightLabel: 'Cân nặng:',
  createdAtLabel: 'Ngày tạo:',
  statusLabel: 'Trạng thái:',
  noteTitle: 'Ghi chú',
  costTitle: 'Chi phí',
  costLabel: 'Tổng chi phí:',
} as const;

export const consignmentStatusLabels: Record<ConsignmentOrderStatus, string> = {
  awaitingChinaWarehouse: 'Chờ nhập kho TQ',
  inChinaWarehouse: 'Đã nhập kho TQ',
  inTransit: 'Đang vận chuyển',
  inVietnamWarehouse: 'Đã về kho VN',
  delivered: 'Đã giao',
};

/** Mock consignment orders for the list tab. */
export const mockConsignmentOrders: ConsignmentOrderItem[] = [
  {
    id: 'cns-1',
    createdAt: '2026-06-16',
    trackingCode: 'a01',
    productName: 'hehe',
    status: 'awaitingChinaWarehouse',
    weightKg: 0,
    costVnd: 0,
    note: '',
  },
  {
    id: 'cns-2',
    createdAt: '2026-06-14',
    trackingCode: 'SF1234567890',
    productName: 'Giày thể thao nam',
    status: 'inChinaWarehouse',
    weightKg: 1.25,
    costVnd: 185_000,
    note: '',
  },
  {
    id: 'cns-3',
    createdAt: '2026-06-10',
    trackingCode: 'YT9988776655',
    productName: 'Bộ nồi inox 5 món',
    status: 'inTransit',
    weightKg: 4.8,
    costVnd: 612_000,
    note: 'Hàng dễ vỡ',
  },
];
