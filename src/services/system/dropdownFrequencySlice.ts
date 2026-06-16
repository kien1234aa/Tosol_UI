import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DropdownOptionValue = string | number;
export type DropdownAccountKey = string | number;

type DropdownSelectionCounts = Record<string, number>;
type DropdownSelectionsByDropdown = Record<string, DropdownSelectionCounts>;
type DropdownSelectionsByAccount = Record<string, DropdownSelectionsByDropdown>;

export type DropdownRecentSelection<TData = unknown> = {
  value: DropdownOptionValue;
  label: string;
  subtitle?: string | null;
  data?: TData;
  count: number;
  selectedAt: number;
};

type DropdownRecentSelections = DropdownRecentSelection[];
type DropdownRecentSelectionsByDropdown = Record<
  string,
  DropdownRecentSelections
>;
type DropdownRecentSelectionsByAccount = Record<
  string,
  DropdownRecentSelectionsByDropdown
>;

export type DropdownFrequencyState = {
  selectionsByDropdown: DropdownSelectionsByDropdown;
  selectionsByAccount: DropdownSelectionsByAccount;
  recentSelectionsByDropdown: DropdownRecentSelectionsByDropdown;
  recentSelectionsByAccount: DropdownRecentSelectionsByAccount;
};

type RecordSelectionPayload = {
  dropdownKey: string;
  optionValue: DropdownOptionValue;
  accountKey?: string | null;
};

type RecordRecentSelectionPayload = {
  dropdownKey: string;
  option: {
    value: DropdownOptionValue;
    label: string;
    subtitle?: string | null;
    data?: unknown;
  };
  selectedAt: number;
  accountKey?: string | null;
};

const initialState: DropdownFrequencyState = {
  selectionsByDropdown: {},
  selectionsByAccount: {},
  recentSelectionsByDropdown: {},
  recentSelectionsByAccount: {},
};

const MAX_RECENT_SELECTIONS = 10;

export function toDropdownOptionKey(value: DropdownOptionValue) {
  return String(value);
}

export function toDropdownAccountKey(value?: DropdownAccountKey | null) {
  if (value == null) {
    return null;
  }
  const key = String(value).trim();
  return key.length > 0 ? key : null;
}

function upsertRecentSelection(
  list: DropdownRecentSelections | undefined,
  payload: RecordRecentSelectionPayload,
): DropdownRecentSelections {
  const optionKey = toDropdownOptionKey(payload.option.value);
  const existing = (list ?? []).find(
    item => toDropdownOptionKey(item.value) === optionKey,
  );
  const rest = (list ?? []).filter(
    item => toDropdownOptionKey(item.value) !== optionKey,
  );
  const label = payload.option.label.trim();
  const next: DropdownRecentSelection = {
    value: payload.option.value,
    label: label.length > 0 ? label : optionKey,
    subtitle: payload.option.subtitle ?? null,
    data: payload.option.data,
    count: (existing?.count ?? 0) + 1,
    selectedAt: payload.selectedAt,
  };

  return [next, ...rest]
    .sort((left, right) => {
      const byCount = right.count - left.count;
      return byCount !== 0 ? byCount : right.selectedAt - left.selectedAt;
    })
    .slice(0, MAX_RECENT_SELECTIONS);
}

const dropdownFrequencySlice = createSlice({
  name: 'dropdownFrequency',
  initialState,
  reducers: {
    recordSelection: {
      reducer(
        state,
        action: PayloadAction<RecordSelectionPayload>,
      ): DropdownFrequencyState {
        const { dropdownKey, optionValue, accountKey } = action.payload;
        const optionKey = toDropdownOptionKey(optionValue);
        const scopedAccountKey = toDropdownAccountKey(accountKey);
        const selectionsByDropdown = state.selectionsByDropdown ?? {};
        const selectionsByAccount = state.selectionsByAccount ?? {};

        // Return new objects so the update is explicit and easy to persist.
        if (scopedAccountKey != null) {
          const accountSelections = selectionsByAccount[scopedAccountKey] ?? {};
          const dropdownCounts = accountSelections[dropdownKey] ?? {};

          return {
            ...state,
            selectionsByAccount: {
              ...selectionsByAccount,
              [scopedAccountKey]: {
                ...accountSelections,
                [dropdownKey]: {
                  ...dropdownCounts,
                  [optionKey]: (dropdownCounts[optionKey] ?? 0) + 1,
                },
              },
            },
          };
        }

        const dropdownCounts = selectionsByDropdown[dropdownKey] ?? {};

        return {
          ...state,
          selectionsByDropdown: {
            ...selectionsByDropdown,
            [dropdownKey]: {
              ...dropdownCounts,
              [optionKey]: (dropdownCounts[optionKey] ?? 0) + 1,
            },
          },
        };
      },
      prepare(
        dropdownKey: string,
        optionValue: DropdownOptionValue,
        accountKey?: DropdownAccountKey | null,
      ) {
        return {
          payload: {
            dropdownKey,
            optionValue,
            accountKey: toDropdownAccountKey(accountKey),
          },
        };
      },
    },
    recordRecentSelection: {
      reducer(
        state,
        action: PayloadAction<RecordRecentSelectionPayload>,
      ): DropdownFrequencyState {
        const { dropdownKey, accountKey } = action.payload;
        const scopedAccountKey = toDropdownAccountKey(accountKey);
        const recentSelectionsByDropdown =
          state.recentSelectionsByDropdown ?? {};
        const recentSelectionsByAccount =
          state.recentSelectionsByAccount ?? {};

        if (scopedAccountKey != null) {
          const accountSelections =
            recentSelectionsByAccount[scopedAccountKey] ?? {};
          return {
            ...state,
            recentSelectionsByAccount: {
              ...recentSelectionsByAccount,
              [scopedAccountKey]: {
                ...accountSelections,
                [dropdownKey]: upsertRecentSelection(
                  accountSelections[dropdownKey],
                  action.payload,
                ),
              },
            },
          };
        }

        return {
          ...state,
          recentSelectionsByDropdown: {
            ...recentSelectionsByDropdown,
            [dropdownKey]: upsertRecentSelection(
              recentSelectionsByDropdown[dropdownKey],
              action.payload,
            ),
          },
        };
      },
      prepare(
        dropdownKey: string,
        option: RecordRecentSelectionPayload['option'],
        accountKey?: DropdownAccountKey | null,
      ) {
        return {
          payload: {
            dropdownKey,
            option,
            accountKey: toDropdownAccountKey(accountKey),
            selectedAt: Date.now(),
          },
        };
      },
    },
  },
});

export const { recordRecentSelection, recordSelection } =
  dropdownFrequencySlice.actions;
export default dropdownFrequencySlice.reducer;
