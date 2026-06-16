import type { RootState } from '@app/store';
import type { AppRole } from '../types/appRole';

/** Role hiệu lực — hiện tại luôn là 'seller'. */
export function selectNormalizedAppRole(_state: RootState): AppRole {
  return 'seller';
}
