import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { awaitingPaymentCopy } from '@/src/configs/orders';
import { formatOrderPrice } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonContentCenter,
  buttonLabelStyle,
} from '@/src/configs/theme/buttonLayout';
import type { AwaitingPaymentTotals } from '@/src/types/orders/awaitingPayment.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface AwaitingPaymentSummaryProps {
  totals: AwaitingPaymentTotals;
  availableBalanceVnd: number;
  allSelected: boolean;
  onPay: () => void;
  onToggleSelectAll: () => void;
}

interface StatProps {
  label: string;
  value: string;
  valueColor: string;
}

function Stat({ label, value, valueColor }: StatProps) {
  return (
    <VStack className="flex-1" space="xs">
      <Text size="xs" className="text-typography-500">
        {label}
      </Text>
      <Text
        size="md"
        numberOfLines={1}
        className="font-bold"
        style={{ color: valueColor }}>
        {value}
      </Text>
    </VStack>
  );
}

function AwaitingPaymentSummaryComponent({
  totals,
  availableBalanceVnd,
  allSelected,
  onPay,
  onToggleSelectAll,
}: AwaitingPaymentSummaryProps) {
  const hasSelection = totals.selectedCount > 0;
  const selectAllLabel = allSelected
    ? awaitingPaymentCopy.deselectAll
    : awaitingPaymentCopy.selectAll;

  return (
    <Box style={styles.card}>
      <HStack className="w-full items-start" space="md">
        <Stat
          label={awaitingPaymentCopy.totalPayableLabel}
          value={formatOrderPrice(totals.payableVnd)}
          valueColor={lightTokens.error500}
        />
        <Stat
          label={awaitingPaymentCopy.availableBalanceLabel}
          value={formatOrderPrice(availableBalanceVnd)}
          valueColor={SUCCESS_COLOR}
        />
      </HStack>

      <HStack className="mt-4 w-full" space="sm">
        <Pressable
          onPress={onPay}
          disabled={!hasSelection}
          accessibilityRole="button"
          accessibilityLabel={awaitingPaymentCopy.pay}
          style={[
            styles.actionButton,
            styles.payButton,
            !hasSelection && styles.buttonDisabled,
          ]}>
          <Text
            size="sm"
            numberOfLines={1}
            className="font-semibold text-typography-0"
            style={buttonLabelStyle}>
            {awaitingPaymentCopy.pay} ({totals.selectedCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={onToggleSelectAll}
          accessibilityRole="button"
          accessibilityLabel={selectAllLabel}
          style={[styles.actionButton, styles.neutralButton]}>
          <Text
            size="sm"
            numberOfLines={1}
            className="font-semibold text-typography-900"
            style={buttonLabelStyle}>
            {selectAllLabel}
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
}

const SUCCESS_COLOR = 'rgb(21, 128, 61)';

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 8,
    ...buttonContentCenter,
  },
  payButton: {
    backgroundColor: lightTokens.tertiary500,
  },
  neutralButton: {
    backgroundColor: lightTokens.background100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});

export const AwaitingPaymentSummary = memo(AwaitingPaymentSummaryComponent);
