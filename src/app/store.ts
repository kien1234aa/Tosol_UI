import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import authReducer from '@services/auth/authSlice';
import userReducer from '@services/auth/userSlice';
import countersReducer from '@services/system/countersSlice';
import dropdownFrequencyReducer from '@services/system/dropdownFrequencySlice';
import { categoryPriceListReducer } from '@services/category/categoryPriceListSlice';
import { categoryProductReducer } from '@services/category/categoryProductSlice';
import { categorySupplierReducer } from '@services/category/categorySupplierSlice';
import { customerListReducer } from '@services/category/customerListSlice';
import customerReducer from '@services/category/customerSlice';
import { gatewayTransactionReducer } from '@services/finance/gatewayTransactionSlice';
import { invoiceReducer } from '@services/finance/invoiceSlice';
import { paymentReducer } from '@services/finance/paymentSlice';
import { settlementReducer } from '@services/finance/settlementSlice';
import { orderReducer } from '@services/sales/orderSlice';
import productReducer from '@services/sales/saleProductSlice';
import { returnOrderReducer } from '@services/sales/returnOrderSlice';
import sellerReducer from '@services/sales/sellerSlice';
import { shipmentReducer } from '@services/sales/shipmentSlice';
import bankAccountReducer from '@services/settings/bankAccountSlice';
import shipPartnerReducer from '@services/settings/shipPartnerSlice';
import shopReducer from '@services/settings/shopSlice';
import sellerStaffReducer from '@services/settings/staffSlice';
import sellerWebhookReducer from '@services/settings/webhookSlice';
import reactotron from '@config/devtools/ReactotronConfig';

const rootReducer = combineReducers({
  auth: authReducer,
  counters: countersReducer,
  dropdownFrequency: dropdownFrequencyReducer,
  user: userReducer,
  shop: shopReducer,
  bankAccount: bankAccountReducer,
  shipPartner: shipPartnerReducer,
  sellerWebhook: sellerWebhookReducer,
  sellerStaff: sellerStaffReducer,
  seller: sellerReducer,
  customer: customerReducer,
  customerList: customerListReducer,
  product: productReducer,
  categoryProduct: categoryProductReducer,
  categoryPriceList: categoryPriceListReducer,
  categorySupplier: categorySupplierReducer,
  order: orderReducer,
  shipment: shipmentReducer,
  returnOrder: returnOrderReducer,
  invoice: invoiceReducer,
  payment: paymentReducer,
  settlement: settlementReducer,
  gatewayTransaction: gatewayTransactionReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['dropdownFrequency'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  enhancers: getDefaultEnhancers =>
    __DEV__
      ? getDefaultEnhancers().concat(reactotron.createEnhancer())
      : getDefaultEnhancers(),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
