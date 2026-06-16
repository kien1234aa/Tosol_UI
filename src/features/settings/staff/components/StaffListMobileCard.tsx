import React, { useMemo } from 'react';
import { CatalogListMobileCard } from '@shared/components/ui/listMobileCard/CatalogListMobileCard';
import { StatusPill } from '@shared/components/ui/StatusPill';
import type { StaffUserApi } from '@services/settings/staffApiTypes';

function roleLabel(role: string): string {
  const r = role.trim().toLowerCase();
  if (r === 'admin') return 'Quản trị';
  if (r === 'staff') return 'Nhân viên';
  return role;
}

export type StaffListMobileCardProps = {
  row: StaffUserApi;
  onView?: () => void;
  onDelete?: () => void;
};

function StaffListMobileCardImpl({
  row,
  onView,
  onDelete,
}: StaffListMobileCardProps) {
  const statusPill = useMemo(
    () => (
      <StatusPill
        tone={row.is_active ? 'success' : 'neutral'}
        emphasized={false}
        compact
      >
        {row.is_active ? 'Hoạt động' : 'Tắt'}
      </StatusPill>
    ),
    [row.is_active],
  );

  return (
    <CatalogListMobileCard
      title={row.name}
      icon="person"
      statusPill={statusPill}
      metaLines={[row.email, `Vai trò: ${roleLabel(String(row.role))}`]}
      onView={onView}
      onDelete={onDelete}
    />
  );
}

export const StaffListMobileCard = React.memo(StaffListMobileCardImpl);
