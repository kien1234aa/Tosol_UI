import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  ArrowLeftRight,
  CreditCard,
  DollarSign,
  FileMinus2,
  Truck,
  type LucideIcon,
} from 'lucide-react-native';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import type {
  QuickActionItem,
  QuickActionKey,
} from '@/src/types/home/home.types';
import { QuickActionCard } from './QuickActionCard';

const QUICK_ACTION_ICONS: Record<QuickActionKey, LucideIcon> = {
  walletTopup: CreditCard,
  costEstimate: DollarSign,
  transactionHistory: ArrowLeftRight,
  complaints: FileMinus2,
  deliveryRequest: Truck,
};

const GRID_GAP = 12;

function pairRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }
  return rows;
}

interface QuickActionsSectionProps {
  title: string;
  items: QuickActionItem[];
  onPressItem?: (key: QuickActionKey) => void;
}

function QuickActionsSectionComponent({
  title,
  items,
  onPressItem,
}: QuickActionsSectionProps) {
  const rows = useMemo(() => pairRows(items), [items]);

  const handlePress = useCallback(
    (key: QuickActionKey) => () => onPressItem?.(key),
    [onPressItem],
  );

  return (
    <VStack className="w-full" space="md">
      <Text size="lg" className="font-bold text-typography-900">
        {title}
      </Text>

      <VStack className="w-full" style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <HStack key={`quick-action-row-${rowIndex}`} style={styles.row}>
            {row.map(item => (
              <Box key={item.key} style={styles.cell}>
                <QuickActionCard
                  label={item.label}
                  icon={QUICK_ACTION_ICONS[item.key]}
                  onPress={handlePress(item.key)}
                />
              </Box>
            ))}
            {row.length === 1 ? <Box style={styles.cell} /> : null}
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
    width: '100%',
  },
  cell: {
    flex: 1,
  },
});

export const QuickActionsSection = memo(QuickActionsSectionComponent);
