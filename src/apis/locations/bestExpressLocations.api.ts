import { getJson } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import type {
  BestExpressDistrict,
  BestExpressProvince,
  BestExpressWard,
} from '@/src/types/orders/location.types';

function sortByVietnameseName<T extends { name: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) =>
    a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }),
  );
}

export interface IBestExpressLocationsService {
  listProvinces(): Promise<BestExpressProvince[]>;
  listDistricts(provinceAddressId: number): Promise<BestExpressDistrict[]>;
  listWards(districtAddressId: number): Promise<BestExpressWard[]>;
}

class HttpBestExpressLocationsService implements IBestExpressLocationsService {
  async listProvinces(): Promise<BestExpressProvince[]> {
    const data = await getJson<BestExpressProvince[]>(
      apiEndpoints.bestExpressProvinces,
    );

    return sortByVietnameseName(data);
  }

  async listDistricts(provinceAddressId: number): Promise<BestExpressDistrict[]> {
    const data = await getJson<BestExpressDistrict[]>(
      apiEndpoints.bestExpressDistricts(provinceAddressId),
    );

    return sortByVietnameseName(data);
  }

  async listWards(districtAddressId: number): Promise<BestExpressWard[]> {
    const data = await getJson<BestExpressWard[]>(
      apiEndpoints.bestExpressWards(districtAddressId),
    );

    return sortByVietnameseName(data);
  }
}

export const bestExpressLocationsService: IBestExpressLocationsService =
  new HttpBestExpressLocationsService();
