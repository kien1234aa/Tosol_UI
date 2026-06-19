import React, { memo, useCallback, useState } from 'react';
import {
  Modal,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Check, RotateCcw, SlidersHorizontal, X } from 'lucide-react-native';
import {
  EMPTY_ORDER_ADVANCED_FILTERS,
  findFilterOptionLabel,
  normalizeOrderAdvancedFilters,
  orderAdvancedFilterCopy,
  orderIssueFilterOptions,
  orderPaymentFilterOptions,
  orderStatusFilterOptions,
} from '@/src/configs/orders/orderFilters.constants';
import {
  buttonContentCenter,
  buttonLabelStyle,
  lightTokens,
} from '@/src/configs/theme';
import { isValidIsoDateRange } from '@/src/helpers/orders/orderFilters.helpers';
import type { OrderAdvancedFilters } from '@/src/types/orders/orderFilters.types';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import {
  OrderFilterDateField,
  OrderFilterDatePickerSheet,
} from './OrderFilterDateField';
import { OrderFilterSelectField } from './OrderFilterSelectField';

interface OrderAdvancedFilterModalProps {
  visible: boolean;
  appliedFilters: OrderAdvancedFilters;
  onClose: () => void;
  onApply: (filters: OrderAdvancedFilters) => void;
}

interface OrderAdvancedFilterFormProps {
  appliedFilters: OrderAdvancedFilters;
  onClose: () => void;
  onApply: (filters: OrderAdvancedFilters) => void;
}

type ActiveDateField = 'dateFrom' | 'dateTo' | null;

function OrderAdvancedFilterForm({
  appliedFilters,
  onClose,
  onApply,
}: OrderAdvancedFilterFormProps) {
  const [draft, setDraft] = useState<OrderAdvancedFilters>(appliedFilters);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeDateField, setActiveDateField] = useState<ActiveDateField>(null);

  const handleReset = useCallback(() => {
    setDraft(EMPTY_ORDER_ADVANCED_FILTERS);
    setValidationError(null);
    setActiveDateField(null);
  }, []);

  const closeDatePicker = useCallback(() => {
    setActiveDateField(null);
  }, []);

  const handleApply = useCallback(() => {
    const next = normalizeOrderAdvancedFilters(draft);

    if (!isValidIsoDateRange(next.dateFrom, next.dateTo)) {
      setValidationError(orderAdvancedFilterCopy.invalidDateRange);
      return;
    }

    onApply(next);
    onClose();
  }, [draft, onApply, onClose]);

  const activeDateLabel =
    activeDateField === 'dateFrom'
      ? orderAdvancedFilterCopy.dateFromLabel
      : activeDateField === 'dateTo'
        ? orderAdvancedFilterCopy.dateToLabel
        : '';

  const activeDateValue =
    activeDateField === 'dateFrom'
      ? draft.dateFrom
      : activeDateField === 'dateTo'
        ? draft.dateTo
        : '';

  const handleApplyDate = useCallback(
    (isoDate: string) => {
      setValidationError(null);

      if (activeDateField === 'dateFrom') {
        setDraft(current => ({ ...current, dateFrom: isoDate }));
      } else if (activeDateField === 'dateTo') {
        setDraft(current => ({ ...current, dateTo: isoDate }));
      }

      setActiveDateField(null);
    },
    [activeDateField],
  );

  return (
    <View style={styles.formRoot}>
      <HStack style={styles.header}>
        <HStack className="items-center gap-2">
          <SlidersHorizontal color={lightTokens.typography900} size={18} />
          <Text size="md" className="font-semibold text-typography-900">
            {orderAdvancedFilterCopy.title}
          </Text>
        </HStack>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={orderAdvancedFilterCopy.cancel}
          style={styles.closeButton}>
          <X color={lightTokens.typography500} size={20} />
        </Pressable>
      </HStack>

      <View style={styles.divider} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <HStack className="items-start gap-3">
              <OrderFilterSelectField
                label={orderAdvancedFilterCopy.statusLabel}
                value={findFilterOptionLabel(
                  orderStatusFilterOptions,
                  draft.status,
                )}
                options={orderStatusFilterOptions}
                selectedValue={draft.status}
                placeholder={orderAdvancedFilterCopy.allOption}
                pickerTitle={orderAdvancedFilterCopy.selectStatus}
                onSelect={status =>
                  setDraft(current => ({ ...current, status }))
                }
              />
              <OrderFilterSelectField
                label={orderAdvancedFilterCopy.paymentLabel}
                value={findFilterOptionLabel(
                  orderPaymentFilterOptions,
                  draft.paymentStatus,
                )}
                options={orderPaymentFilterOptions}
                selectedValue={draft.paymentStatus}
                placeholder={orderAdvancedFilterCopy.allOption}
                pickerTitle={orderAdvancedFilterCopy.selectPayment}
                onSelect={paymentStatus =>
                  setDraft(current => ({ ...current, paymentStatus }))
                }
              />
            </HStack>

            <View style={styles.rowSpacing}>
              <OrderFilterSelectField
                label={orderAdvancedFilterCopy.issueLabel}
                value={findFilterOptionLabel(
                  orderIssueFilterOptions,
                  draft.hasIssue,
                )}
                options={orderIssueFilterOptions}
                selectedValue={draft.hasIssue}
                placeholder={orderAdvancedFilterCopy.allOption}
                pickerTitle={orderAdvancedFilterCopy.selectIssue}
                onSelect={hasIssue =>
                  setDraft(current => ({
                    ...current,
                    hasIssue: hasIssue as OrderAdvancedFilters['hasIssue'],
                  }))
                }
              />
            </View>

            <View style={styles.rowSpacing}>
              <HStack className="items-start gap-3">
                <OrderFilterDateField
                  label={orderAdvancedFilterCopy.dateFromLabel}
                  value={draft.dateFrom}
                  onPress={() => setActiveDateField('dateFrom')}
                />
                <OrderFilterDateField
                  label={orderAdvancedFilterCopy.dateToLabel}
                  value={draft.dateTo}
                  onPress={() => setActiveDateField('dateTo')}
                />
              </HStack>
            </View>

            {validationError ? (
              <Text size="xs" className="mt-3 text-error-500">
                {validationError}
              </Text>
            ) : null}
      </ScrollView>

      <View style={styles.divider} />

      <HStack style={styles.footer}>
        <Pressable
          onPress={handleReset}
          accessibilityRole="button"
          style={styles.resetButton}>
          <HStack className="items-center gap-1.5">
            <RotateCcw color={lightTokens.typography900} size={16} />
            <Text size="sm" className="font-medium text-typography-700">
              {orderAdvancedFilterCopy.reset}
            </Text>
          </HStack>
        </Pressable>

        <HStack className="items-center gap-2">
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={styles.cancelButton}>
            <Text size="sm" className="font-medium text-typography-700">
              {orderAdvancedFilterCopy.cancel}
            </Text>
          </Pressable>

          <RNPressable
            onPress={handleApply}
            accessibilityRole="button"
            style={[styles.applyButton, buttonContentCenter]}>
            <Check color={lightTokens.typography0} size={16} />
            <Text
              size="sm"
              className="font-semibold text-typography-0"
              style={buttonLabelStyle}>
              {orderAdvancedFilterCopy.apply}
            </Text>
          </RNPressable>
        </HStack>
      </HStack>

      {activeDateField ? (
        <OrderFilterDatePickerSheet
          label={activeDateLabel}
          value={activeDateValue}
          onApply={handleApplyDate}
          onClose={closeDatePicker}
        />
      ) : null}
    </View>
  );
}

function orderAdvancedFiltersKey(filters: OrderAdvancedFilters): string {
  return JSON.stringify(filters);
}

function OrderAdvancedFilterModalComponent({
  visible,
  appliedFilters,
  onClose,
  onApply,
}: OrderAdvancedFilterModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <RNPressable style={styles.overlay} onPress={onClose}>
        <RNPressable style={styles.modal} onPress={() => {}}>
          {visible ? (
            <OrderAdvancedFilterForm
              key={orderAdvancedFiltersKey(appliedFilters)}
              appliedFilters={appliedFilters}
              onClose={onClose}
              onApply={onApply}
            />
          ) : null}
        </RNPressable>
      </RNPressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    maxHeight: '88%',
    borderRadius: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    overflow: 'hidden',
  },
  formRoot: {
    position: 'relative',
    maxHeight: '100%',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: lightTokens.outline100,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowSpacing: {
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  resetButton: {
    minHeight: 40,
    justifyContent: 'center',
  },
  cancelButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  applyButton: {
    gap: 6,
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: lightTokens.tertiary500,
  },
});

export const OrderAdvancedFilterModal = memo(OrderAdvancedFilterModalComponent);
