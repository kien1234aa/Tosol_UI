import { createSelector } from '@reduxjs/toolkit';
import { searchCopy } from '@/src/configs/search';
import { isAllWarehouses } from '@/src/configs/warehouse';
import { isAdminUser } from '@/src/helpers/profile';
import type { RootState } from '../store';

const selectAuthState = (state: RootState) => state.auth;

export const selectAuthStatus = createSelector(
  selectAuthState,
  auth => auth.status,
);

export const selectIsAuthenticating = createSelector(
  selectAuthState,
  auth => auth.status === 'loading',
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  auth => auth.status === 'authenticated',
);

export const selectAuthError = createSelector(
  selectAuthState,
  auth => auth.error,
);

export const selectAuthFieldErrors = createSelector(
  selectAuthState,
  auth => auth.fieldErrors,
);

export const selectRememberMe = createSelector(
  selectAuthState,
  auth => auth.rememberMe,
);

export const selectAuthUser = createSelector(
  selectAuthState,
  auth => auth.user,
);

export const selectIsAdminUser = createSelector(selectAuthUser, user =>
  isAdminUser(user?.role),
);

export const selectAuthSeller = createSelector(
  selectAuthUser,
  user => user?.seller ?? null,
);

export const selectAuthToken = createSelector(
  selectAuthState,
  auth => auth.token,
);

export const selectIsSwitchingWarehouse = createSelector(
  selectAuthState,
  auth => auth.isSwitchingWarehouse,
);

export const selectAuthWarehouses = createSelector(selectAuthUser, user =>
  user?.warehouses.filter(warehouse => warehouse.is_active) ?? [],
);

export const selectCurrentWarehouseId = createSelector(
  selectAuthUser,
  user => user?.currentWarehouseId ?? null,
);

export const selectSelectedWarehouse = createSelector(
  [selectAuthWarehouses, selectCurrentWarehouseId],
  (warehouses, currentWarehouseId) => {
    if (warehouses.length === 0 || isAllWarehouses(currentWarehouseId)) {
      return null;
    }

    return (
      warehouses.find(warehouse => warehouse.id === currentWarehouseId) ?? null
    );
  },
);

export const selectSelectedWarehouseLabel = createSelector(
  [selectAuthWarehouses, selectCurrentWarehouseId],
  (warehouses, currentWarehouseId) => {
    if (warehouses.length === 0) {
      return searchCopy.warehousePlaceholder;
    }

    if (isAllWarehouses(currentWarehouseId)) {
      return searchCopy.allWarehousesLabel;
    }

    return (
      warehouses.find(warehouse => warehouse.id === currentWarehouseId)?.name ??
      searchCopy.allWarehousesLabel
    );
  },
);
