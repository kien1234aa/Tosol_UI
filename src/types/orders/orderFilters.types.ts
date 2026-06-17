/** Advanced filters for GET /sale-orders. */

export type OrderIssueFilter = '' | 'yes' | 'no';

export interface OrderAdvancedFilters {
  status: string;
  paymentStatus: string;
  hasIssue: OrderIssueFilter;
  dateFrom: string;
  dateTo: string;
}

export interface OrderFilterSelectOption {
  value: string;
  label: string;
}
