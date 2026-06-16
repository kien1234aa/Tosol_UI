import type { SepayBank, SepayBanksCatalogResponse } from './sepayBanksTypes';

const SEPAY_BANKS_URL = 'https://qr.sepay.vn/banks.json';

/**
 * Tải danh sách ngân hàng từ Sepay (dùng cho chọn `bank_code` khi tạo TK).
 * Trả tất cả ngân hàng, sắp xếp: supported trước, sau đó theo `short_name`.
 */
export async function getSepayBanksCatalog(): Promise<SepayBank[]> {
  const res = await fetch(SEPAY_BANKS_URL);
  if (!res.ok) {
    throw new Error('Không tải được danh sách ngân hàng');
  }
  const json = (await res.json()) as SepayBanksCatalogResponse;
  if (!json || !Array.isArray(json.data)) {
    throw new Error('Dữ liệu ngân hàng không hợp lệ');
  }
  const valid = json.data.filter(b => b && typeof b.code === 'string');
  valid.sort((a, b) => {
    if (a.supported !== b.supported) {
      return a.supported ? -1 : 1;
    }
    return (a.short_name || a.name).localeCompare(
      b.short_name || b.name,
      'vi',
      { sensitivity: 'base' },
    );
  });
  return valid;
}
