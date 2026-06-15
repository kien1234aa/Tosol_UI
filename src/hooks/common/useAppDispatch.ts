import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/src/redux/store';

/** Typed dispatch hook — use instead of the untyped `useDispatch`. */
export const useAppDispatch = () => useDispatch<AppDispatch>();
