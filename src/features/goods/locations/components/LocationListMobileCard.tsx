import React, { useCallback, useMemo } from 'react';
import { CatalogListMobileCard } from '@shared/components/ui/listMobileCard/CatalogListMobileCard';
import { StatusPill } from '@shared/components/ui/StatusPill';
import type { LocationListItemApi } from '@services/warehouse/locationsApiTypes';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';

function typeLabel(type: string): string {
  const t = type.trim().toLowerCase();
  if (t === 'storage') return 'Lưu trữ';
  if (t === 'picking') return 'Picking';
  if (t === 'staging') return 'Staging';
  return type || '—';
}

function typeTone(type: string): 'info' | 'warning' | 'success' | 'neutral' {
  const t = type.trim().toLowerCase();
  if (t === 'storage') return 'info';
  if (t === 'picking') return 'warning';
  if (t === 'staging') return 'success';
  return 'neutral';
}

export type LocationListMobileCardProps = {
  row: LocationListItemApi;
};

function LocationListMobileCardImpl({ row }: LocationListMobileCardProps) {
  const w = row.warehouse;

  const onDetail = useCallback(() => {
    toast.info(
      [
        `Mã: ${row.code}`,
        `Loại: ${typeLabel(row.type)}`,
        w != null ? `Kho: ${w.name}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }, [row, w]);

  const statusPill = useMemo(
    () => (
      <StatusPill tone={typeTone(row.type)} emphasized={false} compact>
        {typeLabel(row.type)}
      </StatusPill>
    ),
    [row.type],
  );

  return (
    <CatalogListMobileCard
      title={row.name.trim() || row.code}
      icon="location"
      statusPill={statusPill}
      metaLines={[
        row.code,
        w != null ? `${w.name}${w.code ? ` (${w.code})` : ''}` : undefined,
      ].filter((x): x is string => x != null && x.length > 0)}
      onPress={onDetail}
    />
  );
}

export const LocationListMobileCard = React.memo(LocationListMobileCardImpl);
