import { useEffect, useState } from 'react';
import { getBankAccountDirectory } from '@services/settings/bankAccountAPI';
import type { BankAccountListItem } from '@services/settings/bankAccountResponseTypes';
import { getSellerShippingPartnerDirectory } from '@services/settings/shipPartnerAPI';
import type { SellerShippingPartnerApi } from '@services/settings/shipApiTypes';

function formatBankAccountLabel(row: BankAccountListItem): string {
  const name = row.account_name?.trim() || 'Tài khoản';
  const bank = row.bank_name?.trim();
  const num = row.account_number?.trim();
  const parts = [name];
  if (bank) {
    parts.push(bank);
  }
  if (num) {
    parts.push(num);
  }
  return parts.join(' · ');
}

function formatCarrierLabel(row: SellerShippingPartnerApi): string {
  return (
    row.shipping_partner?.name?.trim() ||
    row.shipping_partner?.code?.trim() ||
    `ID ${row.id}`
  );
}

export type ShopDefaultRefLabels = {
  bankLabel: string | null;
  carrierLabel: string | null;
  loading: boolean;
};

export function useShopDefaultRefLabels(
  sellerId: number,
  bankAccountId: number | null | undefined,
  carrierSellerId: number | null | undefined,
  reloadSignal = 0,
): ShopDefaultRefLabels {
  const [bankLabel, setBankLabel] = useState<string | null>(null);
  const [carrierLabel, setCarrierLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const bankId = bankAccountId ?? null;
    const carrierId = carrierSellerId ?? null;

    if (bankId == null && carrierId == null) {
      setBankLabel(null);
      setCarrierLabel(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void (async () => {
      try {
        const [banksRes, carriersRes] = await Promise.all([
          bankId != null
            ? getBankAccountDirectory({
                sellerId,
                per_page: 1000,
                page: 1,
              })
            : Promise.resolve({
                accounts: [] as BankAccountListItem[],
                meta: {
                  current_page: 1,
                  from: 0,
                  last_page: 1,
                  per_page: 0,
                  to: 0,
                  total: 0,
                },
              }),
          carrierId != null
            ? getSellerShippingPartnerDirectory({
                sellerId,
                per_page: 1000,
                page: 1,
              })
            : Promise.resolve({ items: [] as SellerShippingPartnerApi[] }),
        ]);

        if (cancelled) {
          return;
        }

        if (bankId != null) {
          const hit = banksRes.accounts.find(a => a.id === bankId);
          setBankLabel(hit ? formatBankAccountLabel(hit) : null);
        } else {
          setBankLabel(null);
        }

        if (carrierId != null) {
          const hit = carriersRes.items.find(c => c.id === carrierId);
          setCarrierLabel(hit ? formatCarrierLabel(hit) : null);
        } else {
          setCarrierLabel(null);
        }
      } catch {
        if (!cancelled) {
          setBankLabel(null);
          setCarrierLabel(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sellerId, bankAccountId, carrierSellerId, reloadSignal]);

  return { bankLabel, carrierLabel, loading };
}
