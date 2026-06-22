/**
 * Semicircular wave notch that hugs the floating bubble.
 * Bubble center sits on the bar top edge; notch radius = bubble radius.
 */
export function getWaveTabShape(
  barWidth: number,
  barHeight: number,
  notchWidth: number,
): string {
  const radius = notchWidth / 2;
  const notchEnd = barWidth + notchWidth;

  const left = `M 0 0 L ${barWidth} 0`;
  const notch = `A ${radius} ${radius} 0 0 1 ${notchEnd} 0`;
  const right = [
    `L ${barWidth * 2.1} 0`,
    `L ${barWidth * 2.1} ${barHeight}`,
    `L 0 ${barHeight}`,
    'Z',
  ].join(' ');

  return `${left} ${notch} ${right}`;
}
