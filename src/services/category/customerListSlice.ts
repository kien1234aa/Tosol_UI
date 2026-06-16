import { createListSlice } from '@services/_core/createListSlice';
import { logout } from '@services/auth/authSlice';
import { customerService } from './customerAPI';

export const CUSTOMER_LIST_MAX_WINDOW = 100;

const {
  fetchList: fetchCustomerList,
  setSearch,
  reducer: customerListReducer,
  initialState,
} = createListSlice({
  name: 'customerList',
  stateKey: 'customerList',
  fetchFn: customerService.getList,
  maxWindow: CUSTOMER_LIST_MAX_WINDOW,
  defaultPerPage: 10,
  errorMessage: 'Không tải được khách hàng',
  resetOn: [logout.fulfilled, logout.rejected],
});

const setCustomerListSearch = setSearch;

export { fetchCustomerList, setCustomerListSearch, customerListReducer, initialState };

export type { ListSliceState as CustomerListState } from '@services/_core/createListSlice';
