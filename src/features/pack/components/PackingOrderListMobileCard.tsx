import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { OpsOrderListMobileCard } from '@shared/components/ui/listMobileCard/OpsOrderListMobileCard';
import type {
  PackingOrderListRow,
  PackingOrderRowStatus,
} from '../packingTypes';
import type { StatusPillTone } from '@shared/components/ui/StatusPill';

function statusTone(s: PackingOrderRowStatus): StatusPillTone {
  if (s === 'completed') {
    return 'success';
  }
  if (s === 'packing') {
    return 'info';
  }
  if (s === 'pending') {
    return 'warning';
  }
  if (s === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

export type PackingOrderListMobileCardProps = {
  row: PackingOrderListRow;
  onPress?: () => void;
};

function PackingOrderListMobileCardImpl({
  row,
  onPress,
}: PackingOrderListMobileCardProps) {
  const headerExtra = useMemo(
    () =>
      row.hasPendingUnpack ? (
        <StatusPill tone="warning" emphasized={false} compact>
          <Text>{'Mở hộp'}</Text>
        </StatusPill>
      ) : undefined,
    [row.hasPendingUnpack],
  );

  return (
    <OpsOrderListMobileCard
      orderNumber={row.orderNumber}
      statusLabel={row.statusLabel}
      statusTone={statusTone(row.rowStatus)}
      headerExtra={headerExtra}
      placeholderIcon="package"
      productThumb={row.productThumb}
      productLabel={row.productLabel}
      productSecondLabel={row.productSecondLabel}
      moreProductsCount={row.moreProductsCount}
      metaLine={`Đơn ${row.saleOrderNumber} · ${row.warehouseName} · ${row.sellerName}`}
      progressLine={`Lấy ${row.pickProgressPct}% · Đóng ${row.packingProgressPct}% · ${row.boxesPackedLabel}`}
      footerSecondary={row.createdAtLabel}
      onPress={onPress}
    />
  );
}

export const PackingOrderListMobileCard = React.memo(PackingOrderListMobileCardImpl);
