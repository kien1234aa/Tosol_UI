import React, { memo, useCallback, useState } from 'react';
import {
  Modal,
  Pressable as RNPressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  ChevronDown,
  Package,
  Trash2,
} from 'lucide-react-native';
import { ordersCopy } from '@/src/configs/orders';
import { formatOrderDate, formatOrderPrice } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import { buttonContentCenter } from '@/src/configs/theme/buttonLayout';
import type { OrderListItem } from '@/src/types/orders/orders.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderListCardProps {
  order: OrderListItem;
  onPress: (orderId: string) => void;
  onRemove: (orderId: string) => void;
  onAction: (orderId: string, action: 'view' | 'pay' | 'cancel') => void;
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

function OrderListCardComponent({
  order,
  onPress,
  onRemove,
  onAction,
}: OrderListCardProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handlePress = useCallback(() => {
    onPress(order.id);
  }, [onPress, order.id]);

  const handleRemove = useCallback(() => {
    onRemove(order.id);
  }, [onRemove, order.id]);

  const handleOpenActions = useCallback(() => {
    setIsActionsOpen(true);
  }, []);

  const handleCloseActions = useCallback(() => {
    setIsActionsOpen(false);
  }, []);

  const handleAction = useCallback(
    (action: 'view' | 'pay' | 'cancel') => {
      onAction(order.id, action);
      setIsActionsOpen(false);
    },
    [onAction, order.id],
  );

  return (
    <>
      <Box style={styles.card}>
        <HStack style={styles.cardHeader}>
          <Text size="sm" className="font-semibold text-typography-900">
            {ordersCopy.idLabel} {order.id}
          </Text>
          <OrderStatusBadge status={order.status} />
        </HStack>

        <RNPressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={ordersCopy.viewDetail}
          style={styles.bodyPressable}>
          <HStack style={styles.body}>
            <Box style={styles.thumbnailWrap}>
              <Center style={styles.thumbnail}>
                <Package
                  color={lightTokens.tertiary500}
                  size={THUMBNAIL_ICON_SIZE}
                />
              </Center>
              <Center style={styles.quantityBadge}>
                <Text size="xs" className="font-bold text-typography-0">
                  {order.productQuantity}
                </Text>
              </Center>
            </Box>

            <VStack style={styles.details} space="xs">
              <Text
                size="sm"
                numberOfLines={2}
                className="font-medium leading-5 text-typography-900">
                {order.productName}
              </Text>
              <DetailRow
                label={ordersCopy.createdAtLabel}
                value={formatOrderDate(order.createdAt)}
              />
              <DetailRow
                label={ordersCopy.totalCostLabel}
                value={formatOrderPrice(order.totalCostVnd)}
                emphasize
              />
              <DetailRow
                label={ordersCopy.paidLabel}
                value={formatOrderPrice(order.paidVnd)}
              />
              <DetailRow
                label={ordersCopy.packageCountLabel}
                value={String(order.packageCount)}
              />
            </VStack>
          </HStack>
        </RNPressable>

        <HStack style={styles.footer}>
          <RNPressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel={ordersCopy.deleteOrder}
            style={styles.deleteButton}>
            <Trash2 color={lightTokens.error500} size={18} />
          </RNPressable>

          <RNPressable
            onPress={handleOpenActions}
            accessibilityRole="button"
            accessibilityLabel={ordersCopy.actions}
            style={styles.actionsButton}>
            <HStack className="items-center gap-1">
              <Text size="sm" className="font-medium text-typography-900">
                {ordersCopy.actions}
              </Text>
              <ChevronDown color={lightTokens.typography900} size={18} />
            </HStack>
          </RNPressable>
        </HStack>
      </Box>

      <Modal
        visible={isActionsOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseActions}>
        <RNPressable style={styles.overlay} onPress={handleCloseActions}>
          <RNPressable style={styles.actionsSheet} onPress={() => {}}>
            <VStack space="xs">
              <Pressable
                onPress={() => handleAction('view')}
                style={styles.actionOption}>
                <Text size="sm" className="text-typography-900">
                  {ordersCopy.viewDetail}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleAction('pay')}
                style={styles.actionOption}>
                <Text size="sm" className="text-typography-900">
                  {ordersCopy.payOrder}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleAction('cancel')}
                style={styles.actionOption}>
                <Text size="sm" className="text-error-500">
                  {ordersCopy.cancelOrder}
                </Text>
              </Pressable>
            </VStack>
          </RNPressable>
        </RNPressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'visible',
  },
  cardHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  bodyPressable: {
    width: '100%',
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
    borderWidth: 1,
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
  footer: {
    width: '100%',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    ...buttonContentCenter,
    backgroundColor: '#FEECEC',
  },
  actionsButton: {
    minWidth: 96,
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    ...buttonContentCenter,
    backgroundColor: lightTokens.background100,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  actionsSheet: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
  actionOption: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});

export const OrderListCard = memo(OrderListCardComponent);
