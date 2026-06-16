import type { ShopListItem } from '@services/settings/shopResponseTypes';

export function platformDisplayLabel(platform: string): string {
  const k = platform.trim().toLowerCase();
  const map: Record<string, string> = {
    manual: 'Bán trực tiếp',
    shopee: 'Shopee',
    lazada: 'Lazada',
    tiktok: 'TikTok Shop',
    tiki: 'Tiki',
    other: 'Khác',
  };
  return map[k] ?? platform;
}

export function currencyLabelFromId(currencyId: number): string {
  if (currencyId === 1) {
    return 'VND';
  }
  return `#${currencyId}`;
}

export function defaultPriceListLabel(item: ShopListItem): string {
  return item.default_price_list_id != null
    ? `ID ${item.default_price_list_id}`
    : 'Chưa thiết lập';
}

export function pickStrategyDisplay(code: string): string {
  const u = code.trim().toUpperCase();
  const map: Record<string, string> = {
    FIFO: 'FIFO - First In First Out',
    LIFO: 'LIFO - Last In First Out',
    FEFO: 'FEFO - First Expired First Out',
  };
  return map[u] ?? code;
}

export function paymentMethodDisplay(key: string): string {
  const k = key.trim().toLowerCase();
  const map: Record<string, string> = {
    none: 'Không',
    cod: 'COD',
    bank_transfer: 'Chuyển khoản',
    e_wallet: 'Ví điện tử',
  };
  return map[k] ?? key;
}

export function onlinePaymentMethodDisplay(key: string): string {
  const k = key.trim().toLowerCase();
  const map: Record<string, string> = {
    none: 'Không',
    cod: 'COD',
    bank_transfer: 'Chuyển khoản',
    e_wallet: 'Ví điện tử',
    gateway: 'Cổng thanh toán',
    momo: 'MoMo',
    vnpay: 'VNPay',
    stripe: 'Stripe',
  };
  return map[k] ?? key;
}
