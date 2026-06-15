import { useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@/src/store';

/** Typed selector hook — use instead of the untyped `useSelector`. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
