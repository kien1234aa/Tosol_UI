/** GET `/combo-assemblies` — phản hồi Laravel / TOSOL. */

export type ComboAssembliesMeta = {
  current_page: number;
  from?: number | null;
  last_page: number;
  per_page: number;
  to?: number | null;
  total: number;
};

export type ComboAssemblyProductApi = {
  id?: number;
  sku?: string | null;
  name?: string | null;
  is_combo?: boolean | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
};

export type ComboAssemblyWarehouseApi = {
  id?: number;
  code?: string | null;
  name?: string | null;
  location_management_enabled?: boolean | null;
};

export type ComboAssemblyUserRefApi = {
  id?: number;
  name?: string | null;
};

export type ComboAssemblyRecipeComponentApi = {
  product_id?: number;
  sku?: string | null;
  name?: string | null;
  quantity_per_combo?: number | null;
  total_needed?: number | string | null;
  available_in_warehouse?: number | string | null;
};

export type ComboAssemblyLocationRefApi = {
  id?: number;
  code?: string | null;
  name?: string | null;
};

export type ComboAssemblyApi = {
  id: number;
  uuid?: string | null;
  assembly_number?: string | null;
  seller_id?: number | null;
  warehouse_id?: number | null;
  product_id?: number | null;
  quantity?: string | number | null;
  pick_strategy?: string | null;
  status?: string | null;
  status_label?: string | null;
  to_location_id?: number | null;
  request_note?: string | null;
  completed_note?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  product?: ComboAssemblyProductApi | null;
  warehouse?: ComboAssemblyWarehouseApi | null;
  /** API include `requester` — thường trả về `requested_by`. */
  requested_by?: ComboAssemblyUserRefApi | null;
  requester?: ComboAssemblyUserRefApi | null;
  /** API include `completer` — thường trả về `completed_by`. */
  completed_by?: ComboAssemblyUserRefApi | null;
  completer?: ComboAssemblyUserRefApi | null;
  /** Danh sách nguyên liệu (chi tiết / một số bản list). */
  recipe_components?: ComboAssemblyRecipeComponentApi[] | null;
  to_location?: ComboAssemblyLocationRefApi | null;
};

export type ComboAssemblyDetailApiResponse = {
  success: boolean;
  message?: string | null;
  data?: ComboAssemblyApi | null;
};

export type ComboAssembliesApiResponse = {
  success: boolean;
  message?: string | null;
  data: ComboAssemblyApi[] | { data?: ComboAssemblyApi[] } | null;
  meta?: ComboAssembliesMeta | null;
};

/** POST `/combo-assemblies` — tạo yêu cầu đóng gói combo (khớp backend TOSOL). */
export type CreateComboAssemblyPayload = {
  warehouse_id: number;
  product_id: number;
  quantity: number;
  pick_strategy: 'FIFO' | 'FEFO';
  request_note?: string | null;
  /** Một số môi trường API yêu cầu khi tài khoản quản trị thay mặt seller. */
  seller_id?: number | null;
};

export type CreateComboAssemblyApiResponse = {
  success: boolean;
  message?: string | null;
  data?: ComboAssemblyApi | { data?: ComboAssemblyApi } | null;
};
