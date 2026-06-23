import React, { type ReactNode } from 'react';
import { useCountersPolling } from '@/src/hooks/counters/useCountersPolling';

interface CountersPollingHostProps {
  children: ReactNode;
}

/** Starts global counters polling for authenticated sessions. */
export function CountersPollingHost({ children }: CountersPollingHostProps) {
  useCountersPolling();
  return <>{children}</>;
}
