declare function requestIdleCallback(
  callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
  options?: { timeout?: number },
): number;

declare function cancelIdleCallback(handle: number): void;
