import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import {
  saleOrderPaymentStatusLabels,
  saleOrderStatusLabels,
} from '@/src/configs/orders';
import { formatOrderLabel } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import { Box } from '@/src/uikits/box';
import { Text } from '@/src/uikits/text';

interface OrderStatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  pending: {
    backgroundColor: '#FFF4E5',
    color: '#B45309',
  },
  confirmed: {
    backgroundColor: lightTokens.tertiary100,
    color: lightTokens.tertiary600,
  },
  packing: {
    backgroundColor: lightTokens.tertiary100,
    color: lightTokens.tertiary600,
  },
  shipping: {
    backgroundColor: '#E8F4FD',
    color: '#0369A1',
  },
  ready_to_ship: {
    backgroundColor: '#E8F7EE',
    color: '#15803D',
  },
  ready: {
    backgroundColor: '#E8F7EE',
    color: '#15803D',
  },
  delivered: {
    backgroundColor: '#E8F7EE',
    color: '#15803D',
  },
  cancelled: {
    backgroundColor: '#FEECEC',
    color: lightTokens.error500,
  },
};

const DEFAULT_STATUS_STYLE = {
  backgroundColor: lightTokens.background100,
  color: lightTokens.typography900,
};

function OrderStatusBadgeComponent({ status }: OrderStatusBadgeProps) {
  const palette = STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE;
  const label = saleOrderStatusLabels[status] ?? status;

  return (
    <Box style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text
        size="xs"
        className="font-medium"
        style={{ color: palette.color }}>
        {label}
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
  paymentBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: lightTokens.background100,
  },
});

export const OrderStatusBadge = memo(OrderStatusBadgeComponent);

interface PaymentStatusBadgeProps {
  status: string;
}

function PaymentStatusBadgeComponent({ status }: PaymentStatusBadgeProps) {
  const label = formatOrderLabel(saleOrderPaymentStatusLabels, status);

  return (
    <Box style={styles.paymentBadge}>
      <Text size="xs" className="font-medium text-typography-700">
        {label}
      </Text>
    </Box>
  );
}

export const PaymentStatusBadge = memo(PaymentStatusBadgeComponent);
