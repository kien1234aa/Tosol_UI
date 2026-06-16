import React from 'react';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import type { CustomerListRow } from '../customerListTypes';

export type CustomerListMobileCardProps = {
  row: CustomerListRow;
  onView?: () => void;
  onDelete?: () => void;
};

function CustomerListMobileCardImpl({
  row,
  onView,
}: CustomerListMobileCardProps) {
  const footerLeft =
    row.ordersCount > 0
      ? `${row.ordersCount.toLocaleString('vi-VN')} đơn`
      : undefined;

  return (
    <CompactListMobileCard
      title={row.name}
      subtitle={row.contactLabel ?? undefined}
      detail={row.addressLabel ?? undefined}
      footerLeft={footerLeft}
      footerRight={row.createdLabel ?? undefined}
      onPress={onView}
    />
  );
}

export const CustomerListMobileCard = React.memo(CustomerListMobileCardImpl);
