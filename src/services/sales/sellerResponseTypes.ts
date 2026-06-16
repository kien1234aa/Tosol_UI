export type DashboardSellerSummary = {
  uuid: string;
  code: string;
  name: string;
};

export type DashboardSellerPeriod = {
  from: string;
  to: string;
  days: number;
};

export type DashboardOrdersByStatus = Record<string, number>;

export type DashboardSalesOrders = {
  total: number;
  by_status: DashboardOrdersByStatus;
  fulfillment_rate: number;
};

export type DashboardSalesPerformance = {
  revenue: {
    total_by_currency: unknown[];
    average_order_value_by_currency: unknown[];
  };
  orders: DashboardSalesOrders;
};

export type DashboardInventorySummary = {
  total_skus: number;
  total_items: number;
  total_value: number;
};

export type SellerDashboardData = {
  seller: DashboardSellerSummary;
  period: DashboardSellerPeriod;
  sales_performance: DashboardSalesPerformance;
  inventory_summary: DashboardInventorySummary;
  top_products: unknown[];
};

export type SellerDashboardApiResponse = {
  success: boolean;
  message: string;
  data?: SellerDashboardData;
};
