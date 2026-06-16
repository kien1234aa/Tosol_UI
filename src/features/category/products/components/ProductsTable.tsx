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
import type { ProductListRow } from '../productListTypes';
import { ProductStatusPill } from './ProductStatusPill';

const W = {
  sku: 152,
  name: 200,
  price: 72,
  total: 88,
  avail: 120,
  wh: 52,
  status: 100,
  actions: 72,
};

const TABLE_MIN_WIDTH =
  W.sku + W.name + W.price + W.total + W.avail + W.wh + W.status + W.actions;

export type ProductsTableProps = {
  rows: ProductListRow[];
  onView?: (row: ProductListRow) => void;
  onDelete?: (row: ProductListRow) => void;
};

export function ProductsTable({ rows, onView, onDelete }: ProductsTableProps) {
  const styles = useThemeStyleSheet(create_ProductsTable_styles);

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN_WIDTH }}>
          <View style={[styles.tr, styles.trHeader]}>
            <Cell width={W.sku} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MÃ SKU'}</Text>
            </Cell>
            <Cell width={W.name} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TÊN SẢN PHẨM'}</Text>
            </Cell>
            <Cell width={W.price} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'GIÁ'}</Text>
            </Cell>
            <Cell width={W.total} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TỔNG TỒN'}</Text>
            </Cell>
            <Cell width={W.avail} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TỒN KHẢ DỤNG'}</Text>
            </Cell>
            <Cell width={W.wh} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'KHO'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <ProductRow
              key={row.key}
              row={row}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type ProductsTableStyles = ReturnType<typeof create_ProductsTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: ProductsTableStyles;
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

function formatPrice(n: number): string {
  if (n <= 0) {
    return '0';
  }
  return n.toLocaleString('vi-VN');
}

function ProductRow({
  row,
  onView,
  onDelete,
}: {
  row: ProductListRow;
  onView?: (row: ProductListRow) => void;
  onDelete?: (row: ProductListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_ProductsTable_styles);
  const availMain = row.totalStock - row.reserved;
  const availText =
    row.reserved > 0
      ? `${availMain.toLocaleString('vi-VN')} (${row.reserved.toLocaleString(
          'vi-VN',
        )} Đã giữ)`
      : availMain.toLocaleString('vi-VN');

  return (
    <View style={styles.tr}>
      <Pressable
        style={styles.rowMainPress}
        onPress={() => onView?.(row)}
        disabled={!onView}
        accessibilityRole="button"
        accessibilityLabel={`Chi tiết ${row.name}`}
        android_ripple={{ color: 'rgba(34, 211, 238, 0.12)' }}
      >
        <Cell width={W.sku} styles={styles}>
          <View style={styles.skuRow}>
            {row.thumbUrl ? (
              <Image source={{ uri: row.thumbUrl }} style={styles.thumbImg} />
            ) : (
              <View style={styles.thumbPh} />
            )}
            <Text style={styles.skuText} numberOfLines={2}>
              {row.sku}
            </Text>
          </View>
        </Cell>
        <Cell width={W.name} styles={styles}>
          <Text style={styles.tdBold} numberOfLines={3}>
            {row.name}
          </Text>
        </Cell>
        <Cell width={W.price} styles={styles}>
          <Text style={styles.tdBold} numberOfLines={1}>
            {row.priceDisplay || formatPrice(0)}
          </Text>
        </Cell>
        <Cell width={W.total} styles={styles}>
          <View style={styles.stockBox}>
            <Text style={styles.stockBoxTxt} numberOfLines={1}>
              {row.totalStock.toLocaleString('vi-VN')}
            </Text>
          </View>
        </Cell>
        <Cell width={W.avail} styles={styles}>
          <Text style={styles.td} numberOfLines={3}>
            {availText}
          </Text>
        </Cell>
        <Cell width={W.wh} styles={styles}>
          <Text style={styles.tdBold} numberOfLines={1}>
            {row.warehouseCount}
          </Text>
        </Cell>
        <Cell width={W.status} styles={styles}>
          <ProductStatusPill status={row.status} />
        </Cell>
      </Pressable>
      <Cell width={W.actions} styles={styles}>
        <View style={styles.actions}>
          <Pressable
            onPress={() => onView?.(row)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Xem chi tiết"
          >
            <SystemIcon name="eye" size={18} color={palette.textMuted} />
          </Pressable>
          <Pressable
            onPress={() => onDelete?.(row)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Xóa"
          >
            <SystemIcon name="trash" size={18} color={palette.red} />
          </Pressable>
        </View>
      </Cell>
    </View>
  );
}

function create_ProductsTable_styles(c: AppColorPalette) {
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
      alignItems: 'stretch',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      minHeight: 56,
    },
    rowMainPress: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
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
    skuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    thumbPh: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    thumbImg: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    skuText: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700',
      color: c.cyan,
      minWidth: 0,
    },
    stockBox: {
      alignSelf: 'flex-start',
      backgroundColor: c.greenBg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    stockBoxTxt: {
      fontSize: 12,
      fontWeight: '800',
      color: c.green,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    iconBtn: {
      padding: 4,
    },
  });
}
