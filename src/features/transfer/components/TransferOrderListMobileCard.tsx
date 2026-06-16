import React from 'react';
import { OpsOrderListMobileCard } from '@shared/components/ui/listMobileCard/OpsOrderListMobileCard';
import type {
  TransferOrderListRow,
  TransferOrderRowStatus,
} from '../transferOrderTypes';
import type { StatusPillTone } from '@shared/components/ui/StatusPill';

function statusTone(s: TransferOrderRowStatus): StatusPillTone {
  if (s === 'completed') {
    return 'success';
  }
  if (s === 'in_transit') {
    return 'info';
  }
  if (s === 'receiving') {
    return 'warning';
  }
  if (s === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

export type TransferOrderListMobileCardProps = {
  row: TransferOrderListRow;
  onPress?: () => void;
};

function TransferOrderListMobileCardImpl({
  row,
  onPress,
}: TransferOrderListMobileCardProps) {
  return (
    <OpsOrderListMobileCard
      orderNumber={row.orderNumber}
      statusLabel={row.statusLabel}
      statusTone={statusTone(row.rowStatus)}
      placeholderIcon="compare"
      productThumb={row.productThumb}
      productLabel={row.productLabel}
      metaLine={`${row.routeLabel} · ${row.creatorName} · ${row.driverLine}`}
      progressLine={`${row.scanProgressLabel} · ${row.qtyWeightLabel}`}
      footerSecondary={row.createdAtLabel}
      onPress={onPress}
    />
  );
}

export const TransferOrderListMobileCard = React.memo(TransferOrderListMobileCardImpl);
