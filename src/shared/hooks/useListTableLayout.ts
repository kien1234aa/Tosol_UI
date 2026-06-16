import { useWindowDimensions } from 'react-native';

/** Ngưỡng hiển thị bảng ngang thay cho thẻ mobile (tablet / landscape). */
export const LIST_TABLE_MIN_WIDTH = 720;

export function useListTableLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= LIST_TABLE_MIN_WIDTH;
}
