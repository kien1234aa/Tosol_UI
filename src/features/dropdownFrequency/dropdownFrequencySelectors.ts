import { createSelector } from 'reselect';
import type { RootState } from '../../app/store';
import type {
  DropdownAccountKey,
  DropdownOptionValue,
} from '@services/system/dropdownFrequencySlice';
import {
  toDropdownAccountKey,
  toDropdownOptionKey,
} from '@services/system/dropdownFrequencySlice';

export type FrequencyDropdownOption = {
  value: DropdownOptionValue;
};

const EMPTY_SELECTION_COUNTS: Record<string, number> = {};
const EMPTY_SELECTIONS_BY_ACCOUNT: Record<
  string,
  Record<string, Record<string, number>>
> = {};
const EMPTY_SELECTIONS_BY_DROPDOWN: Record<string, Record<string, number>> = {};

const selectSelectionsByDropdown = (state: RootState) =>
  state.dropdownFrequency.selectionsByDropdown ?? EMPTY_SELECTIONS_BY_DROPDOWN;

const selectSelectionsByAccount = (state: RootState) =>
  state.dropdownFrequency.selectionsByAccount ?? EMPTY_SELECTIONS_BY_ACCOUNT;

const selectDropdownKey = (_state: RootState, dropdownKey: string) =>
  dropdownKey;

const selectAllOptions = <TOption extends FrequencyDropdownOption>(
  _state: RootState,
  _dropdownKey: string,
  allOptions: readonly TOption[],
  _accountKey?: DropdownAccountKey | null,
) => allOptions;

const selectAccountKey = (
  _state: RootState,
  _dropdownKey: string,
  _allOptions: readonly FrequencyDropdownOption[],
  accountKey?: DropdownAccountKey | null,
) => toDropdownAccountKey(accountKey);

export function makeSelectSortedDropdownOptions<
  TOption extends FrequencyDropdownOption,
>() {
  return createSelector(
    [
      selectSelectionsByDropdown,
      selectSelectionsByAccount,
      selectDropdownKey,
      selectAllOptions<TOption>,
      selectAccountKey,
    ],
    (
      selectionsByDropdown,
      selectionsByAccount,
      dropdownKey,
      allOptions,
      accountKey,
    ): TOption[] => {
      const dropdownCounts =
        accountKey == null
          ? selectionsByDropdown[dropdownKey] ?? EMPTY_SELECTION_COUNTS
          : selectionsByAccount[accountKey]?.[dropdownKey] ??
            EMPTY_SELECTION_COUNTS;

      // Sort by recorded frequency while preserving the original order for ties.
      return allOptions.slice().sort((left, right) => {
        const leftCount = dropdownCounts[toDropdownOptionKey(left.value)] ?? 0;
        const rightCount = dropdownCounts[toDropdownOptionKey(right.value)] ?? 0;

        return rightCount - leftCount;
      });
    },
  );
}

export const selectSortedDropdownOptions =
  makeSelectSortedDropdownOptions<FrequencyDropdownOption>();
