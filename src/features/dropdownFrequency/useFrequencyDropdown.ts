import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  makeSelectSortedDropdownOptions,
  type FrequencyDropdownOption,
} from './dropdownFrequencySelectors';
import {
  recordSelection,
  type DropdownAccountKey,
  type DropdownOptionValue,
} from '@services/system/dropdownFrequencySlice';

export type { FrequencyDropdownOption };

export function useFrequencyDropdown<TOption extends FrequencyDropdownOption>(
  dropdownKey: string,
  allOptions: readonly TOption[],
  accountKey?: DropdownAccountKey | null,
): {
  sortedOptions: TOption[];
  handleSelect: (optionValue: TOption['value']) => void;
} {
  const dispatch = useAppDispatch();

  // Each hook instance owns a memoized selector cache for its dropdown/options.
  const selectSortedOptions = useMemo(
    () => makeSelectSortedDropdownOptions<TOption>(),
    [],
  );

  const sortedOptions = useAppSelector(state =>
    selectSortedOptions(state, dropdownKey, allOptions, accountKey),
  );

  const handleSelect = useCallback(
    (optionValue: DropdownOptionValue) => {
      dispatch(recordSelection(dropdownKey, optionValue, accountKey));
    },
    [dispatch, dropdownKey, accountKey],
  );

  return {
    sortedOptions,
    handleSelect,
  };
}
