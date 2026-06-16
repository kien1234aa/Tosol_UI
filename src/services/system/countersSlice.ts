import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { CountersData } from '@services/system/countersApi';
import {
  fetchCounters,
  persistUnreadBadgeFromCountersData,
} from '@services/system/countersApi';

export const refreshCounters = createAsyncThunk(
  'counters/refresh',
  async (_: void, { signal }) => {
    const data = await fetchCounters(signal);
    const badge = await persistUnreadBadgeFromCountersData(data);
    return { data, badge } as {
      data: CountersData | null;
      badge: number | null;
    };
  },
);

type CountersState = {
  data: CountersData | null;
  unreadBadge: number;
  loading: boolean;
};

const initialState: CountersState = {
  data: null,
  unreadBadge: 0,
  loading: false,
};

const countersSlice = createSlice({
  name: 'counters',
  initialState,
  reducers: {
    resetCounters() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(refreshCounters.pending, state => {
        state.loading = true;
      })
      .addCase(refreshCounters.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        if (action.payload.badge != null) {
          state.unreadBadge = action.payload.badge;
        }
      })
      .addCase(refreshCounters.rejected, state => {
        state.loading = false;
      });
  },
});

export const { resetCounters } = countersSlice.actions;
export default countersSlice.reducer;
