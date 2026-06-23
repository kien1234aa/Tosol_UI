import type {
  SaleOrderApiItem,
  SaleOrderDetailApi,
} from '@/src/types/orders/saleOrder.types';
import type {
  OrderDetail,
  OrderDetailChildOrder,
  OrderDetailChildOrderKind,
  OrderDetailProduct,
  OrderDetailShipping,
  OrderListItem,
} from '@/src/types/orders/orders.types';
import {
  outboundOrderStatusLabels,
  packingBoxStatusLabels,
  packingOrderStatusLabels,
  returnOrderStatusLabels,
  shipmentStatusLabels,
} from '@/src/configs/orders';
import { formatOrderStatusLabel } from '@/src/helpers/orders/orders.helpers';

function parseMoney(value: string | number | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }

  return 0;
}

function sumItemQuantities(items: SaleOrderApiItem['items']): number {
  if (!items?.length) {
    return 0;
  }

  return items.reduce(
    (sum, item) => sum + Math.max(0, Math.round(Number(item.quantity) || 0)),
    0,
  );
}

function getPrimaryProduct(items: SaleOrderApiItem['items']) {
  return items?.[0] ?? null;
}

export function mapSaleOrderToListItem(order: SaleOrderApiItem): OrderListItem {
  const items = order.items ?? [];
  const primaryItem = getPrimaryProduct(items);
  const productName =
    primaryItem?.name?.trim() ||
    primaryItem?.product?.name?.trim() ||
    '—';

  return {
    id: order.order_number,
    orderNumber: order.order_number,
    uuid: order.uuid,
    createdAt: order.created_at,
    totalCostVnd: parseMoney(order.total),
    paidVnd: parseMoney(order.paid_amount ?? order.total_paid),
    remainingVnd: parseMoney(order.remaining_amount),
    packageCount: items.length,
    status: order.status,
    paymentStatus: order.payment_status,
    productName,
    productQuantity: sumItemQuantities(items) || items.length,
    thumbnailUrl:
      primaryItem?.product?.thumbnail_url ??
      primaryItem?.product?.image_url ??
      null,
    customerName: order.customer?.name?.trim() || '—',
    shopName: order.shop?.name?.trim() || '—',
  };
}

export function mapSaleOrdersToListItems(orders: SaleOrderApiItem[]): OrderListItem[] {
  return orders.map(mapSaleOrderToListItem);
}

function mapSaleOrderItemsToDetailProducts(
  items: SaleOrderDetailApi['items'],
): OrderDetailProduct[] {
  if (!items?.length) {
    return [];
  }

  return items.map(item => ({
    id: String(item.id),
    name: item.name?.trim() || item.product?.name?.trim() || '—',
    sku: item.sku?.trim() || item.product?.sku?.trim() || '—',
    unitPriceVnd: parseMoney(item.unit_price),
    quantity: Math.max(0, Math.round(Number(item.quantity) || 0)),
    lineTotalVnd: parseMoney(item.total),
    thumbnailUrl:
      item.product?.thumbnail_url ?? item.product?.image_url ?? null,
  }));
}

function resolveShippingPartnerName(
  shipment: NonNullable<SaleOrderDetailApi['shipment']>,
): string {
  const fromSeller =
    shipment.shipping_partner_seller?.shipping_partner?.name?.trim();
  if (fromSeller) {
    return fromSeller;
  }

  const fromWarehouse =
    shipment.shipping_partner_warehouse?.shipping_partner_config?.shipping_partner?.name?.trim();
  if (fromWarehouse) {
    return fromWarehouse;
  }

  const fromWarehouseDescription =
    shipment.shipping_partner_warehouse?.description?.trim() ||
    shipment.shipping_partner_warehouse?.shipping_partner_config?.description?.trim();
  if (fromWarehouseDescription) {
    return fromWarehouseDescription;
  }

  const fromCode = shipment.shipping_partner_code?.trim();
  if (fromCode) {
    return fromCode;
  }

  return '—';
}

function resolveTrackingNumber(order: SaleOrderDetailApi): string | null {
  const shipment = order.shipment;
  const candidates = [
    shipment?.tracking_number,
    order.tracking_number,
    ...(order.packing_order?.boxes ?? []).flatMap(box => [
      box.tracking_number,
      box.box_code,
    ]),
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

function childOrderStatusLabel(
  kind: OrderDetailChildOrderKind,
  status: string | null | undefined,
): string {
  switch (kind) {
    case 'packing':
      return formatOrderStatusLabel(status, packingOrderStatusLabels);
    case 'outbound':
      return formatOrderStatusLabel(status, outboundOrderStatusLabels);
    case 'return':
      return formatOrderStatusLabel(status, returnOrderStatusLabels);
    case 'box':
      return formatOrderStatusLabel(status, packingBoxStatusLabels);
    default:
      return formatOrderStatusLabel(status, packingOrderStatusLabels);
  }
}

function mapSaleOrderChildOrders(
  order: SaleOrderDetailApi,
): OrderDetailChildOrder[] {
  const childOrders: OrderDetailChildOrder[] = [];

  const packingOrder = order.packing_order;
  if (packingOrder?.order_number?.trim()) {
    childOrders.push({
      id: `packing-${packingOrder.id}`,
      kind: 'packing',
      orderNumber: packingOrder.order_number.trim(),
      status: packingOrder.status?.trim() || '',
      statusLabel: childOrderStatusLabel('packing', packingOrder.status),
    });

    for (const box of packingOrder.boxes ?? []) {
      const boxCode = box.box_code?.trim();
      if (!boxCode) {
        continue;
      }

      childOrders.push({
        id: `box-${box.id}`,
        kind: 'box',
        orderNumber: boxCode,
        status: box.status?.trim() || '',
        statusLabel: childOrderStatusLabel('box', box.status),
      });
    }
  }

  for (const outboundOrder of order.outbound_orders ?? []) {
    const orderNumber = outboundOrder.order_number?.trim();
    if (!orderNumber) {
      continue;
    }

    childOrders.push({
      id: `outbound-${outboundOrder.id}`,
      kind: 'outbound',
      orderNumber,
      status: outboundOrder.status?.trim() || '',
      statusLabel: childOrderStatusLabel('outbound', outboundOrder.status),
    });
  }

  for (const returnOrder of order.return_orders ?? []) {
    const orderNumber = returnOrder.order_number?.trim();
    if (!orderNumber) {
      continue;
    }

    childOrders.push({
      id: `return-${returnOrder.id}`,
      kind: 'return',
      orderNumber,
      status: returnOrder.status?.trim() || '',
      statusLabel: childOrderStatusLabel('return', returnOrder.status),
    });
  }

  return childOrders;
}

function mapSaleOrderShipment(
  order: SaleOrderDetailApi,
): OrderDetailShipping | null {
  const shipment = order.shipment;
  if (!shipment) {
    return null;
  }

  const addressParts = [
    shipment.recipient_address,
    shipment.recipient_ward,
    shipment.recipient_district,
    shipment.recipient_province,
  ]
    .map(part => part?.trim())
    .filter(Boolean);

  const shipmentStatus = shipment.status?.trim() || null;

  return {
    recipientName: shipment.recipient_name?.trim() || '—',
    recipientPhone: shipment.recipient_phone?.trim() || '—',
    recipientAddress: addressParts.join(', ') || '—',
    shippingPartnerName: resolveShippingPartnerName(shipment),
    trackingNumber: resolveTrackingNumber(order),
    shippingFeeVnd: parseMoney(shipment.shipping_fee ?? order.shipping_fee),
    collectCod: Boolean(shipment.collect_cod ?? order.collect_cod),
    codAmountVnd: parseMoney(shipment.cod_amount ?? order.cod_amount),
    shippingPayer: order.shipping_payer?.trim() || '—',
    shipmentStatus,
    shipmentStatusLabel: shipmentStatus
      ? formatOrderStatusLabel(shipmentStatus, shipmentStatusLabels)
      : null,
  };
}

export function mapSaleOrderDetailToOrderDetail(
  order: SaleOrderDetailApi,
): OrderDetail {
  const listBase = mapSaleOrderToListItem(order);
  const items = order.items ?? [];
  const shipping = mapSaleOrderShipment(order);

  return {
    ...listBase,
    orderDate: order.order_date ?? order.created_at,
    paymentMethod: order.payment_method?.trim() || '—',
    note: order.note?.trim() || '',
    hasIssue: Boolean(order.has_issue),
    issueNote: order.issue_note?.trim() || null,
    creatorName: order.creator?.name?.trim() || '—',
    warehouseName:
      order.packing_warehouse?.name?.trim() ||
      order.warehouse?.name?.trim() ||
      '—',
    customerPhone: order.customer?.phone?.trim() || '—',
    customerAddress:
      order.customer?.full_address?.trim() ||
      order.customer?.address?.trim() ||
      '—',
    packingOrderNumber: order.packing_order?.order_number?.trim() || null,
    childOrders: mapSaleOrderChildOrders(order),
    products: mapSaleOrderItemsToDetailProducts(items),
    shipping,
    costs: {
      goodsVnd: parseMoney(order.items_total ?? order.subtotal),
      discountVnd: parseMoney(order.discount_amount),
      taxVnd: parseMoney(order.tax_amount),
      shippingFeeVnd: parseMoney(order.shipping_fee),
      totalVnd: parseMoney(order.total),
      paidVnd: parseMoney(order.paid_amount ?? order.total_paid),
      remainingVnd: parseMoney(order.remaining_amount),
    },
  };
}

export function canCancelSaleOrder(status: string): boolean {
  return status === 'pending' || status === 'confirmed' || status === 'packing';
}

export function canEditSaleOrder(status: string): boolean {
  return canCancelSaleOrder(status);
}
