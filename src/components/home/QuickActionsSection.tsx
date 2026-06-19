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
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
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

function chunkItems<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns));
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
  const { quickActionColumns, gridGap } = useResponsiveLayout();
  const rows = useMemo(
    () => chunkItems(items, quickActionColumns),
    [items, quickActionColumns],
  );

  const handlePress = useCallback(
    (key: QuickActionKey) => () => onPressItem?.(key),
    [onPressItem],
  );

  return (
    <VStack className="w-full" space="md">
      <Text size="lg" className="font-bold text-typography-900">
        {title}
      </Text>

      <VStack className="w-full" style={{ gap: gridGap }}>
        {rows.map((row, rowIndex) => (
          <HStack key={`quick-action-row-${rowIndex}`} style={{ gap: gridGap }}>
            {row.map(item => (
              <Box key={item.key} style={styles.cell}>
                <QuickActionCard
                  label={item.label}
                  icon={QUICK_ACTION_ICONS[item.key]}
                  onPress={handlePress(item.key)}
                />
              </Box>
            ))}
            {row.length < quickActionColumns
              ? Array.from({ length: quickActionColumns - row.length }, (_, i) => (
                  <Box key={`quick-action-spacer-${rowIndex}-${i}`} style={styles.cell} />
                ))
              : null}
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
  },
});

export const QuickActionsSection = memo(QuickActionsSectionComponent);
