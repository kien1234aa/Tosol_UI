import React, { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Package } from 'lucide-react-native';
import { awaitingDepositCopy } from '@/src/configs/orders';
import { formatOrderDate, formatOrderPrice } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import type { AwaitingDepositItem } from '@/src/types/orders/awaitingDeposit.types';
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

interface AwaitingDepositCardProps {
  item: AwaitingDepositItem;
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

function AwaitingDepositCardComponent({
  item,
  selected,
  onToggle,
}: AwaitingDepositCardProps) {
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
          <Center style={styles.quantityBadge}>
            <Text size="xs" className="font-bold text-typography-0">
              {item.quantity}
            </Text>
          </Center>
        </Box>

        <VStack style={styles.details} space="xs">
          <DetailRow label={awaitingDepositCopy.idLabel} value={item.id} />
          <DetailRow
            label={awaitingDepositCopy.createdAtLabel}
            value={formatOrderDate(item.createdAt)}
          />
          <DetailRow
            label={awaitingDepositCopy.goodsLabel}
            value={formatOrderPrice(item.goodsVnd)}
          />
          <DetailRow
            label={awaitingDepositCopy.payableLabel}
            value={formatOrderPrice(item.payableVnd)}
            emphasize
          />
          <DetailRow
            label={awaitingDepositCopy.quantityLabel}
            value={String(item.quantity)}
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
  quantityBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 4,
    backgroundColor: lightTokens.tertiary500,
    borderWidth: 1.5,
    borderColor: lightTokens.background0,
  },
  checkbox: {
    marginTop: 2,
    flexShrink: 0,
  },
});

export const AwaitingDepositCard = memo(AwaitingDepositCardComponent);
