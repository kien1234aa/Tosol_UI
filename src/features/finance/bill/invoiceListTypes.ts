/** Trạng thái hóa đơn phí dịch vụ (UI + lọc). */
export type InvoiceRowStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'draft'
  | 'cancelled';

export type InvoiceListFilter = 'all' | InvoiceRowStatus;

export type InvoiceListRow = {
  id: string;
  invoiceNumber: string;
  sellerName: string;
  sellerCode: string;
  periodLabel: string;
  totalDisplay: string;
  status: InvoiceRowStatus;
  statusLabel: string;
  createdAtLabel: string;
};
