import React, { memo, useCallback } from 'react';
import { Pressable as RNPressable, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import {
  consignmentListCopy,
  consignmentStatusLabels,
} from '@/src/configs/consignment';
import { formatOrderDate } from '@/src/helpers/orders';
import {
  formatConsignmentCost,
  formatConsignmentWeight,
} from '@/src/helpers/consignment';
import { lightTokens } from '@/src/configs/theme';
import { buttonContentCenter } from '@/src/configs/theme/buttonLayout';
import type { ConsignmentOrderItem } from '@/src/types/consignment/consignment.types';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface ConsignmentOrderCardProps {
  order: ConsignmentOrderItem;
  onView: (orderId: string) => void;
  onRemove: (orderId: string) => void;
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

function ConsignmentOrderCardComponent({
  order,
  onView,
  onRemove,
}: ConsignmentOrderCardProps) {
  const handleView = useCallback(() => onView(order.id), [onView, order.id]);
  const handleRemove = useCallback(
    () => onRemove(order.id),
    [onRemove, order.id],
  );

  return (
    <Box style={styles.card}>
      <HStack style={styles.topRow}>
        <VStack space="xs" style={styles.topLeft}>
          <Text size="xs" className="text-typography-500">
            {consignmentListCopy.createdAtLabel}
          </Text>
          <Text size="sm" className="font-medium text-typography-900">
            {formatOrderDate(order.createdAt)}
          </Text>
        </VStack>

        <Box style={styles.codeBox}>
          <Text
            size="sm"
            numberOfLines={1}
            className="font-semibold text-typography-900">
            {order.trackingCode}
          </Text>
        </Box>
      </HStack>

      <HStack style={styles.statusRow}>
        <Text size="sm" className="text-typography-500">
          {consignmentListCopy.statusLabel}
        </Text>
        <Box style={styles.statusChip}>
          <Text size="sm" className="font-medium text-tertiary-700">
            {consignmentStatusLabels[order.status]}
          </Text>
        </Box>
      </HStack>

      <VStack space="xs" style={styles.details}>
        <DetailRow
          label={consignmentListCopy.productNameLabel}
          value={order.productName}
        />
        <DetailRow
          label={consignmentListCopy.weightLabel}
          value={formatConsignmentWeight(order.weightKg)}
        />
        <DetailRow
          label={consignmentListCopy.costLabel}
          value={formatConsignmentCost(order.costVnd)}
        />
      </VStack>

      <Box style={styles.divider} />

      <HStack style={styles.actions}>
        <RNPressable
          onPress={handleView}
          accessibilityRole="button"
          accessibilityLabel={consignmentListCopy.viewDetail}
          style={styles.viewButton}>
          <Text size="sm" className="font-semibold text-tertiary-600">
            {consignmentListCopy.viewDetail}
          </Text>
        </RNPressable>

        <RNPressable
          onPress={handleRemove}
          accessibilityRole="button"
          accessibilityLabel={consignmentListCopy.deleteOrder}
          style={styles.deleteButton}>
          <Trash2 color={lightTokens.error500} size={18} />
        </RNPressable>
      </HStack>
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
  codeBox: {
    flex: 1,
    maxWidth: '60%',
    minHeight: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: lightTokens.background100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  statusChip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: lightTokens.tertiary50,
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
  divider: {
    height: 1,
    backgroundColor: lightTokens.outline100,
    marginVertical: 14,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    ...buttonContentCenter,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.tertiary200,
  },
  deleteButton: {
    width: 44,
    height: 40,
    borderRadius: 8,
    ...buttonContentCenter,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.error500,
  },
});

export const ConsignmentOrderCard = memo(ConsignmentOrderCardComponent);
