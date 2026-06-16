import React, { useMemo } from 'react';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import type { PriceListRow } from '../priceListTypes';

export type PriceListMobileCardProps = {
  row: PriceListRow;
  onView?: () => void;
};

function PriceListMobileCardImpl({ row, onView }: PriceListMobileCardProps) {
  const meta = `${row.currencyCode}${row.isDefault ? ' · Mặc định' : ''}`;

  const titleRight = useMemo(
    () => (
      <StatusPill
        tone={row.status === 'active' ? 'success' : 'neutral'}
        emphasized={false}
        compact
      >
        {row.status === 'active' ? 'Đang áp dụng' : 'Ngưng'}
      </StatusPill>
    ),
    [row.status],
  );

  return (
    <CompactListMobileCard
      title={row.code}
      titleRight={titleRight}
      subtitle={row.name}
      detail={meta}
      footerRight={row.validityLabel ?? undefined}
      onPress={onView}
    />
  );
}

export const PriceListMobileCard = React.memo(PriceListMobileCardImpl);
