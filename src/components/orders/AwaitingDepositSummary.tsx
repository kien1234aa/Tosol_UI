import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { awaitingDepositCopy } from '@/src/configs/orders';
import { formatOrderPrice } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonContentCenter,
  buttonLabelStyle,
} from '@/src/configs/theme/buttonLayout';
import type { AwaitingDepositTotals } from '@/src/types/orders/awaitingDeposit.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface AwaitingDepositSummaryProps {
  totals: AwaitingDepositTotals;
  availableBalanceVnd: number;
  allSelected: boolean;
  onDeposit: () => void;
  onCancel: () => void;
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

function AwaitingDepositSummaryComponent({
  totals,
  availableBalanceVnd,
  allSelected,
  onDeposit,
  onCancel,
  onToggleSelectAll,
}: AwaitingDepositSummaryProps) {
  const hasSelection = totals.selectedCount > 0;
  const selectAllLabel = allSelected
    ? awaitingDepositCopy.deselectAll
    : awaitingDepositCopy.selectAll;

  return (
    <Box style={styles.card}>
      <HStack className="w-full items-start" space="sm">
        <Stat
          label={awaitingDepositCopy.totalGoodsLabel}
          value={formatOrderPrice(totals.goodsVnd)}
          valueColor={lightTokens.error500}
        />
        <Stat
          label={awaitingDepositCopy.totalDepositLabel}
          value={formatOrderPrice(totals.payableVnd)}
          valueColor={lightTokens.error500}
        />
        <Stat
          label={awaitingDepositCopy.availableBalanceLabel}
          value={formatOrderPrice(availableBalanceVnd)}
          valueColor={SUCCESS_COLOR}
        />
      </HStack>

      <HStack className="mt-4 w-full" space="sm">
        <Pressable
          onPress={onDeposit}
          disabled={!hasSelection}
          accessibilityRole="button"
          accessibilityLabel={awaitingDepositCopy.deposit}
          style={[
            styles.actionButton,
            styles.depositButton,
            !hasSelection && styles.buttonDisabled,
          ]}>
          <Text
            size="sm"
            numberOfLines={1}
            className="font-semibold text-typography-0"
            style={buttonLabelStyle}>
            {awaitingDepositCopy.deposit} ({totals.selectedCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={onCancel}
          disabled={!hasSelection}
          accessibilityRole="button"
          accessibilityLabel={awaitingDepositCopy.cancel}
          style={[
            styles.actionButton,
            styles.neutralButton,
            !hasSelection && styles.buttonDisabled,
          ]}>
          <Text
            size="sm"
            numberOfLines={1}
            className="font-semibold text-typography-900"
            style={buttonLabelStyle}>
            {awaitingDepositCopy.cancel} ({totals.selectedCount})
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
  depositButton: {
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

export const AwaitingDepositSummary = memo(AwaitingDepositSummaryComponent);
