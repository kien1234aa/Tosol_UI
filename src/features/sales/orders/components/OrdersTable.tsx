import React from 'react';
import { useTranslation } from 'react-i18next';
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
import type { OrderListRow } from '../orderTypes';
import { OrderStatusPill, PaymentStatusPill } from './OrderStatusPill';

const W = {
  id: 128,
  product: 188,
  customer: 120,
  store: 130,
  total: 88,
  status: 118,
  payment: 124,
  creator: 108,
  date: 92,
};

const TABLE_MIN_WIDTH =
  W.id +
  W.product +
  W.customer +
  W.store +
  W.total +
  W.status +
  W.payment +
  W.creator +
  W.date;

export type OrdersTableProps = {
  rows: OrderListRow[];
  onRowPress?: (row: OrderListRow) => void;
};

export function OrdersTable({ rows, onRowPress }: OrdersTableProps) {
  const styles = useThemeStyleSheet(create_OrdersTable_styles);
  const { t } = useTranslation();

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN_WIDTH }}>
          <View style={[styles.tr, styles.trHeader]}>
            <Cell width={W.id} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MA DON'}</Text>
            </Cell>
            <Cell width={W.product} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SAN PHAM'}</Text>
            </Cell>
            <Cell width={W.customer} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'KHACH HANG'}</Text>
            </Cell>
            <Cell width={W.store} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'CUA HANG'}</Text>
            </Cell>
            <Cell width={W.total} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TONG TIEN'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRANG THAI'}</Text>
            </Cell>
            <Cell width={W.payment} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THANH TOAN'}</Text>
            </Cell>
            <Cell width={W.creator} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NGUOI TAO'}</Text>
            </Cell>
            <Cell width={W.date} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NGAY TAO'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <OrderRow key={row.key} row={row} onPress={onRowPress} t={t} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type OrdersTableStyles = ReturnType<typeof create_OrdersTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: OrdersTableStyles;
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
          numberOfLines={header ? 2 : 3}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function OrderRow({
  row,
  onPress,
  t,
}: {
  row: OrderListRow;
  onPress?: (row: OrderListRow) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_OrdersTable_styles);
  const rowBody = (
    <>
      <Cell width={W.id} styles={styles}>
        <Text style={styles.linkId} numberOfLines={1}>
          {row.id}
        </Text>
      </Cell>
      <Cell width={W.product} styles={styles}>
        <View style={styles.productCol}>
          <View style={styles.productRow}>
            {(row.thumbUrl ?? '').trim().length > 0 ? (
              <Image
                source={{ uri: (row.thumbUrl ?? '').trim() }}
                style={styles.thumbImg}
              />
            ) : (
              <View style={styles.thumb} />
            )}
            <Text style={styles.td} numberOfLines={1}>
              {row.productName}
            </Text>
          </View>
          {row.itemCount === 2 && row.secondProduct != null ? (
            <View style={[styles.productRow, styles.productRowSecond]}>
              {(row.secondProduct.thumbUrl ?? '').trim().length > 0 ? (
                <Image
                  source={{
                    uri: (row.secondProduct.thumbUrl ?? '').trim(),
                  }}
                  style={styles.thumbImg}
                />
              ) : (
                <View style={styles.thumb} />
              )}
              <Text style={styles.td} numberOfLines={1}>
                {row.secondProduct.name}
              </Text>
            </View>
          ) : null}
          {row.itemCount > 2 ? (
            <Text style={styles.moreProducts} numberOfLines={1}>
              {t('orders.list.moreProducts', { count: row.itemCount })}
            </Text>
          ) : null}
        </View>
      </Cell>
      <Cell width={W.customer} styles={styles}>
        <View>
          <Text style={styles.tdBold} numberOfLines={1}>
            {row.customerName}
          </Text>
          <Text style={styles.tdSub} numberOfLines={1}>
            {row.customerPhone}
          </Text>
        </View>
      </Cell>
      <Cell width={W.store} styles={styles}>
        <View style={styles.storeRow}>
          <Text style={styles.td} numberOfLines={2}>
            {row.storeName}
          </Text>
          <SystemIcon name="pencil" size={14} color={palette.textMuted} />
        </View>
      </Cell>
      <Cell width={W.total} styles={styles}>
        <Text style={styles.tdBold} numberOfLines={1}>
          {row.totalAmount}
        </Text>
      </Cell>
      <Cell width={W.status} styles={styles}>
        <OrderStatusPill status={row.status} />
      </Cell>
      <Cell width={W.payment} styles={styles}>
        <PaymentStatusPill status={row.payment} />
      </Cell>
      <Cell width={W.creator} styles={styles}>
        <Text style={styles.td} numberOfLines={2}>
          {row.creatorName}
        </Text>
      </Cell>
      <Cell width={W.date} styles={styles}>
        <Text style={styles.td} numberOfLines={1}>
          {row.createdAtDisplay}
        </Text>
      </Cell>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={() => onPress(row)}>
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

function create_OrdersTable_styles(c: AppColorPalette) {
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
      alignItems: 'flex-start',
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
      alignItems: 'center',
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
    linkId: {
      fontSize: 12,
      fontWeight: '700',
      color: c.cyan,
    },
    productCol: {
      gap: 4,
      minWidth: 0,
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },
    productRowSecond: {
      marginTop: 2,
    },
    moreProducts: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textMuted,
      marginLeft: 36,
      marginTop: 2,
    },
    thumb: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    thumbImg: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    storeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });
}
