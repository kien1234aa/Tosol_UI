import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { walletCopy, walletStatusLabels } from '@/src/configs/wallet';
import { formatOrderDate, formatOrderPrice } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import type {
  WalletTransaction,
  WalletTransactionStatus,
} from '@/src/types/wallet/wallet.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

interface WalletTransactionCardProps {
  item: WalletTransaction;
}

const STATUS_STYLES: Record<
  WalletTransactionStatus,
  { backgroundColor: string; color: string }
> = {
  success: { backgroundColor: '#E8F7EE', color: '#15803D' },
  pending: { backgroundColor: '#FFF4E5', color: '#B45309' },
  failed: { backgroundColor: '#FDECEC', color: '#B91C1C' },
};

const ICON_SIZE = 20;

function WalletTransactionCardComponent({
  item,
}: WalletTransactionCardProps) {
  const isTopup = item.type === 'topup';
  const typeLabel = isTopup
    ? walletCopy.txnTopupLabel
    : walletCopy.txnWithdrawLabel;
  const amountColor = isTopup ? '#15803D' : lightTokens.error500;
  const amountPrefix = isTopup ? '+' : '-';
  const statusPalette = STATUS_STYLES[item.status];
  const TypeIcon = isTopup ? ArrowDownLeft : ArrowUpRight;

  return (
    <Box style={styles.card}>
      <HStack style={styles.row}>
        <Center
          style={[
            styles.iconWrap,
            { backgroundColor: isTopup ? '#E8F7EE' : '#FDECEC' },
          ]}>
          <TypeIcon color={amountColor} size={ICON_SIZE} />
        </Center>

        <VStack style={styles.middle} space="xs">
          <Text size="sm" className="font-semibold text-typography-900">
            {typeLabel}
          </Text>
          <Text size="xs" className="text-typography-500">
            {item.id} · {formatOrderDate(item.createdAt)}
          </Text>
        </VStack>

        <VStack style={styles.right} space="xs">
          <Text
            size="sm"
            numberOfLines={1}
            className="font-bold"
            style={{ color: amountColor }}>
            {amountPrefix}
            {formatOrderPrice(item.amountVnd)}
          </Text>
          <Box
            style={[
              styles.statusChip,
              { backgroundColor: statusPalette.backgroundColor },
            ]}>
            <Text
              size="xs"
              className="font-medium"
              style={{ color: statusPalette.color }}>
              {walletStatusLabels[item.status]}
            </Text>
          </Box>
        </VStack>
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
  row: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    flexShrink: 0,
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  right: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});

export const WalletTransactionCard = memo(WalletTransactionCardComponent);
