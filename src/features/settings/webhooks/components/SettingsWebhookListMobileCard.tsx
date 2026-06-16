import React, { useMemo } from 'react';
import { CatalogListMobileCard } from '@shared/components/ui/listMobileCard/CatalogListMobileCard';
import { StatusPill } from '@shared/components/ui/StatusPill';
import type { SellerWebhookApi } from '@services/settings/webhookApiTypes';

export type SettingsWebhookListMobileCardProps = {
  row: SellerWebhookApi;
  onEdit?: () => void;
  onDelete?: () => void;
};

function SettingsWebhookListMobileCardImpl({
  row,
  onEdit,
  onDelete,
}: SettingsWebhookListMobileCardProps) {
  const events =
    row.events_label != null && row.events_label.length > 0
      ? row.events_label
      : undefined;

  const statusPill = useMemo(
    () => (
      <StatusPill
        tone={row.is_active ? 'success' : 'neutral'}
        emphasized={false}
        compact
      >
        {row.is_active ? 'Bật' : 'Tắt'}
      </StatusPill>
    ),
    [row.is_active],
  );

  return (
    <CatalogListMobileCard
      title={row.url}
      icon="globe"
      statusPill={statusPill}
      metaLines={[events, row.description?.trim() || undefined].filter(
        (x): x is string => x != null && x.length > 0,
      )}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

export const SettingsWebhookListMobileCard = React.memo(SettingsWebhookListMobileCardImpl);
