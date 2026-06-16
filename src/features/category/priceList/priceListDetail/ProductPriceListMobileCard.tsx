import React, { useMemo } from 'react';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import { ListCardThumb } from '@shared/components/ui/listMobileCard/ListCardThumb';
import { StatusPill } from '@shared/components/ui/StatusPill';
import type { ProductPriceListRow } from './productPriceListTypes';

export type ProductPriceListMobileCardProps = {
  row: ProductPriceListRow;
  onPress?: () => void;
};

function ProductPriceListMobileCardImpl({
  row,
  onPress,
}: ProductPriceListMobileCardProps) {
  const title = row.productSku ?? row.productName ?? `#${row.productId}`;
  const subtitle =
    row.productSku && row.productName ? row.productName : undefined;

  const detail = useMemo(() => {
    const parts = [row.minQuantityLabel].filter(
      (p): p is string => p != null && p.length > 0,
    );
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }, [row.minQuantityLabel]);

  const leading = useMemo(
    () => <ListCardThumb uri={row.thumbUrl} icon="cube" />,
    [row.thumbUrl],
  );

  const titleRight = useMemo(
    () =>
      !row.isActive ? (
        <StatusPill tone="neutral" emphasized={false} compact>
          Tắt
        </StatusPill>
      ) : null,
    [row.isActive],
  );

  return (
    <CompactListMobileCard
      title={title}
      titleRight={titleRight}
      leading={leading}
      subtitle={subtitle}
      detail={detail}
      footerRight={row.priceDisplay ?? undefined}
      footerRightAccent={row.priceDisplay != null}
      onPress={onPress}
    />
  );
}

export const ProductPriceListMobileCard = React.memo(
  ProductPriceListMobileCardImpl,
);
