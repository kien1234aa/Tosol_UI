import api from '@shared/services/api';
import type {
  BestExpressDistrict,
  BestExpressDistrictsApiResponse,
  BestExpressProvince,
  BestExpressProvincesApiResponse,
  BestExpressWard,
  BestExpressWardsApiResponse,
} from './locationApiTypes';

export type {
  BestExpressDistrict,
  BestExpressProvince,
  BestExpressWard,
} from './locationApiTypes';

/**
 * Danh sách tỉnh/thành (Best Express) — gọi sau khi đã chọn cửa hàng trên form tạo đơn.
 */
export async function getBestExpressProvinces(): Promise<
  BestExpressProvince[]
> {
  const { data } = await api.get<BestExpressProvincesApiResponse>(
    '/best-express/locations/provinces',
  );
  if (!data.success || !data.data) {
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : 'Không tải được tỉnh/thành',
    );
  }
  return data.data.slice().sort((a, b) =>
    a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }),
  );
}

/**
 * Quận/huyện theo tỉnh — `provinceAddressId` là `address_id` của bản ghi tỉnh (không phải `id`).
 */
export async function getBestExpressDistricts(
  provinceAddressId: number,
): Promise<BestExpressDistrict[]> {
  const { data } = await api.get<BestExpressDistrictsApiResponse>(
    `/best-express/locations/provinces/${provinceAddressId}/districts`,
  );
  if (!data.success || !data.data) {
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : 'Không tải được quận/huyện',
    );
  }
  return data.data.slice().sort((a, b) =>
    a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }),
  );
}

/**
 * Phường/xã theo quận — `districtAddressId` là `address_id` của bản ghi quận.
 */
export async function getBestExpressWards(
  districtAddressId: number,
): Promise<BestExpressWard[]> {
  const { data } = await api.get<BestExpressWardsApiResponse>(
    `/best-express/locations/districts/${districtAddressId}/wards`,
  );
  if (!data.success || !data.data) {
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : 'Không tải được phường/xã',
    );
  }
  return data.data.slice().sort((a, b) =>
    a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }),
  );
}
