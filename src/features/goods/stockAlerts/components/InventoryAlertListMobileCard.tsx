import React, { useCallback, useMemo } from 'react';
import { CatalogListMobileCard } from '@shared/components/ui/listMobileCard/CatalogListMobileCard';
import { StatusPill } from '@shared/components/ui/StatusPill';
import type { InventoryAlertListItemApi } from '@services/warehouse/inventoryAlertsApiTypes';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  alertTypeToPillTone,
  inventoryAlertSeverityLabelVi,
  inventoryAlertTypeLabelVi,
  severityToPillTone,
} from '../inventoryAlertLabels';

export type InventoryAlertListMobileCardProps = {
  row: InventoryAlertListItemApi;
  onViewProduct?: (productId: number) => void;
};

function InventoryAlertListMobileCardImpl({
  row,
  onViewProduct,
}: InventoryAlertListMobileCardProps) {
  const th = row.low_stock_threshold;
  const avail = row.available_quantity;

  const onPress = useCallback(() => {
    if (onViewProduct != null) {
      onViewProduct(row.product.id);
      return;
    }
    toast.info(`SKU: ${row.product.sku}\nKD: ${avail}`);
  }, [avail, onViewProduct, row.product.id, row.product.sku]);

  const statusPill = useMemo(
    () => (
      <>
        <StatusPill
          tone={severityToPillTone(row.alert_severity)}
          emphasized={false}
          compact
        >
          {inventoryAlertSeverityLabelVi(row.alert_severity)}
        </StatusPill>
        {row.alert_types[0] != null ? (
          <StatusPill
            tone={alertTypeToPillTone(row.alert_types[0])}
            emphasized={false}
            compact
          >
            {inventoryAlertTypeLabelVi(row.alert_types[0])}
          </StatusPill>
        ) : null}
      </>
    ),
    [row.alert_severity, row.alert_types],
  );

  return (
    <CatalogListMobileCard
      title={row.product.name}
      icon="warning"
      statusPill={statusPill}
      metaLines={[
        `${row.product.sku} · ${row.warehouse.name}`,
        `KD ${avail}${th != null ? ` / ngưỡng ${th}` : ''}`,
      ]}
      onPress={onPress}
    />
  );
}

export const InventoryAlertListMobileCard = React.memo(InventoryAlertListMobileCardImpl);
