import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/src/store';

/** Typed dispatch hook — use instead of the untyped `useDispatch`. */
export const useAppDispatch = () => useDispatch<AppDispatch>();
