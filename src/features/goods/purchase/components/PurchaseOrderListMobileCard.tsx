import React, { useMemo } from 'react';
import { BRAND_HEX } from '@shared/theme/designTokens';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { OpsOrderListMobileCard } from '@shared/components/ui/listMobileCard/OpsOrderListMobileCard';
import { joinPurchaseMetaLine } from '@mappers/warehouse/purchaseMappers';
import type {
  PurchaseOrderListRow,
  PurchaseOrderRowStatus,
} from '../purchaseTypes';
import type { StatusPillTone } from '@shared/components/ui/StatusPill';

function statusTone(s: PurchaseOrderRowStatus): StatusPillTone {
  if (s === 'received') {
    return 'success';
  }
  if (s === 'partial') {
    return 'warning';
  }
  if (s === 'confirmed') {
    return 'info';
  }
  if (s === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

export type PurchaseOrderListMobileCardProps = {
  row: PurchaseOrderListRow;
  /** Ghi đè dòng meta (vd. chỉ hiện kho trên màn chi tiết NCC). */
  metaLine?: string;
  onPress?: () => void;
};

function PurchaseOrderListMobileCardImpl({
  row,
  metaLine,
  onPress,
}: PurchaseOrderListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const moneyColor = mode === 'dark' ? c.textLink : BRAND_HEX;

  const resolvedMeta = useMemo(
    () =>
      metaLine ??
      joinPurchaseMetaLine([row.supplierName, row.warehouseName]) ??
      undefined,
    [metaLine, row.supplierName, row.warehouseName],
  );

  const progressLine = useMemo(() => {
    if (row.expectedQty <= 0 && row.receivedQty <= 0) {
      return undefined;
    }
    return `Nhận ${row.receivedQty}/${row.expectedQty} (${row.progressPct}%)`;
  }, [row.expectedQty, row.receivedQty, row.progressPct]);

  return (
    <OpsOrderListMobileCard
      orderNumber={row.orderNumber}
      statusLabel={row.statusLabel}
      statusTone={statusTone(row.rowStatus)}
      placeholderIcon="package"
      productThumb={row.productThumb}
      productLabel={row.productLabel ?? undefined}
      productSecondLabel={row.productSecondLabel}
      moreProductsCount={row.moreProductsCount}
      metaLine={resolvedMeta}
      progressLine={progressLine}
      footerPrimary={row.totalLabel ?? undefined}
      footerPrimaryColor={moneyColor}
      footerSecondary={row.expectedDateLabel ?? undefined}
      onPress={onPress}
    />
  );
}

export const PurchaseOrderListMobileCard = React.memo(PurchaseOrderListMobileCardImpl);
