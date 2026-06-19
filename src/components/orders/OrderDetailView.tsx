import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import {
  orderDetailCopy,
  ordersCopy,
  saleOrderPaymentMethodLabels,
  saleOrderPaymentStatusLabels,
  saleOrderShippingPayerLabels,
} from '@/src/configs/orders';
import {
  formatOrderDate,
  formatOrderLabel,
  formatOrderPrice,
  formatYesNo,
  shouldShowCostRow,
} from '@/src/helpers/orders';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonFlex,
  buttonFooterAction,
  buttonLabelStyle,
} from '@/src/configs/theme/buttonLayout';
import type {
  OrderDetail,
  OrderDetailProduct,
  OrderDetailShipping as OrderDetailShippingInfo,
} from '@/src/types/orders/orders.types';
import {
  ProductThumbnailImage,
  productThumbnailContainerStyle,
} from '@/src/shared/components/ui/ProductThumbnailImage';
import { Box } from '@/src/uikits/box';
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
    <HStack className="w-full items-start justify-between gap-3">
      <Text size="sm" className="shrink-0 text-typography-600">
        {label}
      </Text>
      <Text
        size="sm"
        className={
          emphasize
            ? 'flex-1 text-right font-bold text-tertiary-600'
            : 'flex-1 text-right font-medium text-typography-900'
        }
        style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </Text>
    </HStack>
  );
}

interface PaymentStatusBadgeProps {
  status: string;
}

function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const label = formatOrderLabel(saleOrderPaymentStatusLabels, status);

  return (
    <Box style={styles.paymentBadge}>
      <Text size="xs" className="font-medium text-typography-700">
        {label}
      </Text>
    </Box>
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
              {ordersCopy.orderNumberLabel}
            </Text>
            <Text size="lg" className="font-bold text-typography-900">
              {order.orderNumber}
            </Text>
          </VStack>
          <VStack space="xs" className="items-end">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </VStack>
        </HStack>

        <Box style={styles.divider} />

        <DetailRow
          label={orderDetailCopy.orderDateLabel}
          value={formatOrderDate(order.orderDate)}
        />
        <DetailRow
          label={ordersCopy.createdAtLabel}
          value={formatOrderDate(order.createdAt)}
        />
        <DetailRow
          label={orderDetailCopy.paymentMethodLabel}
          value={formatOrderLabel(
            saleOrderPaymentMethodLabels,
            order.paymentMethod,
          )}
        />
        <DetailRow label={orderDetailCopy.shopLabel} value={order.shopName} />
        <DetailRow
          label={orderDetailCopy.customerLabel}
          value={order.customerName}
        />
        <DetailRow
          label={orderDetailCopy.customerPhoneLabel}
          value={order.customerPhone}
        />
        <DetailRow
          label={orderDetailCopy.customerAddressLabel}
          value={order.customerAddress}
        />
        <DetailRow
          label={orderDetailCopy.warehouseLabel}
          value={order.warehouseName}
        />
        {order.packingOrderNumber ? (
          <DetailRow
            label={orderDetailCopy.packingOrderLabel}
            value={order.packingOrderNumber}
          />
        ) : null}
        <DetailRow
          label={orderDetailCopy.creatorLabel}
          value={order.creatorName}
        />
      </VStack>
    </Box>
  );
}

interface OrderDetailProductRowProps {
  product: OrderDetailProduct;
}

function OrderDetailProductRowComponent({
  product,
}: OrderDetailProductRowProps) {
  return (
    <HStack className="w-full items-start gap-3">
      <Box style={styles.productThumbnail}>
        <ProductThumbnailImage uri={product.thumbnailUrl} />
      </Box>

      <VStack className="min-w-0 flex-1" space="xs">
        <Text
          size="sm"
          className="font-semibold text-typography-900"
          numberOfLines={2}>
          {product.name}
        </Text>
        <Text size="xs" className="text-typography-500">
          SKU: {product.sku}
        </Text>
        <HStack className="w-full items-center justify-between">
          <Text size="xs" className="text-typography-500">
            {orderDetailCopy.unitPriceLabel}{' '}
            {formatOrderPrice(product.unitPriceVnd)} × {product.quantity}
          </Text>
          <Text size="sm" className="font-semibold text-typography-900">
            {formatOrderPrice(product.lineTotalVnd)}
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
  if (products.length === 0) {
    return null;
  }

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

interface OrderDetailShippingProps {
  shipping: OrderDetailShippingInfo;
}

function OrderDetailShippingComponent({ shipping }: OrderDetailShippingProps) {
  return (
    <Box style={styles.sectionCard}>
      <VStack space="md">
        <Text size="sm" className="font-semibold text-typography-900">
          {orderDetailCopy.shippingTitle}
        </Text>
        <DetailRow
          label={orderDetailCopy.recipientLabel}
          value={`${shipping.recipientName} · ${shipping.recipientPhone}`}
        />
        <DetailRow
          label={orderDetailCopy.customerAddressLabel}
          value={shipping.recipientAddress}
        />
        <DetailRow
          label={orderDetailCopy.shippingPartnerLabel}
          value={shipping.shippingPartnerName}
        />
        <DetailRow
          label={orderDetailCopy.trackingNumberLabel}
          value={shipping.trackingNumber ?? '—'}
        />
        <DetailRow
          label={orderDetailCopy.shippingPayerLabel}
          value={formatOrderLabel(
            saleOrderShippingPayerLabels,
            shipping.shippingPayer,
          )}
        />
        <DetailRow
          label={orderDetailCopy.codLabel}
          value={
            shipping.collectCod
              ? `${formatYesNo(true)} · ${formatOrderPrice(shipping.codAmountVnd)}`
              : formatYesNo(false)
          }
        />
        <DetailRow
          label={orderDetailCopy.shippingFee}
          value={formatOrderPrice(shipping.shippingFeeVnd)}
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

interface OrderDetailIssueProps {
  issueNote: string;
}

function OrderDetailIssueComponent({ issueNote }: OrderDetailIssueProps) {
  if (!issueNote.trim()) {
    return null;
  }

  return (
    <Box style={[styles.sectionCard, styles.issueCard]}>
      <VStack space="sm">
        <Text size="sm" className="font-semibold text-error-600">
          {orderDetailCopy.issueTitle}
        </Text>
        <Text size="sm" className="text-typography-600">
          {issueNote}
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
        {shouldShowCostRow(costs.discountVnd) ? (
          <DetailRow
            label={orderDetailCopy.discountAmount}
            value={formatOrderPrice(costs.discountVnd)}
          />
        ) : null}
        {shouldShowCostRow(costs.taxVnd) ? (
          <DetailRow
            label={orderDetailCopy.taxAmount}
            value={formatOrderPrice(costs.taxVnd)}
          />
        ) : null}
        <DetailRow
          label={orderDetailCopy.shippingFee}
          value={formatOrderPrice(costs.shippingFeeVnd)}
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  issueCard: {
    borderColor: lightTokens.error500,
    backgroundColor: '#FEF2F2',
  },
  paymentBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: lightTokens.background100,
  },
  divider: {
    height: 1,
    backgroundColor: lightTokens.outline100,
  },
  productThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: lightTokens.tertiary50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
    ...productThumbnailContainerStyle,
  },
  footer: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  outlineButton: {
    borderWidth: StyleSheet.hairlineWidth,
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
export const OrderDetailShipping = memo(OrderDetailShippingComponent);
export const OrderDetailNote = memo(OrderDetailNoteComponent);
export const OrderDetailIssue = memo(OrderDetailIssueComponent);
export const OrderDetailCostBreakdown = memo(OrderDetailCostBreakdownComponent);
export const OrderDetailActions = memo(OrderDetailActionsComponent);
