import type { SystemIconName } from '@shared/components/icons/SystemIcon';

export type ComboAssemblyDetailTabId = 'info' | 'materials';

export const COMBO_ASSEMBLY_DETAIL_TABS: {
  id: ComboAssemblyDetailTabId;
  label: string;
  icon: SystemIconName;
  badgeFrom?: 'materials';
}[] = [
  { id: 'info', label: 'Thông tin', icon: 'info' },
  {
    id: 'materials',
    label: 'Nguyên liệu cần',
    icon: 'layers',
    badgeFrom: 'materials',
  },
];
