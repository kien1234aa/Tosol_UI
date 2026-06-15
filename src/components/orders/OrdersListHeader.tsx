import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { ordersCopy } from '@/src/configs/orders';
import { lightTokens } from '@/src/configs/theme';
import { StackHeader } from '@/src/components/main';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface OrdersListHeaderProps {
  onPressFilter: () => void;
}

function OrdersListHeaderComponent({ onPressFilter }: OrdersListHeaderProps) {
  return (
    <StackHeader
      title={ordersCopy.title}
      rightAction={
        <Pressable
          onPress={onPressFilter}
          accessibilityRole="button"
          accessibilityLabel={ordersCopy.filter}
          style={styles.filterButton}>
          <VStack className="items-center" space="xs">
            <SlidersHorizontal color={lightTokens.typography900} size={20} />
            <Text size="xs" className="text-typography-600">
              {ordersCopy.filter}
            </Text>
          </VStack>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
});

export const OrdersListHeader = memo(OrdersListHeaderComponent);
