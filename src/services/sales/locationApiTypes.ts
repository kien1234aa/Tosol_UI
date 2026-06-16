/** Phản hồi GET /best-express/locations/provinces */

export type BestExpressProvince = {
  id: number;
  name: string;
  code: string | null;
  address_id: number;
  parent_address_id: number | null;
  level_mark: number;
  level_name: string;
  children_count: number;
};

export type BestExpressProvincesApiResponse = {
  success: boolean;
  message: string;
  data?: BestExpressProvince[];
};

/** GET .../provinces/{provinceAddressId}/districts — `provinceAddressId` = address_id tỉnh */

export type BestExpressDistrict = {
  id: number;
  name: string;
  code: string | null;
  address_id: number;
  parent_address_id: number | null;
  level_mark: number;
  level_name: string;
  children_count: number;
};

export type BestExpressDistrictsApiResponse = {
  success: boolean;
  message: string;
  data?: BestExpressDistrict[];
};

/** GET .../districts/{districtAddressId}/wards — `districtAddressId` = address_id quận */

export type BestExpressWard = {
  id: number;
  name: string;
  code: string | null;
  address_id: number;
  parent_address_id: number | null;
  level_mark: number;
  level_name: string;
  children_count?: number;
};

export type BestExpressWardsApiResponse = {
  success: boolean;
  message: string;
  data?: BestExpressWard[];
};
