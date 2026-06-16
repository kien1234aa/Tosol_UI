/** Redux list: skeleton chỉ khi chưa có item; refetch dùng `refreshing`. */
export type ListFetchFlags = {
  items: readonly unknown[];
  loading: boolean;
  refreshing: boolean;
  error?: string | null;
};

export function markListFetchPending(state: ListFetchFlags): void {
  if (state.error !== undefined) {
    state.error = null;
  }
  if (state.items.length === 0) {
    state.loading = true;
    state.refreshing = false;
  } else {
    state.loading = false;
    state.refreshing = true;
  }
}

export function markListFetchSettled(state: ListFetchFlags): void {
  state.loading = false;
  state.refreshing = false;
}

export type DirectoryFetchFlags = {
  directoryItems: readonly unknown[];
  directoryLoading: boolean;
  directoryRefreshing: boolean;
  directoryError?: string | null;
};

export function markDirectoryFetchPending(state: DirectoryFetchFlags): void {
  if (state.directoryError !== undefined) {
    state.directoryError = null;
  }
  if (state.directoryItems.length === 0) {
    state.directoryLoading = true;
    state.directoryRefreshing = false;
  } else {
    state.directoryLoading = false;
    state.directoryRefreshing = true;
  }
}

export function markDirectoryFetchSettled(state: DirectoryFetchFlags): void {
  state.directoryLoading = false;
  state.directoryRefreshing = false;
}
