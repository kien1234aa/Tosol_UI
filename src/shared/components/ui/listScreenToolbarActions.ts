/** Props tùy chọn cho toolbar danh sách: refresh + CTA tạo mới. */
export type ListScreenToolbarCreateActions = {
  onRefresh?: () => void;
  refreshing?: boolean;
  primaryActionTitle?: string;
  onPrimaryAction?: () => void;
};
