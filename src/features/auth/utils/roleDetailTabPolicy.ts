import type { AppRole } from '../types/appRole';
import { CUSTOMER_DETAIL_TABS } from '@features/category/customers/customerDetail/customerDetailTypes';
import { PRODUCT_DETAIL_TABS } from '@features/category/products/productDetail/productDetailTypes';
import { SUPPLIER_DETAIL_TABS } from '@features/category/suppliers/supplierDetail/supplierDetailTypes';
import { INVOICE_DETAIL_TABS } from '@features/finance/bill/invoiceDetail/invoiceDetailTypes';
import { SETTLEMENT_DETAIL_TABS } from '@features/finance/settlement/settlementDetail/settlementDetailTypes';
import { INVENTORY_PRODUCT_DETAIL_TABS } from '@features/goods/myInventory/inventoryProductDetailTypes';
import { PO_DETAIL_TABS } from '@features/goods/screens/purchaseOrderDetail/poDetailTypes';
import { INBOUND_ORDER_DETAIL_TABS } from '@features/inbound/screens/inboundOrderDetail/inboundOrderDetailTypes';
import { OUTBOUND_ORDER_DETAIL_TABS } from '@features/outbound/screens/outboundOrderDetail/outboundOrderDetailTypes';
import { PACKING_ORDER_DETAIL_TABS } from '@features/pack/screens/packingOrderDetail/packingOrderDetailTypes';
import { ORDER_TABS } from '@features/sales/screens/orderDetail/orderDetailTypes';
import { SHOP_DETAIL_TABS } from '@features/settings/shops/shopDetail/shopDetailTypes';
import { TRANSFER_ORDER_DETAIL_TABS } from '@features/transfer/screens/transferOrderDetail/transferOrderDetailTypes';
import { COMBO_ASSEMBLY_DETAIL_TABS } from '@features/comboAssembly/screens/comboAssemblyDetail/comboAssemblyDetailTypes';

/** Khi đổi role / policy tab, đảm bảo tab đang chọn vẫn nằm trong danh sách được phép. */
export function coerceDetailActiveTabId<T extends string>(
  current: T,
  visible: readonly { id: T }[],
  fallback: T,
): T {
  if (visible.some(x => x.id === current)) {
    return current;
  }
  return visible[0]?.id ?? fallback;
}

/** Tab chi tiết đơn bán — gồm nhật ký hoạt động. */
export function orderDetailTabsForAppRole(_role: AppRole) {
  return [...ORDER_TABS];
}

export function purchaseOrderDetailTabsForAppRole(_role: AppRole) {
  return [...PO_DETAIL_TABS];
}

export function packingOrderDetailTabsForAppRole(_role: AppRole) {
  return [...PACKING_ORDER_DETAIL_TABS];
}

export function outboundOrderDetailTabsForAppRole(_role: AppRole) {
  return [...OUTBOUND_ORDER_DETAIL_TABS];
}

export function inboundOrderDetailTabsForAppRole(_role: AppRole) {
  return [...INBOUND_ORDER_DETAIL_TABS];
}

export function productDetailTabsForAppRole(_role: AppRole) {
  return [...PRODUCT_DETAIL_TABS];
}

export function invoiceDetailTabsForAppRole(_role: AppRole) {
  return [...INVOICE_DETAIL_TABS];
}

export function settlementDetailTabsForAppRole(_role: AppRole) {
  return [...SETTLEMENT_DETAIL_TABS];
}

export function customerDetailTabsForAppRole(_role: AppRole) {
  return [...CUSTOMER_DETAIL_TABS];
}

export function supplierDetailTabsForAppRole(_role: AppRole) {
  return [...SUPPLIER_DETAIL_TABS];
}

export function shopDetailTabsForAppRole(_role: AppRole) {
  return [...SHOP_DETAIL_TABS];
}

export function inventoryProductDetailTabsForAppRole(_role: AppRole) {
  return [...INVENTORY_PRODUCT_DETAIL_TABS];
}

export function transferOrderDetailTabsForAppRole(_role: AppRole) {
  return [...TRANSFER_ORDER_DETAIL_TABS];
}

export function comboAssemblyDetailTabsForAppRole(_role: AppRole) {
  return [...COMBO_ASSEMBLY_DETAIL_TABS];
}
