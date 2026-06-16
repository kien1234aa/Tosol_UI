import type { CreateSaleOrderPayload } from '@services/sales/saleOrderApiTypes';
import type { CustomerSearchItem } from '@services/category/customerApiTypes';
import type {
  BestExpressDistrict,
  BestExpressProvince,
  BestExpressWard,
} from '@services/sales/locationApiTypes';
import type {
  SellerShippingPartnerApi,
  WarehouseShippingPartnerApi,
} from '@services/settings/shipApiTypes';
import { findBestExpressSellerPartnerRow } from '@services/settings/shipApiTypes';
import type { ShopListItem } from '@services/settings/shopResponseTypes';
import type { ShippingMode, OrderLineRow } from './createOrderUtils';

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type BuildCreateOrderPayloadInput = {
  shopId: number;
  shop: ShopListItem;
  packingWarehouseId: number;
  shippingWarehouseId: number | null;
  /** Warehouse data for the packing warehouse — needed for pickup mode address. */
  packingWarehouse: {
    address?: string | null;
    province?: string | null;
    district?: string | null;
    ward?: string | null;
  } | null;
  selectedCustomer: CustomerSearchItem;
  orderLines: OrderLineRow[];
  shippingMode: ShippingMode;
  warehouseShippingPartners: WarehouseShippingPartnerApi[];
  warehousePartnerId: number | null;
  sellerShippingPartners: SellerShippingPartnerApi[];
  provinces: BestExpressProvince[];
  provinceId: number | null;
  districts: BestExpressDistrict[];
  districtId: number | null;
  wards: BestExpressWard[];
  wardId: number | null;
  pickupWarehouseDisplay: { name: string; detail: string };
  recipientName: string;
  recipientPhone: string;
  address: string;
  shipPayer: string;
  collectCod: boolean;
  shippingFee: string;
  orderDate: Date;
  orderDiscountVnd: number;
};

/**
 * Xây dựng payload POST /sale-orders từ dữ liệu form đã được validate.
 * Ném lỗi nếu thiếu dữ liệu bắt buộc (vd. kho đóng gói không tồn tại khi giao tại kho).
 */
export function buildCreateOrderPayload(
  input: BuildCreateOrderPayloadInput,
): CreateSaleOrderPayload {
  const {
    shopId,
    shop,
    packingWarehouseId,
    shippingWarehouseId,
    packingWarehouse,
    selectedCustomer,
    orderLines,
    shippingMode,
    warehouseShippingPartners,
    warehousePartnerId,
    sellerShippingPartners,
    provinces,
    provinceId,
    districts,
    districtId,
    wards,
    wardId,
    pickupWarehouseDisplay,
    recipientName,
    recipientPhone,
    address,
    shipPayer,
    collectCod,
    shippingFee,
    orderDate,
    orderDiscountVnd,
  } = input;

  let shipping_partner_seller_id: number | undefined;
  if (shippingMode === 'warehouse') {
    const wr = warehouseShippingPartners.find(r => r.id === warehousePartnerId);
    shipping_partner_seller_id = wr?.shipping_partner_config_id;
  } else if (shippingMode === 'seller') {
    const sr = findBestExpressSellerPartnerRow(sellerShippingPartners);
    shipping_partner_seller_id = sr?.id;
  }

  const toProvinceName =
    provinces.find(p => p.id === provinceId)?.name?.trim() ?? '';
  const toDistrictName =
    districts.find(d => d.id === districtId)?.name?.trim() ?? '';
  const toWardName = wards.find(w => w.id === wardId)?.name?.trim() ?? '';

  let shipment: CreateSaleOrderPayload['shipment'];

  if (shippingMode === 'pickup') {
    if (!packingWarehouse) {
      throw new Error('Không tìm thấy kho đóng gói.');
    }
    const addrLine = [
      pickupWarehouseDisplay.name,
      pickupWarehouseDisplay.detail,
    ]
      .filter(Boolean)
      .join(' — ');
    shipment = {
      recipient_name: selectedCustomer.name?.trim() || 'Khách',
      recipient_phone: (selectedCustomer.phone ?? '').trim(),
      recipient_address:
        addrLine || (packingWarehouse.address ?? '').trim() || 'Lấy tại kho',
      recipient_province: (packingWarehouse.province ?? '').trim(),
      recipient_district: (packingWarehouse.district ?? '').trim(),
      recipient_ward: (packingWarehouse.ward ?? '').trim(),
      shipping_payer: shipPayer,
    };
  } else {
    shipment = {
      recipient_name: recipientName.trim(),
      recipient_phone: recipientPhone.trim(),
      recipient_address: address.trim(),
      recipient_province: toProvinceName,
      recipient_district: toDistrictName,
      recipient_ward: toWardName,
      shipping_payer: shipPayer,
      shipping_partner_seller_id,
    };
  }

  const order_date = toYmd(orderDate);
  const shipping_fee =
    shippingMode === 'pickup'
      ? 0
      : Math.round(Number(String(shippingFee).replace(/\D/g, '')) || 0);

  const shipWhId = shippingWarehouseId ?? packingWarehouseId;

  return {
    shop_id: shopId,
    warehouse_id: packingWarehouseId,
    shipping_warehouse_id: shipWhId,
    customer_id: selectedCustomer.id,
    currency_id: shop.currency_id,
    discount_amount: orderDiscountVnd,
    collect_cod: collectCod,
    order_date,
    items: orderLines.map(l => ({
      product_id: l.productId,
      quantity: l.quantity,
      unit_price: l.unitPrice,
      discount_percent: l.discountPercent,
      tax_rate: l.taxPercent,
    })),
    shipment,
    shipping_fee,
  };
}
