import React, { useMemo } from 'react';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import { ListCardThumb } from '@shared/components/ui/listMobileCard/ListCardThumb';
import type { ProductListRow } from '../productListTypes';

export type ProductListMobileCardProps = {
  row: ProductListRow;
  onView?: () => void;
  onDelete?: () => void;
};

function ProductListMobileCardImpl({
  row,
  onView,
}: ProductListMobileCardProps) {
  const avail = row.totalStock - row.reserved;
  const stockLine =
    row.reserved > 0
      ? `Tồn ${row.totalStock.toLocaleString('vi-VN')} · KD ${avail.toLocaleString('vi-VN')}`
      : `Tồn ${row.totalStock.toLocaleString('vi-VN')}`;

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
  const leading = useMemo(() => <ListCardThumb uri={row.thumbUrl} />, [row.thumbUrl]);

  return (
    <CompactListMobileCard
      title={row.sku}
      titleRight={titleRight}
      leading={leading}
      subtitle={row.name}
      footerLeft={row.priceDisplay}
      footerLeftAccent
      footerRight={stockLine}
      onPress={onView}
    />
  );
}

export const ProductListMobileCard = React.memo(ProductListMobileCardImpl);
