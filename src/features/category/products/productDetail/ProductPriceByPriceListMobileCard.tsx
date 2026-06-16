import React, { useMemo } from 'react';
import { View } from 'react-native';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import { StatusPill } from '@shared/components/ui/StatusPill';
import type { ProductPriceByPriceListRow } from './productPriceByPriceListTypes';

export type ProductPriceByPriceListMobileCardProps = {
  row: ProductPriceByPriceListRow;
  onPress?: () => void;
};

function ProductPriceByPriceListMobileCardImpl({
  row,
  onPress,
}: ProductPriceByPriceListMobileCardProps) {
  const title =
    row.priceListName ?? row.priceListCode ?? `Bảng giá #${row.priceListId}`;
  const subtitle =
    row.priceListCode && row.priceListName ? row.priceListCode : undefined;

  const detail = useMemo(() => {
    const parts = [
      row.currencyCode,
      row.minQuantityLabel,
    ].filter((p): p is string => p != null && p.length > 0);
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }, [row.currencyCode, row.minQuantityLabel]);

  const titleRight = useMemo(() => {
    const pills: React.ReactNode[] = [];
    if (row.isDefaultPriceList) {
      pills.push(
        <StatusPill key="default" tone="info" emphasized={false} compact>
          Mặc định
        </StatusPill>,
      );
    }
    if (!row.isActive || !row.priceListActive) {
      pills.push(
        <StatusPill key="off" tone="neutral" emphasized={false} compact>
          Tắt
        </StatusPill>,
      );
    }
    if (pills.length === 0) {
      return null;
    }
    return (
      <View style={{ flexDirection: 'row', gap: 4, flexShrink: 0 }}>
        {pills}
      </View>
    );
  }, [row.isActive, row.isDefaultPriceList, row.priceListActive]);

  return (
    <CompactListMobileCard
      title={title}
      titleRight={titleRight}
      subtitle={subtitle}
      detail={detail}
      footerRight={row.priceDisplay ?? undefined}
      footerRightAccent={row.priceDisplay != null}
      onPress={onPress}
    />
  );
}

export const ProductPriceByPriceListMobileCard = React.memo(
  ProductPriceByPriceListMobileCardImpl,
);
