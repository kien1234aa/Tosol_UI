import React, { useMemo } from 'react';
import {
  StatusPill,
  type StatusPillTone,
} from '@shared/components/ui/StatusPill';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import { ListCardThumb } from '@shared/components/ui/listMobileCard/ListCardThumb';
import type { ShipmentListRow, ShipmentRowStatus } from '../shipmentListTypes';

function statusTone(s: ShipmentRowStatus): StatusPillTone {
  if (s === 'delivered' || s === 'returned') {
    return 'success';
  }
  if (
    s === 'failed_delivery' ||
    s === 'cancelled' ||
    s === 'lost' ||
    s === 'damaged'
  ) {
    return 'danger';
  }
  if (
    s === 'in_transit' ||
    s === 'out_for_delivery' ||
    s === 'delivering' ||
    s === 'returning'
  ) {
    return 'warning';
  }
  return 'info';
}

function statusLabel(s: ShipmentRowStatus): string {
  const m: Record<ShipmentRowStatus, string> = {
    pending: 'Chờ xử lý',
    created: 'Đã tạo',
    picking: 'Lấy hàng',
    in_transit: 'Đang VC',
    out_for_delivery: 'Đang giao',
    delivering: 'Đang giao',
    delivered: 'Đã giao',
    failed_delivery: 'Giao lỗi',
    returning: 'Đang hoàn',
    returned: 'Đã hoàn',
    cancelled: 'Hủy',
    lost: 'Thất lạc',
    damaged: 'Hư',
    unknown: '—',
  };
  return m[s];
}

export type ShipmentListMobileCardProps = {
  row: ShipmentListRow;
  onPress?: () => void;
};

function ShipmentListMobileCardImpl({
  row,
  onPress,
}: ShipmentListMobileCardProps) {
  const titleRight = useMemo(
    () => (
      <StatusPill tone={statusTone(row.status)} emphasized compact>
        {statusLabel(row.status)}
      </StatusPill>
    ),
    [row.status],
  );

  const leading = useMemo(
    () => (
      <ListCardThumb
        uri={row.partnerLogoUrl}
        icon="truck"
        imageResizeMode="contain"
      />
    ),
    [row.partnerLogoUrl],
  );

  const subtitle =
    row.recipientName && row.recipientName !== '—'
      ? `${row.partnerName} · ${row.recipientName}`
      : row.partnerName;

  const detail =
    row.recipientAddressShort && row.recipientAddressShort !== '—'
      ? row.recipientAddressShort
      : undefined;

  const footerLeft =
    row.codDisplay && row.codDisplay !== '—'
      ? `COD ${row.codDisplay}`
      : undefined;

  const footerRight =
    row.createdAtDisplay && row.createdAtDisplay !== '—'
      ? row.createdAtDisplay
      : undefined;

  return (
    <CompactListMobileCard
      title={row.orderNumber}
      titleRight={titleRight}
      leading={leading}
      subtitle={subtitle}
      detail={detail}
      footerLeft={footerLeft}
      footerLeftAccent={footerLeft != null}
      footerRight={footerRight}
      onPress={onPress}
    />
  );
}

export const ShipmentListMobileCard = React.memo(ShipmentListMobileCardImpl);
