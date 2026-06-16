import type {
  ShipmentRecord,
  ShipmentSaleOrderNested,
} from '@services/sales/shipmentApiTypes';
import {
  formatDateVi,
  formatMoneyFromApi,
} from '@features/sales/screens/orderDetail/orderDetailFormatters';
import type { ShipmentListRow, ShipmentRowStatus } from '@features/sales/shipments/shipmentListTypes';

function pickSaleOrder(s: ShipmentRecord): ShipmentSaleOrderNested | null {
  return s.sale_order ?? s.saleOrder ?? null;
}

function mapShipmentRowStatus(raw: string | undefined): ShipmentRowStatus {
  const v = raw?.trim().toLowerCase() ?? '';
  const map: Record<string, ShipmentRowStatus> = {
    pending: 'pending',
    created: 'created',
    picking: 'picking',
    ready_for_pickup: 'picking',
    ready_to_ship: 'picking',
    in_transit: 'in_transit',
    shipped: 'in_transit',
    out_for_delivery: 'out_for_delivery',
    shipping: 'delivering',
    delivering: 'delivering',
    delivered: 'delivered',
    failed_delivery: 'failed_delivery',
    returning: 'returning',
    returned: 'returned',
    cancelled: 'cancelled',
    lost: 'lost',
    damaged: 'damaged',
  };
  return map[v] ?? 'unknown';
}

function formatPartnerCodeLabel(code: string): string {
  const c = code.trim().toLowerCase();
  if (!c) {
    return '—';
  }
  return c
    .split(/[-_]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function pickPartnerName(s: ShipmentRecord): {
  name: string;
  logo: string | null;
} {
  const spSnake = s.shipping_partner_seller?.shipping_partner;
  const spCamel = s.shippingPartnerSeller?.shippingPartner;
  const p1 = spSnake ?? spCamel;
  if (p1?.name?.trim()) {
    return { name: p1.name.trim(), logo: p1.logo_url?.trim() || null };
  }
  const wSnake =
    s.shipping_partner_warehouse?.shipping_partner_config?.shipping_partner;
  const wCamel =
    s.shippingPartnerWarehouse?.shippingPartnerConfig?.shippingPartner;
  const p2 = wSnake ?? wCamel;
  if (p2?.name?.trim()) {
    return { name: p2.name.trim(), logo: p2.logo_url?.trim() || null };
  }
  const rawCode = s.shipping_partner_code ?? s.shippingPartnerCode;
  if (typeof rawCode === 'string' && rawCode.trim()) {
    return { name: formatPartnerCodeLabel(rawCode), logo: null };
  }
  return { name: 'Kho tự ship', logo: null };
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max - 1)}…`;
}

export function shipmentToListRow(s: ShipmentRecord): ShipmentListRow {
  const so = pickSaleOrder(s);
  const decimals = so?.currency?.decimal_places ?? 0;
  const partner = pickPartnerName(s);
  const addr = s.recipient_address?.trim() ?? '';
  return {
    key: String(s.uuid ?? s.id),
    orderNumber: so?.order_number?.trim() ?? '—',
    partnerName: partner.name,
    partnerLogoUrl: partner.logo,
    status: mapShipmentRowStatus(s.status),
    recipientName: s.recipient_name?.trim() || '—',
    recipientPhone: s.recipient_phone?.trim() || '—',
    recipientAddressShort: addr ? truncate(addr, 42) : '—',
    codDisplay: formatMoneyFromApi(s.cod_amount ?? null, decimals),
    feeDisplay: formatMoneyFromApi(s.shipping_fee ?? null, decimals),
    createdAtDisplay: formatDateVi(s.created_at),
  };
}