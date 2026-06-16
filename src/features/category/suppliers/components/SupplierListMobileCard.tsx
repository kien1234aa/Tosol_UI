import React, { useMemo } from 'react';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import type { SupplierListRow } from '../supplierTypes';

export type SupplierListMobileCardProps = {
  row: SupplierListRow;
  onView?: () => void;
  onDelete?: () => void;
};

function SupplierListMobileCardImpl({
  row,
  onView,
}: SupplierListMobileCardProps) {
  const hasCode = row.codeLabel.length > 0;
  const title = hasCode ? row.codeLabel : row.name;
  const subtitle = hasCode ? row.name : undefined;

  const titleRight = useMemo(
    () => (
      <StatusPill
        tone={row.status === 'active' ? 'success' : 'neutral'}
        emphasized={false}
        compact
      >
        {row.status === 'active' ? 'Hoạt động' : 'Ngưng'}
      </StatusPill>
    ),
    [row.status],
  );

  return (
    <CompactListMobileCard
      title={title}
      titleRight={titleRight}
      subtitle={subtitle}
      detail={row.contactLabel ?? undefined}
      footerLeft={`${row.purchaseOrdersCount.toLocaleString('vi-VN')} đơn mua`}
      footerRight={row.createdLabel}
      onPress={onView}
    />
  );
}

export const SupplierListMobileCard = React.memo(SupplierListMobileCardImpl);
