import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultSearchPlatform, mockSearchProducts } from '@/src/configs/search';
import type {
  SearchPlatformKey,
  SearchProduct,
} from '@/src/types/search/search.types';

export interface SearchState {
  query: string;
  selectedPlatform: SearchPlatformKey;
  products: SearchProduct[];
}

const initialState: SearchState = {
  query: '',
  selectedPlatform: defaultSearchPlatform,
  products: mockSearchProducts,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setSearchPlatform(state, action: PayloadAction<SearchPlatformKey>) {
      state.selectedPlatform = action.payload;
    },
    resetSearchState() {
      return initialState;
    },
  },
});

export const { setSearchQuery, setSearchPlatform, resetSearchState } =
  searchSlice.actions;
export const searchReducer = searchSlice.reducer;
