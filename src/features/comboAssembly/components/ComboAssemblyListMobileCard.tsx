import React from 'react';
import { OpsOrderListMobileCard } from '@shared/components/ui/listMobileCard/OpsOrderListMobileCard';
import type {
  ComboAssemblyListRow,
  ComboAssemblyRowStatus,
} from '../comboAssemblyTypes';
import type { StatusPillTone } from '@shared/components/ui/StatusPill';

function statusTone(s: ComboAssemblyRowStatus): StatusPillTone {
  if (s === 'completed') {
    return 'success';
  }
  if (s === 'requested') {
    return 'warning';
  }
  if (s === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

export type ComboAssemblyListMobileCardProps = {
  row: ComboAssemblyListRow;
  onPress?: () => void;
};

function ComboAssemblyListMobileCardImpl({
  row,
  onPress,
}: ComboAssemblyListMobileCardProps) {
  const completer =
    row.completerName !== '—' ? ` · HT: ${row.completerName}` : '';

  return (
    <OpsOrderListMobileCard
      orderNumber={row.assemblyNumber}
      statusLabel={row.statusLabel}
      statusTone={statusTone(row.rowStatus)}
      placeholderIcon="layers"
      productThumb={row.productThumb}
      productLabel={row.productName}
      metaLine={`SKU ${row.sku} · ${row.warehouseName} · SL ${row.quantityLabel}`}
      progressLine={`${row.pickStrategy} · ${row.requesterName}${completer}`}
      footerSecondary={row.createdAtLabel}
      onPress={onPress}
    />
  );
}

export const ComboAssemblyListMobileCard = React.memo(ComboAssemblyListMobileCardImpl);
