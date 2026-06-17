import type {
  OrderAdvancedFilters,
  OrderFilterSelectOption,
} from '@/src/types/orders/orderFilters.types';
import { saleOrderStatusLabels } from './orders.constants';

export const orderAdvancedFilterCopy = {
  title: 'Bộ lọc nâng cao',
  statusLabel: 'Trạng thái',
  paymentLabel: 'Thanh toán',
  issueLabel: 'Đơn hàng có vấn đề',
  dateFromLabel: 'Từ ngày',
  dateToLabel: 'Đến ngày',
  datePlaceholder: 'dd/mm/yyyy',
  allOption: 'Tất cả',
  yesOption: 'Có',
  noOption: 'Không',
  reset: 'Đặt Lại',
  cancel: 'Hủy',
  apply: 'Áp Dụng',
  selectStatus: 'Chọn trạng thái',
  selectPayment: 'Chọn thanh toán',
  selectIssue: 'Chọn điều kiện',
  invalidDateRange: 'Ngày bắt đầu không được sau ngày kết thúc',
} as const;

export const EMPTY_ORDER_ADVANCED_FILTERS: OrderAdvancedFilters = {
  status: '',
  paymentStatus: '',
  hasIssue: '',
  dateFrom: '',
  dateTo: '',
};

export const orderStatusFilterOptions: OrderFilterSelectOption[] = [
  { value: '', label: orderAdvancedFilterCopy.allOption },
  { value: 'pending', label: saleOrderStatusLabels.pending },
  { value: 'confirmed', label: saleOrderStatusLabels.confirmed },
  { value: 'packing', label: saleOrderStatusLabels.packing },
  { value: 'pending_transfer', label: saleOrderStatusLabels.pending_transfer },
  { value: 'transferring', label: saleOrderStatusLabels.transferring },
  { value: 'transfer_failed', label: saleOrderStatusLabels.transfer_failed },
  { value: 'shipping', label: saleOrderStatusLabels.shipping },
  { value: 'ready_to_ship', label: saleOrderStatusLabels.ready_to_ship },
  { value: 'delivered', label: saleOrderStatusLabels.delivered },
  { value: 'returned', label: saleOrderStatusLabels.returned },
  {
    value: 'partially_returned',
    label: saleOrderStatusLabels.partially_returned,
  },
  { value: 'cancelled', label: saleOrderStatusLabels.cancelled },
];

export const orderPaymentFilterOptions: OrderFilterSelectOption[] = [
  { value: '', label: orderAdvancedFilterCopy.allOption },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'partial_paid', label: 'Thanh toán một phần' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'voided', label: 'Đã huỷ' },
  { value: 'pending_refund', label: 'Chờ hoàn tiền' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

export const orderIssueFilterOptions: OrderFilterSelectOption[] = [
  { value: '', label: orderAdvancedFilterCopy.allOption },
  { value: 'yes', label: orderAdvancedFilterCopy.yesOption },
  { value: 'no', label: orderAdvancedFilterCopy.noOption },
];

export function findFilterOptionLabel(
  options: OrderFilterSelectOption[],
  value: string,
): string {
  return (
    options.find(option => option.value === value)?.label ??
    orderAdvancedFilterCopy.allOption
  );
}

export function normalizeOrderAdvancedFilters(
  filters: OrderAdvancedFilters,
): OrderAdvancedFilters {
  return {
    status: filters.status.trim(),
    paymentStatus: filters.paymentStatus.trim(),
    hasIssue: filters.hasIssue,
    dateFrom: filters.dateFrom.trim(),
    dateTo: filters.dateTo.trim(),
  };
}

export function countActiveOrderFilters(filters: OrderAdvancedFilters): number {
  let count = 0;
  if (filters.status) {
    count += 1;
  }
  if (filters.paymentStatus) {
    count += 1;
  }
  if (filters.hasIssue) {
    count += 1;
  }
  if (filters.dateFrom) {
    count += 1;
  }
  if (filters.dateTo) {
    count += 1;
  }
  return count;
}
