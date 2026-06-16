/** GET `/seller-webhooks` — phần tử `data[]` */

export type SellerWebhookApi = {
  id: number;
  seller_id?: number;
  url: string;
  description: string | null;
  /** Chuỗi hiển thị (sự kiện / topics). */
  events_label: string | null;
  /** Mảng sự kiện gốc (khi API trả `events` / `topics`). */
  events?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateSellerWebhookPayload = {
  url: string;
  description?: string | null;
  is_active?: boolean;
  events?: string[];
};

export type UpdateSellerWebhookPayload = {
  url?: string;
  description?: string | null;
  is_active?: boolean;
  events?: string[];
};

export type SellerWebhookWriteResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export type SellerWebhooksListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type SellerWebhooksApiResponse = {
  success: boolean;
  message: string;
  /** API có thể trả phần tử thô; chuẩn hóa qua `normalizeSellerWebhookRow`. */
  data?: unknown[];
  meta?: SellerWebhooksListMeta;
};
