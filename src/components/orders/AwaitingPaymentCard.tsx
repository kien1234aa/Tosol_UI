import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Package } from 'lucide-react-native';
import { awaitingPaymentCopy } from '@/src/configs/orders';
import { formatOrderDate, formatOrderPrice } from '@/src/helpers/orders';
import { formatConsignmentWeight } from '@/src/helpers/consignment';
import { lightTokens } from '@/src/configs/theme';
import type { AwaitingPaymentItem } from '@/src/types/orders/awaitingPayment.types';
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
} from '@/src/uikits/checkbox';
import { CheckIcon } from '@/src/uikits/icon';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface AwaitingPaymentCardProps {
  item: AwaitingPaymentItem;
  selected: boolean;
  onToggle: (id: string) => void;
}

interface DetailRowProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

const THUMBNAIL_ICON_SIZE = 28;

function DetailRow({ label, value, emphasize = false }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text size="xs" className="text-typography-500" style={styles.detailLabel}>
        {label}
      </Text>
      <Text
        size="sm"
        numberOfLines={1}
        className={
          emphasize
            ? 'font-semibold text-tertiary-600'
            : 'font-medium text-typography-900'
        }
        style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function AwaitingPaymentCardComponent({
  item,
  selected,
  onToggle,
}: AwaitingPaymentCardProps) {
  const handleToggle = useCallback(() => {
    onToggle(item.id);
  }, [onToggle, item.id]);

  return (
    <Box style={styles.card}>
      <HStack style={styles.body}>
        <Box style={styles.thumbnailWrap}>
          <Center style={styles.thumbnail}>
            <Package color={lightTokens.tertiary500} size={THUMBNAIL_ICON_SIZE} />
          </Center>
        </Box>

        <VStack style={styles.details} space="xs">
          <DetailRow label={awaitingPaymentCopy.idLabel} value={item.id} />
          <DetailRow
            label={awaitingPaymentCopy.trackingCodeLabel}
            value={item.trackingCode}
          />
          <DetailRow
            label={awaitingPaymentCopy.createdAtLabel}
            value={formatOrderDate(item.createdAt)}
          />
          <DetailRow
            label={awaitingPaymentCopy.weightLabel}
            value={formatConsignmentWeight(item.weightKg)}
          />
          <DetailRow
            label={awaitingPaymentCopy.payableLabel}
            value={formatOrderPrice(item.payableVnd)}
            emphasize
          />
        </VStack>

        <Checkbox
          size="md"
          value={item.id}
          isChecked={selected}
          onChange={handleToggle}
          aria-label={item.productName}
          style={styles.checkbox}>
          <CheckboxIndicator className="border-tertiary-500 data-[checked=true]:border-tertiary-500 data-[checked=true]:bg-tertiary-500">
            <CheckboxIcon as={CheckIcon} className="text-typography-0" />
          </CheckboxIndicator>
        </Checkbox>
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
  body: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 12,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailLabel: {
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  thumbnailWrap: {
    width: 72,
    height: 72,
    flexShrink: 0,
    position: 'relative',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  checkbox: {
    marginTop: 2,
    flexShrink: 0,
  },
});

export const AwaitingPaymentCard = memo(AwaitingPaymentCardComponent);
