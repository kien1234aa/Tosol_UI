import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';
import { ListScreenFiltersBottomSheet } from '@shared/components/ui/ListScreenFiltersBottomSheet';
import { ListScreenFilterPickerSection } from '@shared/components/ui/ListScreenFilterPickerSection';

const ROLE_OPTIONS: { key: 'all' | 'admin' | 'staff'; label: string }[] = [
  { key: 'all', label: 'Tất cả vai trò' },
  { key: 'admin', label: 'Quản lý' },
  { key: 'staff', label: 'Nhân viên' },
];

const STATUS_OPTIONS: { key: 'all' | 'active' | 'inactive'; label: string }[] =
  [
    { key: 'all', label: 'Tất cả trạng thái' },
    { key: 'active', label: 'Hoạt động' },
    { key: 'inactive', label: 'Không hoạt động' },
  ];

export type StaffFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  roleFilter: 'all' | 'admin' | 'staff';
  onRoleFilterChange: (key: 'all' | 'admin' | 'staff') => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (key: 'all' | 'active' | 'inactive') => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
} & ListScreenToolbarCreateActions;

export function StaffFilterToolbar({
  query,
  onQueryChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  filtersActive: filtersActiveProp,
  onClearFilters,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: StaffFilterToolbarProps) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const roleOptions = useMemo(() => ROLE_OPTIONS, []);
  const statusOptions = useMemo(() => STATUS_OPTIONS, []);
  const filtersActive =
    filtersActiveProp ?? (statusFilter !== 'all' || roleFilter !== 'all');

  return (
    <>
      <ListScreenSearchToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Tìm kiếm người dùng…"
        onFilterPress={() => setFilterOpen(true)}
        filterButtonTitle={t('common.listToolbar.filter')}
        filtersActive={filtersActive}
        onClearFilters={onClearFilters}
        onRefresh={onRefresh}
        refreshing={refreshing}
        primaryActionTitle={primaryActionTitle}
        onPrimaryAction={onPrimaryAction}
      />
      <ListScreenFiltersBottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <ListScreenFilterPickerSection
          title="Vai trò"
          value={roleFilter}
          options={roleOptions}
          onChange={onRoleFilterChange}
        />
        <ListScreenFilterPickerSection
          title="Trạng thái"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusFilterChange}
        />
      </ListScreenFiltersBottomSheet>
    </>
  );
}
