/** Domain models for the "Tạo đơn ký gửi" (create consignment order) screen. */

export interface ConsignmentPackageDraft {
  id: string;
  trackingCode: string;
  productName: string;
  note: string;
}

export interface ConsignmentPackageErrors {
  trackingCode?: string;
  productName?: string;
}

/** Validation errors keyed by package draft id. */
export type ConsignmentErrors = Record<string, ConsignmentPackageErrors>;

/** Lifecycle status of a consignment (ký gửi) order. */
export type ConsignmentOrderStatus =
  | 'awaitingChinaWarehouse'
  | 'inChinaWarehouse'
  | 'inTransit'
  | 'inVietnamWarehouse'
  | 'delivered';

export type ConsignmentStatusFilter = ConsignmentOrderStatus | 'all';

export interface ConsignmentOrderItem {
  id: string;
  createdAt: string;
  trackingCode: string;
  productName: string;
  status: ConsignmentOrderStatus;
  weightKg: number;
  costVnd: number;
  note: string;
}
