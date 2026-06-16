/** Danh mục ngân hàng từ Sepay QR (`https://qr.sepay.vn/banks.json`). */
export type SepayBank = {
  id?: number;
  name: string;
  code: string;
  bin: string;
  short_name: string;
  supported: boolean;
};

export type SepayBanksCatalogResponse = {
  no_banks?: string;
  data?: SepayBank[];
};
