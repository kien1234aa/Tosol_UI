/** Meta phân trang — GET `/locations`. */
export type LocationsListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

/** Kho kèm theo `include=warehouse`. */
export type LocationWarehouseApi = {
  id: number;
  name: string;
  code?: string | null;
};

/** Phần tử `data[]` — GET `/locations`. */
export type LocationListItemApi = {
  id: number;
  uuid?: string;
  code: string;
  name: string;
  type: string;
  warehouse_id: number;
  warehouse?: LocationWarehouseApi | null;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type LocationsListApiResponse = {
  success: boolean;
  message?: string;
  data?: LocationListItemApi[];
  meta?: LocationsListMeta;
};
