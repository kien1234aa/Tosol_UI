import React, { useMemo } from 'react';
import { CatalogListMobileCard } from '@shared/components/ui/listMobileCard/CatalogListMobileCard';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { formatDateTimeVi } from '../../../sales/screens/orderDetail/orderDetailFormatters';
import type { ShopListItem } from '@services/settings/shopResponseTypes';
import { platformDisplayLabel } from '../shopDirectoryLabels';

export type SettingsShopListMobileCardProps = {
  row: ShopListItem;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

function SettingsShopListMobileCardImpl({
  row,
  onView,
  onEdit,
  onDelete,
}: SettingsShopListMobileCardProps) {
  const active = row.is_active === true;
  const lastSync =
    row.last_sync_at != null && row.last_sync_at.length > 0
      ? formatDateTimeVi(row.last_sync_at)
      : 'Chưa đồng bộ';

  const statusPill = useMemo(
    () => (
      <StatusPill tone={active ? 'success' : 'neutral'} emphasized={false} compact>
        {active ? 'Hoạt động' : 'Tắt'}
      </StatusPill>
    ),
    [active],
  );

  return (
    <CatalogListMobileCard
      title={row.name}
      icon="store"
      statusPill={statusPill}
      metaLines={[
        `${platformDisplayLabel(row.platform)}${row.platform_shop_id ? ` · ${row.platform_shop_id}` : ''}`,
        `ĐB ${row.auto_sync ? 'bật' : 'tắt'} · ${lastSync}`,
      ]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

export const SettingsShopListMobileCard = React.memo(SettingsShopListMobileCardImpl);
