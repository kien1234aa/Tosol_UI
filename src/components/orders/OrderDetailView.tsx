import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';
import { orderDetailCopy, ordersCopy } from '@/src/configs/orders';
import {
  formatCnyPrice,
  convertCnyToVnd,
} from '@/src/helpers/search';
import { formatOrderDate, formatOrderPrice } from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonFlex,
  buttonFooterAction,
  buttonLabelStyle,
} from '@/src/configs/theme/buttonLayout';
import type {
  OrderDetail,
  OrderDetailProduct,
} from '@/src/types/orders/orders.types';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { OrderStatusBadge } from './OrderStatusBadge';
import { StackHeader } from '@/src/components/main';

interface OrderDetailHeaderProps {
  onPressBack: () => void;
}

function OrderDetailHeaderComponent({ onPressBack }: OrderDetailHeaderProps) {
  return (
    <StackHeader
      title={orderDetailCopy.screenTitle}
      onPressBack={onPressBack}
      backAccessibilityLabel={orderDetailCopy.back}
    />
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  emphasize?: boolean;
  valueColor?: string;
}

function DetailRow({
  label,
  value,
  emphasize = false,
  valueColor,
}: DetailRowProps) {
  return (
    <HStack className="w-full items-center justify-between">
      <Text size="sm" className="text-typography-600">
        {label}
      </Text>
      <Text
        size="sm"
        className={
          emphasize
            ? 'font-bold text-tertiary-600'
            : 'font-medium text-typography-900'
        }
        style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </Text>
    </HStack>
  );
}

interface OrderDetailSummaryProps {
  order: OrderDetail;
}

function OrderDetailSummaryComponent({ order }: OrderDetailSummaryProps) {
  return (
    <Box style={styles.sectionCard}>
      <VStack space="md">
        <HStack className="w-full items-start justify-between">
          <VStack space="xs" className="flex-1 pr-3">
            <Text size="xs" className="text-typography-500">
              {ordersCopy.idLabel}
            </Text>
            <Text size="lg" className="font-bold text-typography-900">
              {order.id}
            </Text>
          </VStack>
          <OrderStatusBadge status={order.status} />
        </HStack>

        <Box style={styles.divider} />

        <DetailRow
          label={ordersCopy.createdAtLabel}
          value={formatOrderDate(order.createdAt)}
        />
        <DetailRow
          label={orderDetailCopy.supplierLabel}
          value={order.supplierName}
        />
        <DetailRow
          label={ordersCopy.packageCountLabel}
          value={String(order.packageCount)}
        />
      </VStack>
    </Box>
  );
}

interface OrderDetailProductRowProps {
  product: OrderDetailProduct;
}

const PRODUCT_ICON_SIZE = 24;

function OrderDetailProductRowComponent({
  product,
}: OrderDetailProductRowProps) {
  const lineTotalVnd = convertCnyToVnd(product.priceCny * product.quantity);

  return (
    <HStack className="w-full items-start gap-3">
      <Center style={styles.productThumbnail}>
        <Package color={lightTokens.tertiary500} size={PRODUCT_ICON_SIZE} />
      </Center>

      <VStack className="min-w-0 flex-1" space="xs">
        <Text
          size="sm"
          className="font-semibold text-typography-900"
          numberOfLines={2}>
          {product.name}
        </Text>
        <Text size="xs" className="text-typography-500" numberOfLines={2}>
          {product.variant}
        </Text>
        <HStack className="w-full items-center justify-between">
          <Text size="xs" className="text-typography-500">
            {orderDetailCopy.unitPriceLabel}{' '}
            {formatCnyPrice(product.priceCny)} × {product.quantity}
          </Text>
          <Text size="sm" className="font-semibold text-typography-900">
            {formatOrderPrice(lineTotalVnd)}
          </Text>
        </HStack>
      </VStack>
    </HStack>
  );
}

interface OrderDetailProductsProps {
  products: OrderDetailProduct[];
}

function OrderDetailProductsComponent({ products }: OrderDetailProductsProps) {
  return (
    <Box style={styles.sectionCard}>
      <VStack space="md">
        <Text size="sm" className="font-semibold text-typography-900">
          {orderDetailCopy.productsTitle}
        </Text>
        {products.map((product, index) => (
          <React.Fragment key={product.id}>
            {index > 0 ? <Box style={styles.divider} /> : null}
            <OrderDetailProductRowComponent product={product} />
          </React.Fragment>
        ))}
      </VStack>
    </Box>
  );
}

interface OrderDetailOptionsProps {
  insurance: boolean;
  woodPacking: boolean;
}

function OrderDetailOptionsComponent({
  insurance,
  woodPacking,
}: OrderDetailOptionsProps) {
  return (
    <Box style={styles.sectionCard}>
      <VStack space="md">
        <Text size="sm" className="font-semibold text-typography-900">
          {orderDetailCopy.optionsTitle}
        </Text>
        <DetailRow
          label={orderDetailCopy.insurance}
          value={insurance ? orderDetailCopy.enabled : orderDetailCopy.disabled}
        />
        <DetailRow
          label={orderDetailCopy.woodPacking}
          value={
            woodPacking ? orderDetailCopy.enabled : orderDetailCopy.disabled
          }
        />
      </VStack>
    </Box>
  );
}

interface OrderDetailNoteProps {
  note: string;
}

function OrderDetailNoteComponent({ note }: OrderDetailNoteProps) {
  if (!note.trim()) {
    return null;
  }

  return (
    <Box style={styles.sectionCard}>
      <VStack space="sm">
        <Text size="sm" className="font-semibold text-typography-900">
          {orderDetailCopy.noteTitle}
        </Text>
        <Text size="sm" className="text-typography-600">
          {note}
        </Text>
      </VStack>
    </Box>
  );
}

interface OrderDetailCostBreakdownProps {
  order: OrderDetail;
}

function OrderDetailCostBreakdownComponent({
  order,
}: OrderDetailCostBreakdownProps) {
  const { costs } = order;

  return (
    <Box style={styles.sectionCard}>
      <VStack space="md">
        <Text size="sm" className="font-semibold text-typography-900">
          {orderDetailCopy.costTitle}
        </Text>
        <DetailRow
          label={orderDetailCopy.goodsAmount}
          value={formatOrderPrice(costs.goodsVnd)}
        />
        <DetailRow
          label={orderDetailCopy.estimatedFee}
          value={formatOrderPrice(costs.estimatedFeeVnd)}
        />
        <DetailRow
          label={orderDetailCopy.deposit}
          value={formatOrderPrice(costs.depositVnd)}
        />
        <Box style={styles.divider} />
        <DetailRow
          label={orderDetailCopy.totalAmount}
          value={formatOrderPrice(costs.totalVnd)}
          emphasize
        />
        <DetailRow
          label={ordersCopy.paidLabel}
          value={formatOrderPrice(costs.paidVnd)}
        />
        <DetailRow
          label={orderDetailCopy.remainingAmount}
          value={formatOrderPrice(costs.remainingVnd)}
          valueColor={lightTokens.tertiary600}
        />
      </VStack>
    </Box>
  );
}

interface OrderDetailActionsProps {
  canPay: boolean;
  canCancel: boolean;
  remainingVnd: number;
  onPressPay: () => void;
  onPressCancel: () => void;
}

function OrderDetailActionsComponent({
  canPay,
  canCancel,
  remainingVnd,
  onPressPay,
  onPressCancel,
}: OrderDetailActionsProps) {
  if (!canPay && !canCancel) {
    return null;
  }

  return (
    <Box style={styles.footer}>
      {canPay ? (
        <HStack className="mb-3 w-full items-center justify-between">
          <Text size="sm" className="text-typography-500">
            {orderDetailCopy.remainingAmount}
          </Text>
          <Text size="md" className="font-bold text-tertiary-600">
            {formatOrderPrice(remainingVnd)}
          </Text>
        </HStack>
      ) : null}

      <HStack className="w-full" space="md">
        {canCancel ? (
          <Pressable
            onPress={onPressCancel}
            accessibilityRole="button"
            accessibilityLabel={orderDetailCopy.cancelOrder}
            style={[buttonFooterAction, buttonFlex, styles.outlineButton]}>
            <Text
              size="sm"
              className="font-semibold text-error-500"
              style={buttonLabelStyle}>
              {orderDetailCopy.cancelOrder}
            </Text>
          </Pressable>
        ) : null}

        {canPay ? (
          <Pressable
            onPress={onPressPay}
            accessibilityRole="button"
            accessibilityLabel={orderDetailCopy.payOrder}
            style={[buttonFooterAction, buttonFlex, styles.primaryButton]}>
            <Text
              size="sm"
              className="font-semibold text-typography-0"
              style={buttonLabelStyle}>
              {orderDetailCopy.payOrder}
            </Text>
          </Pressable>
        ) : null}
      </HStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  divider: {
    height: 1,
    backgroundColor: lightTokens.outline100,
  },
  productThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: 1,
    borderColor: lightTokens.outline100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: lightTokens.background0,
    borderTopWidth: 1,
    borderTopColor: lightTokens.outline100,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: lightTokens.error500,
    backgroundColor: lightTokens.background0,
  },
  primaryButton: {
    backgroundColor: lightTokens.tertiary500,
  },
});

export const OrderDetailHeader = memo(OrderDetailHeaderComponent);
export const OrderDetailSummary = memo(OrderDetailSummaryComponent);
export const OrderDetailProducts = memo(OrderDetailProductsComponent);
export const OrderDetailOptions = memo(OrderDetailOptionsComponent);
export const OrderDetailNote = memo(OrderDetailNoteComponent);
export const OrderDetailCostBreakdown = memo(OrderDetailCostBreakdownComponent);
export const OrderDetailActions = memo(OrderDetailActionsComponent);
