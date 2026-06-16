import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type {
  PaymentListRow,
  PaymentListRowKind,
  PaymentListRowStatus,
} from '../paymentListTypes';

const W = {
  order: 132,
  customer: 120,
  amount: 104,
  method: 124,
  date: 96,
  status: 108,
  type: 100,
  actions: 52,
};

const TABLE_MIN =
  W.order +
  W.customer +
  W.amount +
  W.method +
  W.date +
  W.status +
  W.type +
  W.actions;

export type PaymentsTableProps = {
  rows: PaymentListRow[];
  onRowPress?: (row: PaymentListRow) => void;
};

export function PaymentsTable({ rows, onRowPress }: PaymentsTableProps) {
  const styles = useThemeStyleSheet(create_PaymentsTable_styles);

  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN }}>
          <View style={[styles.tr, styles.headerTr]}>
            <Cell width={W.order} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐƠN HÀNG'}</Text>
            </Cell>
            <Cell width={W.customer} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TÊN KHÁCH HÀNG'}</Text>
            </Cell>
            <Cell width={W.amount} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SỐ TIỀN'}</Text>
            </Cell>
            <Cell width={W.method} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'PHƯƠNG THỨC'}</Text>
            </Cell>
            <Cell width={W.date} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NGÀY THANH TOÁN'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.type} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'LOẠI'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>{'Không có thanh toán phù hợp.'}</Text>
            </View>
          ) : (
            rows.map(r => (
              <PaymentRowView key={r.id} row={r} onRowPress={onRowPress} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

type PaymentsTableStyles = ReturnType<typeof create_PaymentsTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: PaymentsTableStyles;
}) {
  return (
    <View
      style={[
        styles.cell,
        { width, minWidth: width },
        header && styles.cellHeader,
      ]}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={header ? styles.th : styles.td}
          numberOfLines={header ? 2 : 4}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function PaymentRowView({
  row,
  onRowPress,
}: {
  row: PaymentListRow;
  onRowPress?: (row: PaymentListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_PaymentsTable_styles);

  function statusPillStyle(s: PaymentListRowStatus) {
    switch (s) {
      case 'pending':
        return styles.pillOrange;
      case 'completed':
        return styles.pillGreen;
      case 'failed':
        return styles.pillRed;
      case 'cancelled':
        return styles.pillMuted;
      default:
        return styles.pillMuted;
    }
  }

  function methodPillStyle(tone: PaymentListRow['methodTone']) {
    switch (tone) {
      case 'bank':
        return styles.methodTeal;
      case 'cod':
        return styles.methodOrange;
      case 'cash':
        return styles.methodGreen;
      default:
        return styles.methodMuted;
    }
  }

  function typePillStyle(k: PaymentListRowKind) {
    switch (k) {
      case 'refund':
        return styles.typeRefund;
      case 'payment':
        return styles.typePay;
      default:
        return styles.pillMuted;
    }
  }

  const rowBody = (
    <>
      <Cell width={W.order} styles={styles}>
        {row.orderRef ? (
          <View style={styles.orderLineRow}>
            <SystemIcon name="cart" size={12} color={palette.textSecondary} />
            <Text style={styles.orderLine} numberOfLines={2}>
              {row.orderRef}
            </Text>
          </View>
        ) : null}
        <Text style={styles.payCode} numberOfLines={1}>
          {row.paymentCode}
        </Text>
      </Cell>
      <Cell width={W.customer} styles={styles}>
        {row.customerName ? (
          <Text style={styles.tdBold} numberOfLines={3}>
            {row.customerName}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.amount} styles={styles}>
        {row.amountDisplay ? (
          <Text style={styles.tdMoney} numberOfLines={2}>
            {row.amountDisplay}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.method} styles={styles}>
        <View style={[styles.methodPill, methodPillStyle(row.methodTone)]}>
          <Text style={styles.methodPillTxt} numberOfLines={2}>
            {row.methodLabel}
          </Text>
        </View>
      </Cell>
      <Cell width={W.date} styles={styles}>
        {row.paidDateLabel ? (
          <Text style={styles.td} numberOfLines={2}>
            {row.paidDateLabel}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.status} styles={styles}>
        <View style={[styles.pill, statusPillStyle(row.status)]}>
          <View style={styles.pillInner}>
            {row.status === 'completed' ? (
              <SystemIcon
                name="check"
                size={12}
                color={palette.textPrimary}
              />
            ) : null}
            <Text style={styles.pillTxt} numberOfLines={2}>
              {row.statusLabel}
            </Text>
          </View>
        </View>
      </Cell>
      <Cell width={W.type} styles={styles}>
        <View style={[styles.typePill, typePillStyle(row.kind)]}>
          <View style={styles.pillInner}>
            <SystemIcon
              name={row.kind === 'payment' ? 'arrowDown' : 'arrowUp'}
              size={12}
              color={row.kind === 'payment' ? palette.green : palette.orange}
            />
            <Text style={styles.typePillTxt} numberOfLines={2}>
              {row.typeLabel}
            </Text>
          </View>
        </View>
      </Cell>
      <Cell width={W.actions} styles={styles}>
        <View style={styles.eyeBtn}>
          <SystemIcon name="eye" size={16} color={palette.textMuted} />
        </View>
      </Cell>
    </>
  );

  if (onRowPress) {
    return (
      <Pressable onPress={() => onRowPress(row)}>
        {({ pressed }) => (
          <View style={[styles.tr, pressed && styles.trPressed]}>
            {rowBody}
          </View>
        )}
      </Pressable>
    );
  }

  return <View style={styles.tr}>{rowBody}</View>;
}

function create_PaymentsTable_styles(c: AppColorPalette) {
  return StyleSheet.create({
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      overflow: 'hidden',
    },
    tr: {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      minHeight: 56,
    },
    trPressed: {
      backgroundColor: 'rgba(255,255,255,0.04)',
    },
    headerTr: {
      backgroundColor: c.bgTableHeader,
    },
    cell: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      justifyContent: 'center',
    },
    cellHeader: {
      paddingVertical: 12,
    },
    th: {
      fontSize: 9,
      fontWeight: '800',
      color: c.textMuted,
      letterSpacing: 0.3,
    },
    td: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    tdBold: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
    },
    tdMoney: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
    },
    orderLineRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 4,
    },
    orderLine: {
      flex: 1,
      fontSize: 12,
      fontWeight: '800',
      color: c.cyan,
    },
    pillInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    payCode: {
      marginTop: 4,
      fontSize: 10,
      fontWeight: '600',
      color: c.textMuted,
    },
    methodPill: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    methodPillTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textPrimary,
    },
    methodTeal: {
      backgroundColor: c.blueBg,
      borderColor: c.blueBorder,
    },
    methodOrange: {
      backgroundColor: c.orangeBg,
      borderColor: c.orangeBorder,
    },
    methodGreen: {
      backgroundColor: c.greenBg,
      borderColor: c.greenBorder,
    },
    methodMuted: {
      backgroundColor: c.statusNeutralBg,
      borderColor: c.border,
    },
    pill: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    pillTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textPrimary,
    },
    pillOrange: {
      backgroundColor: c.orangeBg,
      borderColor: c.orangeBorder,
    },
    pillGreen: {
      backgroundColor: c.greenBg,
      borderColor: c.greenBorder,
    },
    pillRed: {
      backgroundColor: c.redBg,
      borderColor: c.redBorder,
    },
    pillMuted: {
      backgroundColor: c.statusNeutralBg,
      borderColor: c.border,
    },
    typePill: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    typePillTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textPrimary,
    },
    typePay: {
      backgroundColor: c.greenBg,
      borderColor: c.greenBorder,
    },
    typeRefund: {
      backgroundColor: c.orangeBg,
      borderColor: c.orangeBorder,
    },
    eyeBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    },
    empty: {
      paddingVertical: 28,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    emptyTxt: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
    },
  });
}
