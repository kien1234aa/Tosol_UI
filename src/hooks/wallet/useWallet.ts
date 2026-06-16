import { useCallback, useState } from 'react';
import { mockWalletTransactions } from '@/src/configs/wallet';
import type {
  WalletMode,
  WalletTab,
  WalletTransaction,
} from '@/src/types/wallet/wallet.types';

export interface UseWalletResult {
  mode: WalletMode;
  activeTab: WalletTab;
  amount: string;
  transactions: WalletTransaction[];
  setActiveTab: (tab: WalletTab) => void;
  setAmount: (value: string) => void;
  toggleMode: () => void;
  resetAmount: () => void;
}

/** Keep only digits so the amount stays a valid VND value. */
function sanitizeAmount(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

export function useWallet(): UseWalletResult {
  const [mode, setMode] = useState<WalletMode>('topup');
  const [activeTab, setActiveTab] = useState<WalletTab>('form');
  const [amount, setAmountState] = useState('');
  const [transactions] = useState<WalletTransaction[]>(mockWalletTransactions);

  const setAmount = useCallback((value: string) => {
    setAmountState(sanitizeAmount(value));
  }, []);

  const resetAmount = useCallback(() => {
    setAmountState('');
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === 'topup' ? 'withdraw' : 'topup'));
    setActiveTab('form');
    setAmountState('');
  }, []);

  return {
    mode,
    activeTab,
    amount,
    transactions,
    setActiveTab,
    setAmount,
    toggleMode,
    resetAmount,
  };
}
