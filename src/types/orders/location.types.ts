/** Best Express location API models for create-order address fields. */

export interface BestExpressProvince {
  id: number;
  name: string;
  code: string | null;
  address_id: number;
  parent_address_id: number | null;
  level_mark: number;
  level_name: string;
  children_count: number;
}

export interface BestExpressDistrict {
  id: number;
  name: string;
  code: string | null;
  address_id: number;
  parent_address_id: number | null;
  level_mark: number;
  level_name: string;
  children_count: number;
}

export interface BestExpressWard {
  id: number;
  name: string;
  code: string | null;
  address_id: number;
  parent_address_id: number | null;
  level_mark: number;
  level_name: string;
  children_count?: number;
}
