import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppColors } from '@shared/theme/ThemeContext';
import { CreateCustomerStackScreen } from './CreateCustomerStackScreen';
import { NotificationDetailScreen } from '../../notifications/NotificationDetailScreen';
import type { SalesMainStackParamList } from './salesNavigationRef';
import type { SalesBottomTabId } from './salesBottomTabNav';
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
import { bottomTabToDrawerIdForRole } from './salesBottomTabNav';
import type { AppRole } from '@features/auth/types/appRole';
import { resolveSalesStackRouteForDrawerId } from './salesNavigationRef';

const Stack = createNativeStackNavigator<SalesMainStackParamList>();

const SLIDE_RIGHT = {
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
} as const;

export type SalesTabStackProps = {
  tabId: SalesBottomTabId;
  appRole: AppRole;
};

function initialRouteForTab(
  tabId: SalesBottomTabId,
  role: AppRole,
): keyof SalesMainStackParamList {
  const drawerId = bottomTabToDrawerIdForRole(tabId, role);
  return resolveSalesStackRouteForDrawerId(drawerId).name;
}

function SalesTabStackNavigator({ tabId, appRole }: SalesTabStackProps) {
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
  const initialRouteName = useMemo(
    () => initialRouteForTab(tabId, appRole),
    [tabId, appRole],
  );

  switch (tabId) {
    case 'orders':
      return (
        <Stack.Navigator
          initialRouteName={initialRouteName as 'OrdersAll'}
          screenOptions={screenOptions}
        >
          <Stack.Screen
            name="SellerDashboard"
            component={SalesSellerDashboardRoute}
          />
          <Stack.Screen name="OrdersAll" component={SalesOrdersAllRoute} />
          <Stack.Screen name="ShopOrders" component={SalesShopOrdersRoute} />
          <Stack.Screen
            name="OrdersReturns"
            component={SalesOrdersReturnsRoute}
          />
          <Stack.Screen name="Shipments" component={SalesShipmentsRoute} />
          <Stack.Screen
            name="NotificationsList"
            component={SalesNotificationsListRoute}
          />
          <Stack.Screen
            name="NotificationDetail"
            component={NotificationDetailScreen}
            options={SLIDE_RIGHT}
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
    case 'catalog':
      return (
        <Stack.Navigator
          initialRouteName={initialRouteName as 'CategoryProducts'}
          screenOptions={screenOptions}
        >
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
            options={SLIDE_RIGHT}
          />
        </Stack.Navigator>
      );
    case 'goods':
      return (
        <Stack.Navigator
          initialRouteName={initialRouteName as 'GoodsMyInventory'}
          screenOptions={screenOptions}
        >
          <Stack.Screen
            name="GoodsMyInventory"
            component={SalesGoodsMyInventoryRoute}
          />
          <Stack.Screen
            name="GoodsPurchase"
            component={SalesGoodsPurchaseRoute}
          />
          <Stack.Screen
            name="GoodsComboPack"
            component={SalesGoodsComboPackRoute}
          />
          <Stack.Screen
            name="GoodsStockAlerts"
            component={SalesGoodsStockAlertsRoute}
          />
          <Stack.Screen
            name="GoodsLocations"
            component={SalesGoodsLocationsRoute}
          />
          <Stack.Screen
            name="GoodsLayoutMap"
            component={SalesGoodsLayoutMapRoute}
          />
        </Stack.Navigator>
      );
    case 'finance':
      return (
        <Stack.Navigator
          initialRouteName={initialRouteName as 'FinanceInvoices'}
          screenOptions={screenOptions}
        >
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
        </Stack.Navigator>
      );
    default:
      return null;
  }
}

export const SalesTabStack = React.memo(SalesTabStackNavigator);
