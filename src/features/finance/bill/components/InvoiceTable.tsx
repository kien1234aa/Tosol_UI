import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { InvoiceListRow, InvoiceRowStatus } from '../invoiceListTypes';

const W = {
  num: 140,
  seller: 128,
  period: 156,
  total: 112,
  status: 120,
  created: 120,
  actions: 56,
};

const TABLE_MIN =
  W.num + W.seller + W.period + W.total + W.status + W.created + W.actions;

export type InvoiceTableProps = {
  rows: InvoiceListRow[];
  onRowPress?: (row: InvoiceListRow) => void;
};

export function InvoiceTable({ rows, onRowPress }: InvoiceTableProps) {
  const styles = useThemeStyleSheet(create_InvoiceTable_styles);
  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN }}>
          <View style={[styles.tr, styles.headerTr]}>
            <Cell width={W.num} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SỐ HÓA ĐƠN'}</Text>
            </Cell>
            <Cell width={W.seller} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SELLER'}</Text>
            </Cell>
            <Cell width={W.period} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'KỲ THANH TOÁN'}</Text>
            </Cell>
            <Cell width={W.total} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TỔNG CỘNG'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.created} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NGÀY TẠO'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>{'Không có hóa đơn phù hợp.'}</Text>
            </View>
          ) : (
            rows.map(r => (
              <InvoiceRowView key={r.id} row={r} onRowPress={onRowPress} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

type InvoiceTableStyles = ReturnType<typeof create_InvoiceTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: InvoiceTableStyles;
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

function InvoiceRowView({
  row,
  onRowPress,
}: {
  row: InvoiceListRow;
  onRowPress?: (row: InvoiceListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_InvoiceTable_styles);

  function pillStyle(s: InvoiceRowStatus) {
    switch (s) {
      case 'pending':
        return styles.pillOrange;
      case 'partial':
        return styles.pillTeal;
      case 'paid':
        return styles.pillGreen;
      case 'overdue':
        return styles.pillRed;
      case 'draft':
        return styles.pillMuted;
      case 'cancelled':
        return styles.pillRed;
      default:
        return styles.pillMuted;
    }
  }

  const rowBody = (
    <>
      <Cell width={W.num} styles={styles}>
        <Text style={styles.invoiceNum} numberOfLines={2}>
          {row.invoiceNumber}
        </Text>
      </Cell>
      <Cell width={W.seller} styles={styles}>
        <Text style={styles.tdBold} numberOfLines={2}>
          {row.sellerName}
        </Text>
        <Text style={styles.tdMuted} numberOfLines={1}>
          {row.sellerCode}
        </Text>
      </Cell>
      <Cell width={W.period} styles={styles}>
        <Text style={styles.td} numberOfLines={2}>
          {row.periodLabel}
        </Text>
      </Cell>
      <Cell width={W.total} styles={styles}>
        <Text style={styles.tdMoney} numberOfLines={2}>
          {row.totalDisplay}
        </Text>
      </Cell>
      <Cell width={W.status} styles={styles}>
        <View style={[styles.pill, pillStyle(row.status)]}>
          <Text style={styles.pillTxt} numberOfLines={2}>
            {row.statusLabel}
          </Text>
        </View>
      </Cell>
      <Cell width={W.created} styles={styles}>
        <Text style={styles.td} numberOfLines={2}>
          {row.createdAtLabel}
        </Text>
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

function create_InvoiceTable_styles(c: AppColorPalette) {
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
      minHeight: 52,
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
    tdMuted: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 2,
    },
    tdMoney: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
    },
    invoiceNum: {
      fontSize: 12,
      fontWeight: '800',
      color: c.cyan,
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
    pillTeal: {
      backgroundColor: c.blueBg,
      borderColor: c.blueBorder,
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
