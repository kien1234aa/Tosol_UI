import axios from 'axios';
import api from '@shared/services/api';
import type {
  ActivitiesApiResponse,
  ActivityLogApi,
  ActivitiesMeta,
} from './activityApiTypes';

export type GetModelActivitiesParams = {
  page?: number;
  per_page?: number;
  signal?: AbortSignal;
};

export type ModelActivitiesPageResult = {
  items: ActivityLogApi[];
  meta: ActivitiesMeta | null;
};

export async function getModelActivities(
  modelType: string,
  modelId: number,
  params: GetModelActivitiesParams = {},
): Promise<ModelActivitiesPageResult> {
  const { page = 1, per_page = 50, signal } = params;
  try {
    const { data } = await api.get<ActivitiesApiResponse>(
      `/activities/model/${modelType}/${modelId}`,
      {
        params: { page, per_page },
        signal,
      },
    );
    if (!data.success) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'Không tải được nhật ký hoạt động',
      );
    }
    return {
      items: data.data ?? [],
      meta: data.meta ?? null,
    };
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const d = e.response?.data as { message?: string } | undefined;
      if (typeof d?.message === 'string') {
        throw new Error(d.message);
      }
    }
    throw e;
  }
}
