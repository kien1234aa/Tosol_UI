import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrdersListScreen } from '../screens/OrdersListScreen';
import { SellerDashboardScreen } from '../screens/SellerDashboardScreen';
import { ReturnOrdersListScreen } from '../screens/ReturnOrdersListScreen';
import { ShipmentsListScreen } from '../screens/ShipmentsListScreen';
import { PriceListsListScreen } from '../../category/priceList/PriceListsListScreen';
import { SuppliersListScreen } from '../../category/suppliers/SuppliersListScreen';
import { ProductsListScreen } from '../../category/products/ProductsListScreen';
import { CustomersListScreen } from '../../category/customers/CustomersListScreen';
import { GoodsPurchaseScreen } from '../../goods/screens/GoodsPurchaseScreen';
import { MyInventoryScreen } from '../../goods/screens/MyInventoryScreen';
import { InvoiceListScreen } from '../../finance/bill/InvoiceListScreen';
import { GatewayTransactionListScreen } from '../../finance/gatewayTransaction/GatewayTransactionListScreen';
import { PaymentListScreen } from '../../finance/payment/PaymentListScreen';
import { SettlementListScreen } from '../../finance/settlement/SettlementListScreen';
import { ServicePricingsListScreen } from '../../finance/servicePricing/ServicePricingsListScreen';
import { ComboAssembliesListScreen } from '../../comboAssembly/screens/ComboAssembliesListScreen';
import { LocationsListScreen } from '../../goods/locations/LocationsListScreen';
import { WarehouseLayoutMapScreen } from '../../goods/warehouseLayout/WarehouseLayoutMapScreen';
import { StockAlertsListScreen } from '../../goods/stockAlerts/StockAlertsListScreen';
import { SettingsBankAccountsScreen } from '../../settings/bankAccount/SettingsBankAccountsScreen';
import { SettingsShipPartnersScreen } from '../../settings/shipPartners/SettingsShipPartnersScreen';
import { SettingsWebhooksScreen } from '../../settings/webhooks/SettingsWebhooksScreen';
import { SettingsStaffScreen } from '../../settings/staff/SettingsStaffScreen';
import { SettingsShopsScreen } from '../../settings/shops/SettingsShopsScreen';
import { NotificationsListScreen } from '../../notifications/NotificationsListScreen';
import type { SalesMainStackParamList } from './salesNavigationRef';
import { useSalesStackActions } from './SalesStackActionsContext';

type StackProps<T extends keyof SalesMainStackParamList> = NativeStackScreenProps<
  SalesMainStackParamList,
  T
>;

export function SalesNotificationsListRoute() {
  const a = useSalesStackActions();
  return (
    <NotificationsListScreen
      onOpenDrawer={a.onOpenDrawer}
      onOpenOrder={a.onOpenOrder}
      onOpenInvoice={a.onOpenInvoice}
      onOpenSettlement={a.onOpenSettlement}
      onOpenPayment={a.onOpenPayment}
      onOpenPurchaseOrder={a.onOpenPurchaseOrder}
      onOpenInboundOrder={a.onOpenInboundOrder}
      onOpenPackingOrder={a.onOpenPackingOrder}
      onOpenOutboundOrder={a.onOpenOutboundOrder}
      onOpenTransferOrder={a.onOpenTransferOrder}
      onOpenComboAssembly={a.onOpenComboAssembly}
    />
  );
}

export function SalesSellerDashboardRoute() {
  const { onOpenDrawer } = useSalesStackActions();
  return <SellerDashboardScreen onOpenDrawer={onOpenDrawer} />;
}

export function SalesOrdersAllRoute() {
  const { onOpenDrawer, onCreateOrder, onOpenOrder } = useSalesStackActions();
  return (
    <OrdersListScreen
      onOpenDrawer={onOpenDrawer}
      onCreateOrder={onCreateOrder}
      onOpenOrder={onOpenOrder}
    />
  );
}

export function SalesShopOrdersRoute({ route }: StackProps<'ShopOrders'>) {
  const { onOpenDrawer, onCreateOrder, onOpenOrder } = useSalesStackActions();
  return (
    <OrdersListScreen
      shopId={route.params.shopId}
      onOpenDrawer={onOpenDrawer}
      onCreateOrder={onCreateOrder}
      onOpenOrder={onOpenOrder}
    />
  );
}

export function SalesOrdersReturnsRoute() {
  const { onOpenDrawer, onOpenOrder } = useSalesStackActions();
  return (
    <ReturnOrdersListScreen
      onOpenDrawer={onOpenDrawer}
      onOpenOrder={onOpenOrder}
    />
  );
}

export function SalesShipmentsRoute() {
  const { onOpenDrawer, onOpenOrder } = useSalesStackActions();
  return (
    <ShipmentsListScreen onOpenDrawer={onOpenDrawer} onOpenOrder={onOpenOrder} />
  );
}

export function SalesCategoryProductsRoute() {
  const { onOpenDrawer, onCreateProduct, onOpenProduct } = useSalesStackActions();
  return (
    <ProductsListScreen
      onOpenDrawer={onOpenDrawer}
      onCreateProduct={onCreateProduct}
      onOpenProduct={onOpenProduct}
    />
  );
}

export function SalesCategoryPriceListsRoute() {
  const { onOpenDrawer, onCreatePriceList, onOpenPriceList, onEditPriceList } =
    useSalesStackActions();
  return (
    <PriceListsListScreen
      onOpenDrawer={onOpenDrawer}
      onCreatePriceList={onCreatePriceList}
      onOpenPriceList={onOpenPriceList}
      onEditPriceList={onEditPriceList}
    />
  );
}

export function SalesCategorySuppliersRoute() {
  const { onOpenDrawer, onCreateSupplier, onOpenSupplier } =
    useSalesStackActions();
  return (
    <SuppliersListScreen
      onOpenDrawer={onOpenDrawer}
      onCreateSupplier={onCreateSupplier}
      onOpenSupplier={onOpenSupplier}
    />
  );
}

export function SalesCategoryCustomersRoute() {
  const { onOpenDrawer, onCreateCustomer, onOpenCustomer } =
    useSalesStackActions();
  return (
    <CustomersListScreen
      onOpenDrawer={onOpenDrawer}
      onCreateCustomer={onCreateCustomer}
      onOpenCustomer={onOpenCustomer}
    />
  );
}

export function SalesGoodsMyInventoryRoute() {
  const { onOpenDrawer, onOpenInventoryProduct } = useSalesStackActions();
  return (
    <MyInventoryScreen
      onOpenDrawer={onOpenDrawer}
      onOpenInventoryProduct={onOpenInventoryProduct}
    />
  );
}

export function SalesGoodsPurchaseRoute() {
  const { onOpenDrawer, onCreatePurchaseOrder, onOpenPurchaseOrder } =
    useSalesStackActions();
  return (
    <GoodsPurchaseScreen
      onOpenDrawer={onOpenDrawer}
      onCreatePurchaseOrder={onCreatePurchaseOrder}
      onOpenPurchaseOrder={onOpenPurchaseOrder}
    />
  );
}

export function SalesGoodsComboPackRoute() {
  const { onOpenDrawer, onOpenComboAssembly } = useSalesStackActions();
  return (
    <ComboAssembliesListScreen
      onOpenDrawer={onOpenDrawer}
      onOpenComboAssembly={onOpenComboAssembly}
    />
  );
}

export function SalesGoodsStockAlertsRoute() {
  const { onOpenDrawer, onOpenInventoryProduct } = useSalesStackActions();
  return (
    <StockAlertsListScreen
      onOpenDrawer={onOpenDrawer}
      onOpenInventoryProduct={onOpenInventoryProduct}
    />
  );
}

export function SalesGoodsLocationsRoute() {
  const { onOpenDrawer } = useSalesStackActions();
  return <LocationsListScreen onOpenDrawer={onOpenDrawer} />;
}

export function SalesGoodsLayoutMapRoute() {
  const { onOpenDrawer } = useSalesStackActions();
  return <WarehouseLayoutMapScreen onOpenDrawer={onOpenDrawer} />;
}

export function SalesFinanceInvoicesRoute() {
  const { onOpenDrawer, onOpenInvoice } = useSalesStackActions();
  return (
    <InvoiceListScreen
      onOpenDrawer={onOpenDrawer}
      onOpenInvoice={onOpenInvoice}
    />
  );
}

export function SalesFinancePaymentsRoute() {
  const { onOpenDrawer, onOpenPayment } = useSalesStackActions();
  return (
    <PaymentListScreen
      onOpenDrawer={onOpenDrawer}
      onOpenPayment={onOpenPayment}
    />
  );
}

export function SalesFinanceGatewayRoute() {
  const { onOpenDrawer } = useSalesStackActions();
  return <GatewayTransactionListScreen onOpenDrawer={onOpenDrawer} />;
}

export function SalesFinanceSettlementsRoute() {
  const { onOpenDrawer, onOpenSettlement } = useSalesStackActions();
  return (
    <SettlementListScreen
      onOpenDrawer={onOpenDrawer}
      onOpenSettlement={onOpenSettlement}
    />
  );
}

export function SalesFinanceServicePricingRoute() {
  const { onOpenDrawer, onCreateServicePricing, servicePricingReloadSignal } =
    useSalesStackActions();
  return (
    <ServicePricingsListScreen
      onOpenDrawer={onOpenDrawer}
      onCreateServicePricing={onCreateServicePricing}
      reloadSignal={servicePricingReloadSignal}
    />
  );
}

export function SalesSettingsShopsRoute() {
  const {
    onOpenDrawer,
    onOpenCreateShop,
    onOpenShopDetail,
    onOpenEditShop,
  } = useSalesStackActions();
  return (
    <SettingsShopsScreen
      onOpenDrawer={onOpenDrawer}
      onOpenCreateShop={onOpenCreateShop}
      onOpenShopDetail={onOpenShopDetail}
      onOpenEditShop={onOpenEditShop}
    />
  );
}

export function SalesSettingsBankAccountsRoute() {
  const { onOpenDrawer, onOpenCreateBankAccount, onOpenEditBankAccount } =
    useSalesStackActions();
  return (
    <SettingsBankAccountsScreen
      onOpenDrawer={onOpenDrawer}
      onOpenCreateBankAccount={onOpenCreateBankAccount}
      onOpenEditBankAccount={onOpenEditBankAccount}
    />
  );
}

export function SalesSettingsCarriersRoute() {
  const { onOpenDrawer, onOpenEditShipPartner } = useSalesStackActions();
  return (
    <SettingsShipPartnersScreen
      onOpenDrawer={onOpenDrawer}
      onOpenEditShipPartner={onOpenEditShipPartner}
    />
  );
}

export function SalesSettingsWebhooksRoute() {
  const { onOpenDrawer } = useSalesStackActions();
  return <SettingsWebhooksScreen onOpenDrawer={onOpenDrawer} />;
}

export function SalesSettingsStaffRoute() {
  const { onOpenDrawer, onOpenCreateStaff, onOpenStaffDetail } =
    useSalesStackActions();
  return (
    <SettingsStaffScreen
      onOpenDrawer={onOpenDrawer}
      onOpenCreateStaff={onOpenCreateStaff}
      onOpenStaffDetail={onOpenStaffDetail}
    />
  );
}

