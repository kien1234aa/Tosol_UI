import { isAnyOf, type Middleware, type MiddlewareAPI } from '@reduxjs/toolkit';
import { draftPersistDebounceMs } from '@/src/configs/createOrder/draft.constants';
import { createOrderDraftStorage } from '@/src/storage/createOrderDraft.storage';
import {
  addDraftProduct,
  createDraft,
  ensureDraftWithProduct,
  hydrateDraftState,
  removeDraft,
  removeAllDrafts,
  removeDraftGroup,
  removeDraftProduct,
  resetDraftState,
  setActiveDraftId,
  setDraftForm,
  setDraftGroupNote,
  toggleDraftGroupInsurance,
  toggleDraftGroupWoodPacking,
  updateDraftProductQuantity,
  updateDraftProductUnitPrice,
  updateDraftProductTaxRate,
} from './createOrderDraft/createOrderDraftSlice';
import { logout } from './login/authSlice';
import { loginThunk, restoreSessionThunk } from './login/authThunks';
import type { AppDispatch } from './store';
import type { RootState } from './rootReducer';

const draftMutationActions = isAnyOf(
  createDraft,
  removeDraft,
  removeAllDrafts,
  setActiveDraftId,
  setDraftForm,
  toggleDraftGroupInsurance,
  toggleDraftGroupWoodPacking,
  setDraftGroupNote,
  updateDraftProductQuantity,
  updateDraftProductUnitPrice,
  updateDraftProductTaxRate,
  removeDraftProduct,
  removeDraftGroup,
  addDraftProduct,
  ensureDraftWithProduct,
);

/** Ghi ngay — thao tác cấu trúc draft, không nên trễ. */
const immediateDraftPersistActions = isAnyOf(
  createDraft,
  removeDraft,
  removeAllDrafts,
  addDraftProduct,
  ensureDraftWithProduct,
  removeDraftProduct,
  removeDraftGroup,
);

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let persistStore: MiddlewareAPI<AppDispatch, RootState> | null = null;

function clearPersistTimer(): void {
  if (persistTimer != null) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
}

async function persistDraftForUser(
  userId: string,
  draft: RootState['createOrderDraft'],
): Promise<void> {
  await createOrderDraftStorage.save(userId, draft);
}

function flushPersistDraft(store: MiddlewareAPI<AppDispatch, RootState>): void {
  const { auth, createOrderDraft } = store.getState();
  const userId = auth.user?.id;

  if (auth.status === 'authenticated' && userId) {
    void persistDraftForUser(userId, createOrderDraft);
  }
}

function schedulePersistDraft(store: MiddlewareAPI<AppDispatch, RootState>): void {
  persistStore = store;
  clearPersistTimer();
  persistTimer = setTimeout(() => {
    persistTimer = null;
    if (persistStore) {
      flushPersistDraft(persistStore);
    }
  }, draftPersistDebounceMs);
}

async function restoreDraftForUser(
  userId: string,
  dispatch: AppDispatch,
): Promise<void> {
  const storedDraft = await createOrderDraftStorage.load(userId);

  if (storedDraft) {
    dispatch(hydrateDraftState(storedDraft));
    return;
  }

  dispatch(resetDraftState());
}

export const createOrderDraftPersistenceMiddleware: Middleware<{}, RootState> =
  store => next => action => {
    const result = next(action);

    if (logout.match(action)) {
      clearPersistTimer();
      persistStore = null;
      store.dispatch(resetDraftState());
      return result;
    }

    if (
      loginThunk.fulfilled.match(action) ||
      restoreSessionThunk.fulfilled.match(action)
    ) {
      clearPersistTimer();
      persistStore = null;
      const userId = action.payload.user.id;
      void restoreDraftForUser(userId, store.dispatch);
      return result;
    }

    if (draftMutationActions(action)) {
      const { auth } = store.getState();
      const userId = auth.user?.id;

      if (auth.status !== 'authenticated' || !userId) {
        return result;
      }

      if (immediateDraftPersistActions(action)) {
        clearPersistTimer();
        flushPersistDraft(store);
        return result;
      }

      schedulePersistDraft(store);
    }

    return result;
  };
