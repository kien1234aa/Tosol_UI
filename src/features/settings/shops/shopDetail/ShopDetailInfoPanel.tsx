import React from 'react';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import type { ShopDetailApi } from '@services/settings/shopResponseTypes';
import {
  currencyLabelFromId,
  defaultPriceListLabel,
  paymentMethodDisplay,
  pickStrategyDisplay,
} from '../shopDirectoryLabels';
import { useShopDefaultRefLabels } from './useShopDefaultRefLabels';

function fmtDateVi(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('vi-VN');
}

export type ShopDetailInfoPanelProps = {
  shop: ShopDetailApi;
  reloadSignal?: number;
};

export function ShopDetailInfoPanel({
  shop,
  reloadSignal = 0,
}: ShopDetailInfoPanelProps) {
  const { bankLabel, carrierLabel, loading } = useShopDefaultRefLabels(
    shop.seller_id,
    shop.default_bank_account_id,
    shop.default_shipping_partner_seller_id,
    reloadSignal,
  );

  const seller = shop.seller;
  const sellerName = seller?.name?.trim() || '—';
  const sellerCode = seller?.code?.trim();
  const sellerDisplay = sellerCode
    ? `${sellerName} (${sellerCode})`
    : sellerName;

  const bankDisplay =
    shop.default_bank_account_id == null
      ? 'Chưa thiết lập'
      : bankLabel ??
        (loading ? 'Đang tải…' : `ID ${shop.default_bank_account_id}`);

  const carrierDisplay =
    shop.default_shipping_partner_seller_id == null
      ? 'Chưa thiết lập'
      : carrierLabel ??
        (loading
          ? 'Đang tải…'
          : `ID ${shop.default_shipping_partner_seller_id}`);

  return (
    <DetailCard title="Thông tin cửa hàng" icon="info">
      <DetailRow label="Nhà bán" value={sellerDisplay} />
      <DetailRow
        label="Chiến lược lấy hàng"
        value={pickStrategyDisplay(shop.pick_strategy)}
      />
      <DetailRow
        label="Phương thức thanh toán mặc định"
        value={paymentMethodDisplay(shop.default_payment_method)}
      />
      <DetailRow
        label="Bảng giá mặc định"
        value={defaultPriceListLabel(shop)}
      />
      <DetailRow label="Tài khoản ngân hàng mặc định" value={bankDisplay} />
      <DetailRow label="Đối tác vận chuyển mặc định" value={carrierDisplay} />
      <DetailRow label="Tiền tệ" value={currencyLabelFromId(shop.currency_id)} />
      <DetailRow label="Ngày tạo" value={fmtDateVi(shop.created_at)} />
      <DetailRow label="Ngày cập nhật" value={fmtDateVi(shop.updated_at)} />
    </DetailCard>
  );
}
