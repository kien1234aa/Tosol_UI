import React, { useMemo } from 'react';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import { ListCardThumb } from '@shared/components/ui/listMobileCard/ListCardThumb';
import { joinShopProductMappingMetaLine } from '@mappers/settings/productShopMappingMappers';
import type { ShopProductMappingListRow } from './shopProductMappingTypes';

export type ShopProductMappingListMobileCardProps = {
  row: ShopProductMappingListRow;
  onPress?: () => void;
};

function ShopProductMappingListMobileCardImpl({
  row,
  onPress,
}: ShopProductMappingListMobileCardProps) {
  const title = row.productSku ?? row.productName ?? `#${row.productId}`;
  const subtitle = row.productSku && row.productName ? row.productName : undefined;

  const metaLine = useMemo(
    () =>
      joinShopProductMappingMetaLine([
        row.platformProductId
          ? `SP ${row.platformProductId}`
          : null,
        row.platformSku ? `SKU sàn ${row.platformSku}` : null,
        row.syncStatusLabel,
      ]) ?? undefined,
    [
      row.platformProductId,
      row.platformSku,
      row.syncStatusLabel,
    ],
  );

  const leading = useMemo(
    () => <ListCardThumb uri={row.thumbUrl} icon="cube" />,
    [row.thumbUrl],
  );

  return (
    <CompactListMobileCard
      title={title}
      leading={leading}
      subtitle={subtitle}
      detail={metaLine}
      footerRight={row.lastSyncedDisplay ?? undefined}
      onPress={onPress}
    />
  );
}

export const ShopProductMappingListMobileCard = React.memo(
  ShopProductMappingListMobileCardImpl,
);
