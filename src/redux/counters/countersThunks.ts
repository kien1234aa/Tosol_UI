import { createAsyncThunk } from '@reduxjs/toolkit';
import { countersService } from '@/src/apis/counters';
import type { CountersData } from '@/src/types/counters/counters.types';
import type { RootState } from '../rootReducer';

export const fetchCountersThunk = createAsyncThunk<
  CountersData,
  { force?: boolean } | void,
  { rejectValue: string; state: RootState }
>(
  'counters/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await countersService.get();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể tải số lượng thông báo';
      return rejectWithValue(message);
    }
  },
  {
    condition: (arg, { getState }) => {
      const force = arg?.force === true;
      const { status } = getState().counters;

      if (status === 'loading' && !force) {
        return false;
      }

      return true;
    },
  },
);
