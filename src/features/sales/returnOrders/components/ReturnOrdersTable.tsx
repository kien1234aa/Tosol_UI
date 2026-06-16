import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { ReturnOrderListRow } from '../returnOrderListTypes';
import {
  ReturnOrderStatusPill,
  ReturnOrderTypePill,
  ReturnRefundStatusPill,
} from './ReturnOrderPills';

const W = {
  returnCode: 128,
  origin: 120,
  product: 168,
  status: 118,
  rtype: 108,
  reason: 120,
  refund: 96,
  refundSt: 108,
};

const TABLE_MIN_WIDTH = Object.values(W).reduce((a, b) => a + b, 0);

export type ReturnOrdersTableProps = {
  rows: ReturnOrderListRow[];
  onRowPress?: (row: ReturnOrderListRow) => void;
};

export function ReturnOrdersTable({
  rows,
  onRowPress,
}: ReturnOrdersTableProps) {
  const styles = useThemeStyleSheet(create_ReturnOrdersTable_styles);

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN_WIDTH }}>
          <View style={[styles.tr, styles.trHeader]}>
            <Cell width={W.returnCode} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MÃ ĐƠN TRẢ'}</Text>
            </Cell>
            <Cell width={W.origin} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐƠN HÀNG GỐC'}</Text>
            </Cell>
            <Cell width={W.product} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SẢN PHẨM'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.rtype} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'LOẠI TRẢ'}</Text>
            </Cell>
            <Cell width={W.reason} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'LÝ DO TRẢ'}</Text>
            </Cell>
            <Cell width={W.refund} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SỐ TIỀN HOÀN'}</Text>
            </Cell>
            <Cell width={W.refundSt} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TT HOÀN TIỀN'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <ReturnOrderRow key={row.key} row={row} onPress={onRowPress} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type ReturnOrdersTableStyles = ReturnType<
  typeof create_ReturnOrdersTable_styles
>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: ReturnOrdersTableStyles;
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

function ReturnOrderRow({
  row,
  onPress,
}: {
  row: ReturnOrderListRow;
  onPress?: (row: ReturnOrderListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ReturnOrdersTable_styles);
  const body = (
    <>
      <Cell width={W.returnCode} styles={styles}>
        <Text style={styles.linkCode} numberOfLines={1}>
          {row.returnCode}
        </Text>
        {row.sellerName ? (
          <Text style={styles.tdSub} numberOfLines={1}>
            {row.sellerName}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.origin} styles={styles}>
        {row.originOrderNumber ? (
          <View style={styles.originRow}>
            <SystemIcon name="cart" size={14} color={palette.textSecondary} />
            <Text style={styles.linkOrder} numberOfLines={1}>
              {row.originOrderNumber}
            </Text>
          </View>
        ) : null}
      </Cell>
      <Cell width={W.product} styles={styles}>
        <View style={styles.prodRow}>
          {row.thumbUrl ? (
            <Image source={{ uri: row.thumbUrl }} style={styles.thumb} />
          ) : (
            <View style={styles.thumbPh} />
          )}
          {row.productName ? (
            <Text style={styles.td} numberOfLines={2}>
              {row.productName}
            </Text>
          ) : null}
        </View>
      </Cell>
      <Cell width={W.status} styles={styles}>
        <ReturnOrderStatusPill status={row.status} />
      </Cell>
      <Cell width={W.rtype} styles={styles}>
        <ReturnOrderTypePill type={row.returnType} />
      </Cell>
      <Cell width={W.reason} styles={styles}>
        {row.reason ? (
          <Text style={styles.td} numberOfLines={3}>
            {row.reason}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.refund} styles={styles}>
        {row.refundDisplay ? (
          <Text style={styles.tdBold} numberOfLines={1}>
            {row.refundDisplay}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.refundSt} styles={styles}>
        {row.refundStatusLabel ? (
          <ReturnRefundStatusPill status={row.refundStatus} />
        ) : null}
      </Cell>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={() => onPress(row)}>
        {({ pressed }) => (
          <View style={[styles.tr, pressed && styles.trPressed]}>{body}</View>
        )}
      </Pressable>
    );
  }

  return <View style={styles.tr}>{body}</View>;
}

function create_ReturnOrdersTable_styles(c: AppColorPalette) {
  return StyleSheet.create({
    shell: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      overflow: 'hidden',
    },
    tr: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      minHeight: 56,
    },
    trPressed: {
      backgroundColor: 'rgba(45,200,200,0.08)',
    },
    trHeader: {
      backgroundColor: c.bgTableHeaderAlt,
      minHeight: 44,
    },
    cell: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      justifyContent: 'center',
    },
    cellHeader: {
      paddingVertical: 10,
    },
    th: {
      fontSize: 10,
      fontWeight: '800',
      color: c.textMuted,
      letterSpacing: 0.4,
    },
    td: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    tdBold: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textPrimary,
    },
    tdSub: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 2,
    },
    linkCode: {
      fontSize: 12,
      fontWeight: '800',
      color: c.cyan,
    },
    linkOrder: {
      fontSize: 12,
      fontWeight: '700',
      color: c.cyan,
      flex: 1,
    },
    originRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    prodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    thumb: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    thumbPh: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
  });
}
