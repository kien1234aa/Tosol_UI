import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { consignmentDetailCopy } from '@/src/configs/consignment';
import { formatOrderDate } from '@/src/helpers/orders';
import {
  formatConsignmentCost,
  formatConsignmentWeight,
} from '@/src/helpers/consignment';
import { lightTokens } from '@/src/configs/theme';
import type { ConsignmentOrderItem } from '@/src/types/consignment/consignment.types';
import { StackHeader } from '@/src/components/main';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { ConsignmentStatusBadge } from './ConsignmentStatusBadge';

interface ConsignmentDetailHeaderProps {
  onPressBack: () => void;
}

function ConsignmentDetailHeaderComponent({
  onPressBack,
}: ConsignmentDetailHeaderProps) {
  return (
    <StackHeader
      title={consignmentDetailCopy.screenTitle}
      onPressBack={onPressBack}
      backAccessibilityLabel={consignmentDetailCopy.back}
    />
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

function DetailRow({ label, value, emphasize = false }: DetailRowProps) {
  return (
    <HStack className="w-full items-start justify-between" space="md">
      <Text size="sm" className="text-typography-600">
        {label}
      </Text>
      <Text
        size="sm"
        className={
          emphasize
            ? 'flex-1 text-right font-bold text-tertiary-600'
            : 'flex-1 text-right font-medium text-typography-900'
        }>
        {value}
      </Text>
    </HStack>
  );
}

interface ConsignmentDetailSummaryProps {
  order: ConsignmentOrderItem;
}

function ConsignmentDetailSummaryComponent({
  order,
}: ConsignmentDetailSummaryProps) {
  return (
    <Box style={styles.sectionCard}>
      <VStack space="md">
        <HStack className="w-full items-start justify-between">
          <VStack space="xs" className="flex-1 pr-3">
            <Text size="xs" className="text-typography-500">
              {consignmentDetailCopy.trackingCodeLabel}
            </Text>
            <Text size="lg" className="font-bold text-typography-900">
              {order.trackingCode}
            </Text>
          </VStack>
          <ConsignmentStatusBadge status={order.status} />
        </HStack>

        <Box style={styles.divider} />

        <DetailRow
          label={consignmentDetailCopy.createdAtLabel}
          value={formatOrderDate(order.createdAt)}
        />
      </VStack>
    </Box>
  );
}

interface ConsignmentDetailInfoProps {
  order: ConsignmentOrderItem;
}

function ConsignmentDetailInfoComponent({
  order,
}: ConsignmentDetailInfoProps) {
  return (
    <Box style={styles.sectionCard}>
      <VStack space="md">
        <Text size="sm" className="font-semibold text-typography-900">
          {consignmentDetailCopy.infoTitle}
        </Text>
        <DetailRow
          label={consignmentDetailCopy.productNameLabel}
          value={order.productName}
        />
        <DetailRow
          label={consignmentDetailCopy.trackingCodeLabel}
          value={order.trackingCode}
        />
        <DetailRow
          label={consignmentDetailCopy.weightLabel}
          value={formatConsignmentWeight(order.weightKg)}
        />
      </VStack>
    </Box>
  );
}

interface ConsignmentDetailNoteProps {
  note: string;
}

function ConsignmentDetailNoteComponent({ note }: ConsignmentDetailNoteProps) {
  if (!note.trim()) {
    return null;
  }

  return (
    <Box style={styles.sectionCard}>
      <VStack space="sm">
        <Text size="sm" className="font-semibold text-typography-900">
          {consignmentDetailCopy.noteTitle}
        </Text>
        <Text size="sm" className="text-typography-600">
          {note}
        </Text>
      </VStack>
    </Box>
  );
}

interface ConsignmentDetailCostProps {
  order: ConsignmentOrderItem;
}

function ConsignmentDetailCostComponent({
  order,
}: ConsignmentDetailCostProps) {
  return (
    <Box style={styles.sectionCard}>
      <VStack space="md">
        <Text size="sm" className="font-semibold text-typography-900">
          {consignmentDetailCopy.costTitle}
        </Text>
        <DetailRow
          label={consignmentDetailCopy.costLabel}
          value={formatConsignmentCost(order.costVnd)}
          emphasize
        />
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  divider: {
    height: 1,
    backgroundColor: lightTokens.outline100,
  },
});

export const ConsignmentDetailHeader = memo(ConsignmentDetailHeaderComponent);
export const ConsignmentDetailSummary = memo(ConsignmentDetailSummaryComponent);
export const ConsignmentDetailInfo = memo(ConsignmentDetailInfoComponent);
export const ConsignmentDetailNote = memo(ConsignmentDetailNoteComponent);
export const ConsignmentDetailCost = memo(ConsignmentDetailCostComponent);
