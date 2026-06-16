/**
 * Padding ngang thống nhất cho logo + form đăng nhập (cùng lề với dòng chào mừng).
 */
export function loginContentPaddingX(screenWidth: number): number {
  return Math.min(28, Math.max(16, Math.round(screenWidth * 0.075)));
}
