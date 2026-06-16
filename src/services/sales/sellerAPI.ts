import api from '@shared/services/api';
import type {
  SellerDashboardApiResponse,
  SellerDashboardData,
} from './sellerResponseTypes';

export type SellerDashboardParams = {
  from_date: string;
  to_date: string;
};

export async function getSellerDashboard(
  params: SellerDashboardParams,
): Promise<SellerDashboardData> {
  const response = await api.get<SellerDashboardApiResponse>(
    '/dashboard/seller',
    {
      params: {
        from_date: params.from_date,
        to_date: params.to_date,
      },
    },
  );
  const body = response.data;
  if (!body.success || !body.data) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Khong the tai dashboard',
    );
  }
  return body.data;
}
