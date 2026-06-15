import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { orderStatusLabels } from '@/src/configs/orders';
import { lightTokens } from '@/src/configs/theme';
import type { OrderStatus } from '@/src/types/orders/orders.types';
import { Box } from '@/src/uikits/box';
import { Text } from '@/src/uikits/text';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_STYLES: Record<
  OrderStatus,
  { backgroundColor: string; color: string }
> = {
  awaitingDeposit: {
    backgroundColor: lightTokens.tertiary100,
    color: lightTokens.tertiary600,
  },
  awaitingPayment: {
    backgroundColor: '#FFF4E5',
    color: '#B45309',
  },
  readyToShip: {
    backgroundColor: '#E8F7EE',
    color: '#15803D',
  },
  processing: {
    backgroundColor: lightTokens.background100,
    color: lightTokens.typography900,
  },
};

function OrderStatusBadgeComponent({ status }: OrderStatusBadgeProps) {
  const palette = STATUS_STYLES[status];

  return (
    <Box style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text
        size="xs"
        className="font-medium"
        style={{ color: palette.color }}>
        {orderStatusLabels[status]}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export const OrderStatusBadge = memo(OrderStatusBadgeComponent);
