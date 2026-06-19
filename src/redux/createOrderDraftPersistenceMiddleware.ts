import { isAnyOf, type Middleware } from '@reduxjs/toolkit';
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

async function persistDraftForUser(
  userId: string,
  draft: RootState['createOrderDraft'],
): Promise<void> {
  await createOrderDraftStorage.save(userId, draft);
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
      store.dispatch(resetDraftState());
      return result;
    }

    if (
      loginThunk.fulfilled.match(action) ||
      restoreSessionThunk.fulfilled.match(action)
    ) {
      const userId = action.payload.user.id;
      void restoreDraftForUser(userId, store.dispatch);
      return result;
    }

    if (draftMutationActions(action)) {
      const { auth, createOrderDraft } = store.getState();
      const userId = auth.user?.id;

      if (auth.status === 'authenticated' && userId) {
        void persistDraftForUser(userId, createOrderDraft);
      }
    }

    return result;
  };
