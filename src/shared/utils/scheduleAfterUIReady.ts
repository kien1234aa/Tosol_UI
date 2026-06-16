/**
 * Chạy task sau khi UI đã xử lý xong tương tác — thay `InteractionManager.runAfterInteractions` (deprecated RN 0.84).
 */
export function scheduleAfterUIReady(task: () => void): { cancel: () => void } {
  let cancelled = false;
  let idleId: ReturnType<typeof requestIdleCallback> | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const run = () => {
    if (cancelled) {
      return;
    }
    task();
  };

  if (typeof requestIdleCallback === 'function') {
    idleId = requestIdleCallback(run, { timeout: 500 });
  } else {
    timeoutId = setTimeout(run, 1);
  }

  return {
    cancel: () => {
      cancelled = true;
      if (idleId != null && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleId);
      }
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
    },
  };
}
