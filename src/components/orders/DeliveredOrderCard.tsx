import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { deliveredOrdersCopy } from '@/src/configs/orders';
import { formatOrderDate, formatOrderPrice } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import type { DeliveredOrderItem } from '@/src/types/orders/deliveredOrders.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface DeliveredOrderCardProps {
  item: DeliveredOrderItem;
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <HStack style={styles.detailRow}>
      <Text size="sm" className="text-typography-500">
        {label}
      </Text>
      <Text
        size="sm"
        numberOfLines={1}
        className="flex-1 text-right font-medium text-typography-900">
        {value}
      </Text>
    </HStack>
  );
}

function DeliveredOrderCardComponent({ item }: DeliveredOrderCardProps) {
  return (
    <Box style={styles.card}>
      <HStack style={styles.topRow}>
        <VStack space="xs" style={styles.topLeft}>
          <Text size="xs" className="text-typography-500">
            {deliveredOrdersCopy.idLabel}
          </Text>
          <Text size="sm" className="font-semibold text-typography-900">
            {item.id}
          </Text>
        </VStack>

        <Box style={styles.statusBadge}>
          <Text size="xs" className="font-semibold" style={styles.statusText}>
            {deliveredOrdersCopy.statusBadge}
          </Text>
        </Box>
      </HStack>

      <VStack space="xs" style={styles.details}>
        <DetailRow
          label={deliveredOrdersCopy.deliveredAtLabel}
          value={formatOrderDate(item.deliveredAt)}
        />
        <DetailRow
          label={deliveredOrdersCopy.productNameLabel}
          value={item.productName}
        />
        <DetailRow
          label={deliveredOrdersCopy.packageCountLabel}
          value={String(item.packageCount)}
        />
        <DetailRow
          label={deliveredOrdersCopy.totalCostLabel}
          value={formatOrderPrice(item.totalCostVnd)}
        />
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  topRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topLeft: {
    flexShrink: 0,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#E8F7EE',
  },
  statusText: {
    color: '#15803D',
  },
  details: {
    width: '100%',
    marginTop: 14,
  },
  detailRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});

export const DeliveredOrderCard = memo(DeliveredOrderCardComponent);
