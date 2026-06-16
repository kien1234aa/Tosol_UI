import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { CanvasDetailQuickDock, type CanvasDetailQuickDockAction } from '@shared/components/ui/canvasDetail/CanvasDetailQuickDock';
import type { SaleOrder } from '@services/sales/saleOrderApiTypes';
import { DetailRow } from './OrderDetailPrimitives';
import { formatMoneyFromApi, formatOrderDateVi } from './orderDetailFormatters';
import { orderStatusStepIndex } from './orderDetailFormatters';
import { getQuickActionsForOrderStatus } from './orderDetailQuickActions';
import { mapApiPaymentStatus } from '@mappers/sales/orderMappers';

export type OrderDetailOverviewSectionProps = {
  order: SaleOrder;
  decimals: number;
};

export function OrderDetailOverviewSection({
  order,
  decimals,
}: OrderDetailOverviewSectionProps) {
  const { t } = useTranslation();
  const dash = t('common.dash');

  const progressItems = useMemo(() => {
    const cur = orderStatusStepIndex(order.status);
    const keys = [
      'orders.historyMilestone.created',
      'orders.historyMilestone.confirmed',
      'orders.historyMilestone.packed',
    ] as const;
    return keys.map((key, i) => {
      let percent = 0;
      if (cur >= 0) {
        if (i < cur) {
          percent = 100;
        } else if (i === cur) {
          percent = 55;
        }
      }
      return { label: t(key), percent };
    });
  }, [order.status, t]);

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        {
          label: t('orders.overviewTotal'),
          value: formatMoneyFromApi(order.total, decimals),
          icon: 'cash',
        },
        {
          label: t('orders.overviewCod'),
          value:
            order.cod_amount != null && order.cod_amount !== ''
              ? formatMoneyFromApi(order.cod_amount, decimals)
              : dash,
          icon: 'wallet',
        },
      ]}
      timeline={{
        label: t('orders.overviewOrderDate'),
        value: formatOrderDateVi(order.order_date),
        hint: order.shop?.name?.trim() || undefined,
      }}
      progress={{
        title: 'TIẾN ĐỘ XỬ LÝ',
        items: progressItems,
      }}
      title="CHI TIẾT ĐƠN"
      icon="document"
    >
      <DetailRow
        label={t('orders.overviewCustomer')}
        value={order.customer?.name ?? dash}
      />
      <DetailRow
        label={t('orders.overviewPhone')}
        value={order.customer?.phone?.trim() || dash}
      />
      <DetailRow
        label={t('orders.overviewCreator')}
        value={order.creator?.name ?? dash}
      />
      <DetailRow
        label={t('orders.overviewSubtotal')}
        value={
          order.subtotal != null && order.subtotal !== ''
            ? formatMoneyFromApi(order.subtotal, decimals)
            : dash
        }
      />
      <DetailRow
        label={t('orders.overviewShipping')}
        value={
          order.shipping_fee != null && order.shipping_fee !== ''
            ? formatMoneyFromApi(order.shipping_fee, decimals)
            : order.shipment?.shipping_fee
              ? formatMoneyFromApi(order.shipment.shipping_fee, decimals)
              : dash
        }
      />
      <DetailRow
        label={t('orders.overviewTotal')}
        value={formatMoneyFromApi(order.total, decimals)}
        last
      />
    </CanvasDetailOverviewPanel>
  );
}

export type OrderDetailQuickDockProps = {
  order: SaleOrder;
  onQuickActionPress?: (key: string) => void;
};

export function OrderDetailQuickDock({
  order,
  onQuickActionPress,
}: OrderDetailQuickDockProps) {
  const { t } = useTranslation();

  const actions = useMemo((): CanvasDetailQuickDockAction[] => {
    const isPaid = mapApiPaymentStatus(order.payment_status) === 'paid';
    const quick = getQuickActionsForOrderStatus(
      order.status,
      order.has_issue === true,
      isPaid,
    );
    return quick.map((a, i) => ({
      key: a.key,
      label: t(a.labelKey, { defaultValue: a.labelKey }),
      icon: a.icon,
      tone: a.tone,
      variant: i === 0 ? 'primary' : 'secondary',
    }));
  }, [order.has_issue, order.status, order.payment_status, t]);

  return (
    <CanvasDetailQuickDock
      title={t('orders.quickDockTitle')}
      actions={actions}
      onActionPress={onQuickActionPress}
    />
  );
}
