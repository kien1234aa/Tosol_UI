import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { deliveredConsignmentCopy } from '@/src/configs/consignment';
import { formatOrderDate } from '@/src/helpers/orders';
import {
  formatConsignmentCost,
  formatConsignmentWeight,
} from '@/src/helpers/consignment';
import { lightTokens } from '@/src/configs/theme';
import type { DeliveredConsignmentItem } from '@/src/types/consignment/deliveredConsignment.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface DeliveredConsignmentCardProps {
  item: DeliveredConsignmentItem;
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

function DeliveredConsignmentCardComponent({
  item,
}: DeliveredConsignmentCardProps) {
  return (
    <Box style={styles.card}>
      <HStack style={styles.topRow}>
        <VStack space="xs" style={styles.topLeft}>
          <Text size="xs" className="text-typography-500">
            {deliveredConsignmentCopy.idLabel}
          </Text>
          <Text size="sm" className="font-semibold text-typography-900">
            {item.id}
          </Text>
        </VStack>

        <Box style={styles.statusBadge}>
          <Text size="xs" className="font-semibold" style={styles.statusText}>
            {deliveredConsignmentCopy.statusBadge}
          </Text>
        </Box>
      </HStack>

      <VStack space="xs" style={styles.details}>
        <DetailRow
          label={deliveredConsignmentCopy.trackingCodeLabel}
          value={item.trackingCode}
        />
        <DetailRow
          label={deliveredConsignmentCopy.deliveredAtLabel}
          value={formatOrderDate(item.deliveredAt)}
        />
        <DetailRow
          label={deliveredConsignmentCopy.productNameLabel}
          value={item.productName}
        />
        <DetailRow
          label={deliveredConsignmentCopy.weightLabel}
          value={formatConsignmentWeight(item.weightKg)}
        />
        <DetailRow
          label={deliveredConsignmentCopy.costLabel}
          value={formatConsignmentCost(item.costVnd)}
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

export const DeliveredConsignmentCard = memo(DeliveredConsignmentCardComponent);
