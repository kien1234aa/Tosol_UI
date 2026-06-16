/**
 * @deprecated Trực tiếp — dùng `useAppColors()` từ `src/theme` để hỗ trợ light/dark.
 * `C` vẫn trỏ tới palette tối để tương thích file chưa migrate.
 */
export {
  darkPalette,
  lightPalette,
  type AppColorPalette,
  type ThemeMode,
} from '../theme/colorPalettes';
import { darkPalette } from '../theme/colorPalettes';

export const C = darkPalette;
