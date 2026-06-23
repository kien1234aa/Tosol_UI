/**
 * Vết lõm bán nguyệt — bo tròn vào ôm bong bóng (R = notchWidth / 2).
 */
export function getWaveNotchCurvePath(
  notchStartX: number,
  notchWidth: number,
): string {
  const radius = notchWidth / 2;
  const notchEnd = notchStartX + notchWidth;

  return `A ${radius} ${radius} 0 0 0 ${notchEnd} 0`;
}

export function getWaveTabShape(
  barWidth: number,
  barHeight: number,
  notchWidth: number,
): string {
  const left = `M 0 0 L ${barWidth} 0`;
  const notch = getWaveNotchCurvePath(barWidth, notchWidth);
  const right = [
    `L ${barWidth * 2.1} 0`,
    `L ${barWidth * 2.1} ${barHeight}`,
    `L 0 ${barHeight}`,
    'Z',
  ].join(' ');

  return `${left} ${notch} ${right}`;
}
