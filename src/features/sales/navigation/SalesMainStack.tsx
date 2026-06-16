import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppColors } from '@shared/theme/ThemeContext';
import { CreateCustomerStackScreen } from './CreateCustomerStackScreen';
import { NotificationDetailScreen } from '../../notifications/NotificationDetailScreen';
import type { SalesMainStackParamList } from './salesNavigationRef';
import {
  SalesCategoryCustomersRoute,
  SalesCategoryPriceListsRoute,
  SalesCategoryProductsRoute,
  SalesCategorySuppliersRoute,
  SalesFinanceGatewayRoute,
  SalesFinanceInvoicesRoute,
  SalesFinancePaymentsRoute,
  SalesFinanceServicePricingRoute,
  SalesFinanceSettlementsRoute,
  SalesGoodsComboPackRoute,
  SalesGoodsLayoutMapRoute,
  SalesGoodsLocationsRoute,
  SalesGoodsMyInventoryRoute,
  SalesGoodsPurchaseRoute,
  SalesGoodsStockAlertsRoute,
  SalesNotificationsListRoute,
  SalesOrdersAllRoute,
  SalesSellerDashboardRoute,
  SalesOrdersReturnsRoute,
  SalesSettingsBankAccountsRoute,
  SalesSettingsCarriersRoute,
  SalesSettingsShopsRoute,
  SalesSettingsStaffRoute,
  SalesSettingsWebhooksRoute,
  SalesShipmentsRoute,
  SalesShopOrdersRoute,
} from './salesStackRouteScreens';

const Stack = createNativeStackNavigator<SalesMainStackParamList>();

/** @deprecated Props moved to `SalesStackActionsContext`; kept for overlay wiring in `SalesLayout`. */
export type SalesMainStackProps = {
  onOpenDrawer?: () => void;
  onCreateOrder?: (preferredShopId?: number) => void;
  onCreateProduct?: () => void;
  onCreateSupplier?: () => void;
  onCreatePriceList?: () => void;
  onOpenPriceList?: (priceListId: number) => void;
  onEditPriceList?: (priceListId: number) => void;
  onOpenProduct?: (productId: number) => void;
  onOpenSupplier?: (supplierId: number) => void;
  onCreateCustomer?: () => void;
  onOpenCustomer?: (customerId: number) => void;
  onOpenInventoryProduct?: (productId: number) => void;
  onCreatePurchaseOrder?: () => void;
  onOpenPurchaseOrder?: (orderRef: string) => void;
  onOpenOrder: (orderNumber: string) => void;
  onOpenInvoice?: (invoiceId: string) => void;
  onOpenSettlement?: (settlementRef: string) => void;
  onOpenPayment?: (paymentRef: string) => void;
  onCreateServicePricing?: () => void;
  servicePricingReloadSignal?: number;
  onOpenCreateShop?: () => void;
  onOpenShopDetail?: (shopId: number) => void;
  onOpenEditShop?: (shopId: number) => void;
  onOpenCreateBankAccount?: () => void;
  onOpenEditBankAccount?: (accountId: number) => void;
  onOpenEditShipPartner?: (sellerShippingPartnerSellerId: number) => void;
  onOpenCreateStaff?: () => void;
  onOpenStaffDetail?: (staffUserId: number) => void;
  onOpenSeller?: (sellerCode: string) => void;
  onOpenPackingOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenOutboundOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenInboundOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenTransferOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenComboAssembly?: (ref: {
    uuid: string | null;
    assemblyNumber: string;
    id: number;
  }) => void;
};

function SalesMainStackNavigator() {
  const c = useAppColors();
  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
      animation: 'none' as const,
      freezeOnBlur: true,
      contentStyle: { flex: 1, backgroundColor: c.bg },
    }),
    [c.bg],
  );

  return (
    <Stack.Navigator initialRouteName="OrdersAll" screenOptions={screenOptions}>
      <Stack.Screen
        name="NotificationsList"
        component={SalesNotificationsListRoute}
      />
      <Stack.Screen
        name="NotificationDetail"
        component={NotificationDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SellerDashboard"
        component={SalesSellerDashboardRoute}
      />
      <Stack.Screen name="OrdersAll" component={SalesOrdersAllRoute} />
      <Stack.Screen name="ShopOrders" component={SalesShopOrdersRoute} />
      <Stack.Screen name="OrdersReturns" component={SalesOrdersReturnsRoute} />
      <Stack.Screen name="Shipments" component={SalesShipmentsRoute} />
      <Stack.Screen
        name="CategoryProducts"
        component={SalesCategoryProductsRoute}
      />
      <Stack.Screen
        name="CategoryPriceLists"
        component={SalesCategoryPriceListsRoute}
      />
      <Stack.Screen
        name="CategorySuppliers"
        component={SalesCategorySuppliersRoute}
      />
      <Stack.Screen
        name="CategoryCustomers"
        component={SalesCategoryCustomersRoute}
      />
      <Stack.Screen
        name="CreateCustomer"
        component={CreateCustomerStackScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GoodsMyInventory"
        component={SalesGoodsMyInventoryRoute}
      />
      <Stack.Screen name="GoodsPurchase" component={SalesGoodsPurchaseRoute} />
      <Stack.Screen name="GoodsComboPack" component={SalesGoodsComboPackRoute} />
      <Stack.Screen
        name="GoodsStockAlerts"
        component={SalesGoodsStockAlertsRoute}
      />
      <Stack.Screen name="GoodsLocations" component={SalesGoodsLocationsRoute} />
      <Stack.Screen
        name="GoodsLayoutMap"
        component={SalesGoodsLayoutMapRoute}
      />
      <Stack.Screen
        name="FinanceInvoices"
        component={SalesFinanceInvoicesRoute}
      />
      <Stack.Screen
        name="FinancePayments"
        component={SalesFinancePaymentsRoute}
      />
      <Stack.Screen
        name="FinanceGateway"
        component={SalesFinanceGatewayRoute}
      />
      <Stack.Screen
        name="FinanceSettlements"
        component={SalesFinanceSettlementsRoute}
      />
      <Stack.Screen
        name="FinanceServicePricing"
        component={SalesFinanceServicePricingRoute}
      />
      <Stack.Screen name="SettingsShops" component={SalesSettingsShopsRoute} />
      <Stack.Screen
        name="SettingsBankAccounts"
        component={SalesSettingsBankAccountsRoute}
      />
      <Stack.Screen
        name="SettingsCarriers"
        component={SalesSettingsCarriersRoute}
      />
      <Stack.Screen
        name="SettingsWebhooks"
        component={SalesSettingsWebhooksRoute}
      />
      <Stack.Screen name="SettingsStaff" component={SalesSettingsStaffRoute} />
    </Stack.Navigator>
  );
}

export const SalesMainStack = React.memo(SalesMainStackNavigator);
