import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { StatusPillTone } from '@shared/components/ui/StatusPill';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { CompactListMobileCard } from '@shared/components/ui/listMobileCard/CompactListMobileCard';
import { ListCardThumb } from '@shared/components/ui/listMobileCard/ListCardThumb';
import type {
  OrderListRow,
  OrderPaymentStatus,
  OrderRowStatus,
} from '../orderTypes';

function orderStatusTone(status: OrderRowStatus): StatusPillTone {
  if (status === 'pending') {
    return 'warning';
  }
  if (status === 'cancelled' || status === 'transfer_failed') {
    return 'danger';
  }
  if (status === 'delivered') {
    return 'success';
  }
  if (status === 'returned' || status === 'partially_returned') {
    return 'neutral';
  }
  return 'info';
}

export type OrderListMobileCardProps = {
  row: OrderListRow;
  /** Ghi đè footer trái (vd. cửa hàng · kho trên màn chi tiết khách). */
  footerLeft?: string;
  onPress?: () => void;
};

function OrderListMobileCardImpl({
  row,
  footerLeft,
  onPress,
}: OrderListMobileCardProps) {
  const { t } = useTranslation();

  const orderStatusText = useMemo(
    () => t(`orders.pill.row.${row.status}`, { defaultValue: row.status }),
    [row.status, t],
  );

  const { subtitle, subtitleSecondary } = useMemo(() => {
    const count = row.itemCount;
    if (count > 2) {
      return {
        subtitle: row.productName,
        subtitleSecondary: t('orders.list.moreProducts', { count }),
      };
    }
    if (count === 2) {
      return {
        subtitle: row.productName,
        subtitleSecondary: row.secondProduct?.name,
      };
    }
    return {
      subtitle: row.productName,
      subtitleSecondary: undefined,
    };
  }, [
    row.itemCount,
    row.productName,
    row.secondProduct?.name,
    t,
  ]);

  const titleRight = useMemo(
    () => (
      <StatusPill tone={orderStatusTone(row.status)} emphasized compact>
        {orderStatusText}
      </StatusPill>
    ),
    [row.status, orderStatusText],
  );
  const leading = useMemo(() => <ListCardThumb uri={row.thumbUrl} />, [row.thumbUrl]);

  return (
    <CompactListMobileCard
      title={row.id}
      titleRight={titleRight}
      leading={leading}
      subtitle={subtitle}
      subtitleSecondary={subtitleSecondary}
      footerLeft={footerLeft ?? row.customerName}
      footerRight={row.totalAmount}
      footerRightAccent
      onPress={onPress}
    />
  );
}

export const OrderListMobileCard = React.memo(OrderListMobileCardImpl);
