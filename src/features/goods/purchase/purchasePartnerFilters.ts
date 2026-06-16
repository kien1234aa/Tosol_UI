import type { GetPurchaseOrdersParams } from '@services/warehouse/purchaseOrderAPI';

/** Lọc đối tác / kênh — dropdown thứ 2 màn mua hàng. */
export type PurchasePartnerListFilter =
  | 'all'
  | 'return_receipt'
  | 'susu'
  | 'tomoni';

export const PURCHASE_PARTNER_FILTER_OPTIONS: {
  key: PurchasePartnerListFilter;
  label: string;
}[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'return_receipt', label: 'NHẬN HÀNG HOÀN TRẢ' },
  { key: 'susu', label: 'CÔNG TY TNHH & TM SUSU VIỆT NAM' },
  { key: 'tomoni', label: 'Tomoni JP' },
];

const SUSU_NAME_HINTS = ['susu việt nam', 'susu viet nam', 'tm susu', 'susu'];
const TOMONI_NAME_HINTS = ['tomoni'];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function findSupplierIdByHints(
  suppliers: readonly { id: number; name: string }[],
  hints: readonly string[],
): number | null {
  for (const { id, name } of suppliers) {
    const n = norm(name);
    for (const h of hints) {
      if (n.includes(norm(h))) {
        return id;
      }
    }
  }
  return null;
}

/**
 * Ánh xạ lựa chọn dropdown → tham số `GET /purchase-orders`.
 * Khi không match được `supplier_id`, gửi `filter[supplier_name]` (xem `purchaseOrderAPI`).
 */
export function purchasePartnerFilterToApiParams(
  filter: PurchasePartnerListFilter,
  supplierRows: readonly { id: number; name: string }[],
): Pick<
  GetPurchaseOrdersParams,
  'filterReturnReceipt' | 'filterSupplierId' | 'filterSupplierName'
> {
  if (filter === 'all') {
    return {};
  }
  if (filter === 'return_receipt') {
    return { filterReturnReceipt: true };
  }
  if (filter === 'susu') {
    const id = findSupplierIdByHints(supplierRows, SUSU_NAME_HINTS);
    if (id != null) {
      return { filterSupplierId: id };
    }
    return { filterSupplierName: 'CÔNG TY TNHH & TM SUSU VIỆT NAM' };
  }
  const id = findSupplierIdByHints(supplierRows, TOMONI_NAME_HINTS);
  if (id != null) {
    return { filterSupplierId: id };
  }
  return { filterSupplierName: 'Tomoni JP' };
}
