import {
  createAsyncThunk,
  createSlice,
  type ActionCreatorWithoutPayload,
  type ActionCreatorWithPayload,
  type PayloadAction,
} from '@reduxjs/toolkit';
import {
  markListFetchPending,
  markListFetchSettled,
} from '@features/listLoading/listFetchSliceHelpers';
import type { ApiEnvelope, ListParams, PaginationMeta } from './apiTypes';

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

/**
 * State chuẩn cho mọi danh sách phân trang có search + windowing.
 * Dùng trực tiếp khi extend (vd. ProductState mở rộng từ đây).
 */
export type ListSliceState<TItem, TMeta extends PaginationMeta = PaginationMeta> = {
  items: TItem[];
  meta: TMeta | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  listPage: number;
  listPerPage: number;
  listSearch: string;
  loadingMore: boolean;
  windowStart: number;
};

// ---------------------------------------------------------------------------
// Windowing helper — tái sử dụng trong các slice tự viết
// ---------------------------------------------------------------------------

/**
 * Áp dụng logic windowing khi `append = true`.
 * Giữ tối đa `maxWindow` item; khi vượt, cắt đầu mảng và tăng `windowStart`.
 */
export function applyWindowedAppend<TItem>(
  state: { items: TItem[]; windowStart: number },
  newItems: TItem[],
  maxWindow: number,
): void {
  const combined = [...state.items, ...newItems];
  if (combined.length > maxWindow) {
    const dropped = combined.length - maxWindow;
    state.items = combined.slice(dropped);
    state.windowStart += dropped;
  } else {
    state.items = combined;
  }
}

// ---------------------------------------------------------------------------
// Factory config
// ---------------------------------------------------------------------------

type FetchArg = {
  page?: number;
  per_page?: number;
  search?: string;
  append?: boolean;
  extras?: ListParams['extras'];
};

/**
 * Hàm fetch được truyền vào factory.
 * Phải trả về `ApiEnvelope<TItem[]>` — khớp với `createApiService().getList`.
 */
type FetchFn<TItem> = (params: ListParams) => Promise<ApiEnvelope<TItem[]>>;

export type CreateListSliceConfig<TItem> = {
  /** Tên Redux slice — phải duy nhất toàn app (vd. `'customerList'`). */
  name: string;
  /**
   * Key trong Redux root state tương ứng với slice này.
   * Dùng để `getState()` đọc page/perPage hiện tại.
   * @example `'customerList'` nếu store.customerList = customerListReducer
   */
  stateKey: string;
  /** Hàm gọi API danh sách — thường là `customerService.getList`. */
  fetchFn: FetchFn<TItem>;
  /** Số item tối đa giữ trong bộ nhớ (virtual window). Mặc định: 100. */
  maxWindow?: number;
  /** Số item mỗi trang mặc định. Mặc định: 15. */
  defaultPerPage?: number;
  /** Thông báo lỗi khi fetch thất bại. */
  errorMessage?: string;
  /**
   * Danh sách action creator dùng để reset state về `initialState`.
   * Thường là `[logout.fulfilled, logout.rejected]`.
   */
  resetOn?: Array<{ type: string }>;
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Tạo Redux slice cho danh sách phân trang với search + load-more + windowing.
 *
 * @example
 * // customerListSlice.ts
 * import { createListSlice } from '@shared/services/core/createListSlice';
 * import { customerService } from './customerAPI';
 * import { logout } from '@services/auth/authSlice';
 *
 * export const {
 *   fetchList: fetchCustomerList,
 *   setSearch: setCustomerListSearch,
 *   reducer: customerListReducer,
 * } = createListSlice({
 *   name: 'customerList',
 *   stateKey: 'customerList',
 *   fetchFn: customerService.getList,
 *   errorMessage: 'Không tải được khách hàng',
 *   resetOn: [logout.fulfilled, logout.rejected],
 * });
 */
export function createListSlice<TItem, TMeta extends PaginationMeta = PaginationMeta>(
  config: CreateListSliceConfig<TItem>,
) {
  const {
    name,
    stateKey,
    fetchFn,
    maxWindow = 100,
    defaultPerPage = 15,
    errorMessage = 'Lỗi tải dữ liệu',
    resetOn = [],
  } = config;

  type State = ListSliceState<TItem, TMeta>;
  type RootShape = Record<string, State>;

  const initialState: State = {
    items: [],
    meta: null,
    loading: false,
    refreshing: false,
    error: null,
    listPage: 1,
    listPerPage: defaultPerPage,
    listSearch: '',
    loadingMore: false,
    windowStart: 0,
  };

  const fetchList = createAsyncThunk(
    `${name}/fetch`,
    async (arg: FetchArg | undefined, { getState, rejectWithValue }) => {
      try {
        const st = (getState() as RootShape)[stateKey] ?? initialState;
        const page = arg?.page ?? st.listPage;
        const per_page = arg?.per_page ?? st.listPerPage;
        const search =
          arg?.search !== undefined ? arg.search : st.listSearch.trim() || undefined;
        const extras = arg?.extras;

        const res = await fetchFn({ page, per_page, search, extras });

        if (!res.success) {
          return rejectWithValue(
            typeof res.message === 'string' ? res.message : errorMessage,
          );
        }
        return {
          items: res.data ?? [],
          meta: (res.meta ?? null) as TMeta | null,
          searchApplied: search ?? '',
          append: arg?.append === true,
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : errorMessage;
        return rejectWithValue(msg);
      }
    },
  );

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setSearch(state, action: PayloadAction<string>) {
        state.listSearch = action.payload;
      },
      resetList: () => ({ ...initialState }),
    },
    extraReducers: builder => {
      builder
        .addCase(fetchList.pending, (state, action) => {
          if (action.meta.arg?.append === true) {
            state.loadingMore = true;
          } else {
            markListFetchPending(state);
          }
        })
        .addCase(fetchList.fulfilled, (state, action) => {
          markListFetchSettled(state);
          state.loadingMore = false;
          state.error = null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (state as any).meta = action.payload.meta;
          state.listSearch = action.payload.searchApplied;
          const m = action.payload.meta;
          if (m) {
            state.listPage = m.current_page;
            state.listPerPage = m.per_page;
          }
          if (action.payload.append) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            applyWindowedAppend(state as any, action.payload.items as any[], maxWindow);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (state as any).items = action.payload.items;
            state.windowStart = 0;
          }
        })
        .addCase(fetchList.rejected, (state, action) => {
          markListFetchSettled(state);
          state.loadingMore = false;
          state.error =
            typeof action.payload === 'string' ? action.payload : errorMessage;
          if (!action.meta.arg?.append) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (state as any).items = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (state as any).meta = null;
          }
        });

      for (const actionCreator of resetOn) {
        builder.addCase(actionCreator.type, () => ({ ...initialState }));
      }
    },
  });

  return {
    /** Async thunk để fetch/refetch/load-more danh sách. */
    fetchList,
    /** Action set search string (dùng với debounce ở màn hình). */
    setSearch: slice.actions.setSearch,
    /** Action reset toàn bộ state về initialState. */
    resetList: slice.actions.resetList,
    /** Reducer đăng ký vào store. */
    reducer: slice.reducer,
    /** initialState — dùng khi cần so sánh hoặc reset thủ công. */
    initialState,
  };
}
