import { getJson, getJsonPaginated, patchJson, postJson, type PaginationMeta } from '@/src/apis/http';
import {
  apiEndpoints,
  ordersPageSize,
  saleOrderDetailInclude,
  saleOrdersListInclude,
} from '@/src/configs/api';
import type {
  CreateSaleOrderPayload,
  SaleOrderApiItem,
  SaleOrderCreatedRecord,
  SaleOrderDetailApi,
  SaleOrderListParams,
  UpdateSaleOrderPayload,
} from '@/src/types/orders/saleOrder.types';

export interface ISaleOrdersService {
  create(payload: CreateSaleOrderPayload): Promise<SaleOrderCreatedRecord>;
  list(
    params?: SaleOrderListParams,
  ): Promise<{ data: SaleOrderApiItem[]; meta: PaginationMeta }>;
  getDetail(orderRef: string): Promise<SaleOrderDetailApi>;
  update(orderRef: string, payload: UpdateSaleOrderPayload): Promise<SaleOrderApiItem>;
  cancel(orderRef: string, cancelReason: string): Promise<SaleOrderApiItem>;
}

class HttpSaleOrdersService implements ISaleOrdersService {
  async create(payload: CreateSaleOrderPayload): Promise<SaleOrderCreatedRecord> {
    return postJson<SaleOrderCreatedRecord>(apiEndpoints.saleOrders, payload);
  }

  async list(
    params: SaleOrderListParams = {},
  ): Promise<{ data: SaleOrderApiItem[]; meta: PaginationMeta }> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? ordersPageSize;

    const query: Record<string, string | number> = {
      page,
      per_page: perPage,
      sort: '-created_at',
      include: saleOrdersListInclude,
    };

    if (params.search?.trim()) {
      query['filter[search]'] = params.search.trim();
    }

    if (params.status?.trim()) {
      query['filter[status]'] = params.status.trim();
    }

    if (params.paymentStatus?.trim()) {
      query['filter[payment_status]'] = params.paymentStatus.trim();
    }

    if (params.hasIssue === true) {
      query['filter[has_issue]'] = 'true';
    } else if (params.hasIssue === false) {
      query['filter[has_issue]'] = 'false';
    }

    if (params.dateFrom?.trim()) {
      query['filter[date_from]'] = params.dateFrom.trim();
    }

    if (params.dateTo?.trim()) {
      query['filter[date_to]'] = params.dateTo.trim();
    }

    if (params.shopId != null) {
      query['filter[shop_id]'] = params.shopId;
    }

    return getJsonPaginated<SaleOrderApiItem[]>(apiEndpoints.saleOrders, query);
  }

  async getDetail(orderRef: string): Promise<SaleOrderDetailApi> {
    const ref = orderRef.trim();
    if (!ref) {
      throw new Error('Thiếu mã đơn hàng');
    }

    return getJson<SaleOrderDetailApi>(
      `${apiEndpoints.saleOrders}/${encodeURIComponent(ref)}`,
      { include: saleOrderDetailInclude },
    );
  }

  async update(
    orderRef: string,
    payload: UpdateSaleOrderPayload,
  ): Promise<SaleOrderApiItem> {
    const ref = orderRef.trim();

    if (!ref) {
      throw new Error('Thiếu mã đơn hàng');
    }

    return patchJson<SaleOrderApiItem>(
      `${apiEndpoints.saleOrders}/${encodeURIComponent(ref)}`,
      payload,
    );
  }

  async cancel(
    orderRef: string,
    cancelReason: string,
  ): Promise<SaleOrderApiItem> {
    const ref = orderRef.trim();
    const reason = cancelReason.trim();

    if (!ref) {
      throw new Error('Thiếu mã đơn hàng');
    }

    if (!reason) {
      throw new Error('Vui lòng nhập lý do hủy đơn');
    }

    return postJson<SaleOrderApiItem>(
      `${apiEndpoints.saleOrders}/${encodeURIComponent(ref)}/cancel`,
      { cancel_reason: reason },
    );
  }
}

export const saleOrdersService: ISaleOrdersService = new HttpSaleOrdersService();
