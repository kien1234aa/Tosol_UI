import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { statusPillPair } from '@shared/theme/statusColors';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet, Text, View } from 'react-native';
import type { OrderPaymentStatus, OrderRowStatus } from '../orderTypes';

function orderRowStatusSpec(
  p: AppColorPalette,
): Record<OrderRowStatus, { labelKey: string; bg: string; color: string }> {
  const danger = statusPillPair(p, 'danger');
  const warning = statusPillPair(p, 'warning');
  const success = statusPillPair(p, 'success');
  const info = statusPillPair(p, 'info');
  const neutral = statusPillPair(p, 'neutral');

  return {
    cancelled: { labelKey: 'orders.pill.row.cancelled', ...danger },
    pending: { labelKey: 'orders.pill.row.pending', ...warning },
    confirmed: { labelKey: 'orders.pill.row.confirmed', ...success },
    packing: { labelKey: 'orders.pill.row.packing', ...info },
    shipping: { labelKey: 'orders.pill.row.shipping', ...success },
    ready: { labelKey: 'orders.pill.row.ready', ...success },
    delivered: { labelKey: 'orders.pill.row.delivered', ...success },
    transferring: { labelKey: 'orders.pill.row.transferring', ...info },
    pending_transfer: {
      labelKey: 'orders.pill.row.pending_transfer',
      ...info,
    },
    transfer_failed: { labelKey: 'orders.pill.row.transfer_failed', ...danger },
    returned: { labelKey: 'orders.pill.row.returned', ...neutral },
    partially_returned: {
      labelKey: 'orders.pill.row.partially_returned',
      ...warning,
    },
  };
}

function paymentStatusSpec(
  p: AppColorPalette,
): Record<OrderPaymentStatus, { labelKey: string; bg: string; color: string }> {
  const warning = statusPillPair(p, 'warning');
  const success = statusPillPair(p, 'success');
  const neutral = statusPillPair(p, 'neutral');

  return {
    disabled: { labelKey: 'orders.pill.payment.disabled', ...neutral },
    pending_payment: {
      labelKey: 'orders.pill.payment.pending_payment',
      ...warning,
    },
    paid: { labelKey: 'orders.pill.payment.paid', ...success },
    partial_payment: {
      labelKey: 'orders.pill.payment.partial_payment',
      ...warning,
    },
    pending_refund: {
      labelKey: 'orders.pill.payment.pending_refund',
      ...warning,
    },
    refunded: { labelKey: 'orders.pill.payment.refunded', ...neutral },
  };
}

export function OrderStatusPill({ status }: { status: OrderRowStatus }) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_OrderStatusPill_styles);
  const spec = orderRowStatusSpec(palette)[status];
  return (
    <View style={[styles.pill, { backgroundColor: spec.bg }]}>
      <Text style={[styles.pillText, { color: spec.color }]} numberOfLines={1}>
        {t(spec.labelKey)}
      </Text>
    </View>
  );
}

export function PaymentStatusPill({ status }: { status: OrderPaymentStatus }) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_OrderStatusPill_styles);
  const spec = paymentStatusSpec(palette)[status];
  return (
    <View style={[styles.pill, { backgroundColor: spec.bg }]}>
      <Text style={[styles.pillText, { color: spec.color }]} numberOfLines={1}>
        {t(spec.labelKey)}
      </Text>
    </View>
  );
}

function create_OrderStatusPill_styles(_c: AppColorPalette) {
  return StyleSheet.create({
    pill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      maxWidth: 140,
    },
    pillText: {
      fontSize: 11,
      fontWeight: '700',
    },
  });
}
