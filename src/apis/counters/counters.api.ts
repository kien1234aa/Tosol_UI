import { getJson } from '@/src/apis/http';
import { apiEndpoints } from '@/src/configs/api';
import type { CountersData } from '@/src/types/counters/counters.types';

export interface ICountersService {
  get(): Promise<CountersData>;
}

class HttpCountersService implements ICountersService {
  async get(): Promise<CountersData> {
    return getJson<CountersData>(apiEndpoints.counters);
  }
}

export const countersService: ICountersService = new HttpCountersService();
