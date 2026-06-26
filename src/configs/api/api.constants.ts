/** Base URL for the production API. */
export { getApiBaseUrl, PRODUCTION_API_BASE_URL } from './api.environment';
export * from './http.constants';

import { getApiBaseUrl } from './api.environment';

export const API_BASE_URL = getApiBaseUrl();

export const productsPageSize = 50;

export const productDetailIncludes =
  'seller,images,recipeItems,recipeItems.component';

export const userDetailInclude = 'warehouses,seller';

export const apiEndpoints = {
  login: '/login',
  forgotPassword: '/forgot-password',
  refreshToken: '/refresh-token',
  userDetail: (uuid: string) => `/users/${uuid}`,
  warehouseContext: '/warehouse-context',
  switchWarehouseContext: '/warehouse-context/switch',
  products: '/products',
  productSuggestions: '/products/suggestions',
  shops: '/shops',
  customers: '/customers',
  customerDetail: (customerId: number) => `/customers/${customerId}`,
  sellerWarehouses: (sellerCode: string) => `/sellers/${sellerCode}/warehouses`,
  warehouseShippingPartners: (warehouseCode: string) =>
    `/warehouses/${warehouseCode}/shipping-partners`,
  bestExpressProvinces: '/best-express/locations/provinces',
  bestExpressDistricts: (provinceAddressId: number) =>
    `/best-express/locations/provinces/${provinceAddressId}/districts`,
  bestExpressWards: (districtAddressId: number) =>
    `/best-express/locations/districts/${districtAddressId}/wards`,
  sellerShippingPartners: '/shipping-partner-sellers',
  shippingRatesEstimateCost: '/shipping-rates/estimate-cost',
  saleOrders: '/sale-orders',
  notifications: '/notifications',
  counters: '/counters',
  users: '/users',
  deviceTokens: '/device-tokens',
} as const;

export const ordersPageSize = 15;

export const notificationsPageSize = 20;
export const staffListPageSize = 50;
export const staffListSort = '-created_at';

export const saleOrdersListInclude =
  'customer,shop,currency,items.product,creator';

export const saleOrderDetailInclude =
  'creator,seller,shop,shop.defaultPriceList,shop.defaultPriceList.currency,shop.defaultBankAccount,customer,packingWarehouse,shippingWarehouse,currency,items.product,shipment.shippingPartnerSeller.shippingPartner,shipment.shippingPartnerWarehouse.shippingPartnerConfig.shippingPartner,payments,payments.bankAccount,packingOrder,packingOrder.boxes,packingOrder.boxes.boxTemplate,outboundOrders,outboundOrders.items,outboundOrders.warehouse,returnOrders,returnOrders.items';

export const shopsPageSize = 50;
export const customersPageSize = 20;
export const customerSearchMinLength = 2;
