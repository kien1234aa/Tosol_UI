import React from 'react';
import type { ListScreenToolbarCreateActions } from '@shared/components/ui/listScreenToolbarActions';
import { ListScreenSearchToolbar } from '@shared/components/ui/ListScreenSearchToolbar';

export type CustomersFilterToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
} & ListScreenToolbarCreateActions;

export function CustomersFilterToolbar({
  query,
  onQueryChange,
  onRefresh,
  refreshing,
  primaryActionTitle,
  onPrimaryAction,
}: CustomersFilterToolbarProps) {
  return (
    <ListScreenSearchToolbar
      searchValue={query}
      onSearchChange={onQueryChange}
      searchPlaceholder="Tìm theo tên, mã, email, số điện thoại"
      onRefresh={onRefresh}
      refreshing={refreshing}
      primaryActionTitle={primaryActionTitle}
      onPrimaryAction={onPrimaryAction}
    />
  );
}
