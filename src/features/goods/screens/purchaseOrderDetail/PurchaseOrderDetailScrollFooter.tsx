import React, { useMemo } from 'react';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { CanvasDetailQuickDock, type CanvasDetailQuickDockAction } from '@shared/components/ui/canvasDetail/CanvasDetailQuickDock';
import type { PurchaseOrderApi } from '@services/warehouse/purchaseOrderApiTypes';
import type { PurchaseOrderListRow } from '../../purchase/purchaseTypes';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { formatMoneyFromApi } from '../../../sales/screens/orderDetail/orderDetailFormatters';

export type PurchaseOrderDetailOverviewSectionProps = {
  po: PurchaseOrderApi;
  decimals: number;
  itemCount: number;
  totalQtyLabel: string;
  listRow?: PurchaseOrderListRow | null;
};

export function PurchaseOrderDetailOverviewSection({
  po,
  decimals,
  itemCount,
  totalQtyLabel,
  listRow,
}: PurchaseOrderDetailOverviewSectionProps) {
  return (
    <CanvasDetailOverviewPanel
      metrics={[
        {
          label: 'Tổng tiền',
          value: formatMoneyFromApi(po.total ?? null, decimals),
          icon: 'cash',
        },
        { label: 'Số lượng', value: totalQtyLabel, icon: 'cube' },
      ]}
      timeline={{
        label: 'Sản phẩm',
        value: `${itemCount} dòng`,
        hint:
          listRow != null
            ? `${listRow.progressPct}% đã nhận`
            : undefined,
      }}
      progress={
        listRow != null
          ? {
              title: 'TIẾN ĐỘ NHẬN KHO',
              items: [
                { label: 'Hoàn thành', percent: listRow.progressPct },
              ],
            }
          : undefined
      }
      title="Tổng quan đơn mua"
      icon="clipboard"
    >
      <DetailRow label="Tổng sản phẩm" value={`${itemCount} sản phẩm`} />
      <DetailRow label="Tổng số lượng" value={totalQtyLabel} last />
    </CanvasDetailOverviewPanel>
  );
}

export type PurchaseOrderDetailQuickDockProps = {
  canCancelPurchaseOrder?: boolean;
  onEditPress?: () => void;
  onQuickActionPress?: (key: string) => void;
};

export function PurchaseOrderDetailQuickDock({
  canCancelPurchaseOrder = true,
  onEditPress,
  onQuickActionPress,
}: PurchaseOrderDetailQuickDockProps) {
  const actions = useMemo((): CanvasDetailQuickDockAction[] => {
    const list: CanvasDetailQuickDockAction[] = [
      {
        key: 'edit',
        label: onEditPress ? 'Sửa đơn mua' : 'Sửa',
        icon: 'pencil',
        variant: 'primary',
        disabled: !onEditPress,
        onPress: () => onEditPress?.(),
      },
    ];
    if (canCancelPurchaseOrder) {
      list.push({
        key: 'cancel_po',
        label: 'Hủy',
        icon: 'close',
        tone: 'danger',
        onPress: () => onQuickActionPress?.('cancel_po'),
      });
    }
    return list;
  }, [canCancelPurchaseOrder, onEditPress, onQuickActionPress]);

  return <CanvasDetailQuickDock actions={actions} />;
}
