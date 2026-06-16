import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { LIST_CARD } from '@shared/theme/designTokens';
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
import type { InventoryRow } from '../myInventoryTypes';
import { isLowStockRow } from '../mockInventoryData';
import { joinInventoryMetaLine } from '@mappers/warehouse/inventoryMappers';

const W = {
  product: 240,
  onHand: 96,
  reserved: 96,
  available: 108,
  actions: 72,
};

const TABLE_MIN_WIDTH =
  W.product + W.onHand + W.reserved + W.available + W.actions;

export type InventoryTableProps = {
  rows: InventoryRow[];
  onView?: (row: InventoryRow) => void;
};

export function InventoryTable({ rows, onView }: InventoryTableProps) {
  const styles = useThemeStyleSheet(create_InventoryTable_styles);

  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: TABLE_MIN_WIDTH }}>
          <View style={[styles.tr, styles.headerTr]}>
            <Cell width={W.product} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SẢN PHẨM'}</Text>
            </Cell>
            <Cell width={W.onHand} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TỒN KHO'}</Text>
            </Cell>
            <Cell width={W.reserved} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐÃ GIỮ'}</Text>
            </Cell>
            <Cell width={W.available} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'CÓ THỂ BÁN'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <InventoryRowView key={row.id} row={row} onView={onView} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type InventoryTableStyles = ReturnType<typeof create_InventoryTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: InventoryTableStyles;
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

function AvailBadge({
  value,
  low,
  styles,
}: {
  value: number;
  low: boolean;
  styles: InventoryTableStyles;
}) {
  return (
    <View style={[styles.badge, low ? styles.badgeWarn : styles.badgeOk]}>
      <Text
        style={[styles.badgeTxt, low && styles.badgeTxtWarn]}
        numberOfLines={1}
      >
        {value.toLocaleString('vi-VN')}
      </Text>
    </View>
  );
}

function InventoryRowView({
  row,
  onView,
}: {
  row: InventoryRow;
  onView?: (row: InventoryRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_InventoryTable_styles);
  const low = isLowStockRow(row);
  const skuLine = joinInventoryMetaLine([row.sku, row.unit]);
  return (
    <View style={styles.tr}>
      <Pressable
        style={styles.rowMainPress}
        onPress={() => onView?.(row)}
        disabled={!onView}
        android_ripple={{ color: 'rgba(34, 211, 238, 0.12)' }}
      >
        <Cell width={W.product} styles={styles}>
          <View style={styles.productRow}>
            {row.imageUrl ? (
              <Image source={{ uri: row.imageUrl }} style={styles.thumb} />
            ) : (
              <View style={styles.thumbPh}>
                <SystemIcon
                  name="package"
                  size={18}
                  color={palette.textMuted}
                />
              </View>
            )}
            <View style={styles.productText}>
              <Text style={styles.name} numberOfLines={3}>
                {row.name}
              </Text>
              {skuLine ? (
                <Text style={styles.skuLine} numberOfLines={1}>
                  {skuLine}
                </Text>
              ) : null}
            </View>
          </View>
        </Cell>
        <Cell width={W.onHand} styles={styles}>
          <View style={styles.onHandRow}>
            {low ? (
              <SystemIcon name="warning" size={16} color={palette.orange} />
            ) : null}
            <Text
              style={[styles.tdBold, low && styles.warnQty]}
              numberOfLines={1}
            >
              {row.onHand.toLocaleString('vi-VN')}
            </Text>
          </View>
        </Cell>
        <Cell width={W.reserved} styles={styles}>
          <Text
            style={[styles.tdBold, row.reserved > 0 && styles.reservedOrange]}
            numberOfLines={1}
          >
            {row.reserved.toLocaleString('vi-VN')}
          </Text>
        </Cell>
        <Cell width={W.available} styles={styles}>
          <AvailBadge value={row.available} low={low} styles={styles} />
        </Cell>
      </Pressable>
      <Cell width={W.actions} styles={styles}>
        <View style={styles.actions}>
          <Pressable
            onPress={() => onView?.(row)}
            style={styles.iconBtn}
            hitSlop={8}
            accessibilityLabel="Xem"
          >
            <SystemIcon name="eye" size={18} color={palette.textMuted} />
          </Pressable>
        </View>
      </Cell>
    </View>
  );
}

function create_InventoryTable_styles(c: AppColorPalette) {
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
    },
    headerTr: {
      backgroundColor: c.bgTableHeader,
    },
    rowMainPress: {
      flexDirection: 'row',
      flex: 1,
      minWidth: 0,
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
      fontSize: 10,
      fontWeight: '800',
      color: c.textMuted,
      letterSpacing: 0.4,
    },
    td: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
    },
    tdBold: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: LIST_CARD.headerGap,
    },
    thumb: {
      width: LIST_CARD.thumbSize,
      height: LIST_CARD.thumbSize,
      borderRadius: 8,
      backgroundColor: c.bgInput,
    },
    thumbPh: {
      width: LIST_CARD.thumbSize,
      height: LIST_CARD.thumbSize,
      borderRadius: 8,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    productText: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    name: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
      lineHeight: 18,
    },
    skuLine: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
    },
    onHandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    warnQty: {
      color: '#fbbf24',
    },
    reservedOrange: {
      color: '#fb923c',
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
    },
    badgeOk: {
      backgroundColor: 'rgba(16,185,129,0.15)',
      borderColor: 'rgba(16,185,129,0.45)',
    },
    badgeWarn: {
      backgroundColor: 'rgba(245,158,11,0.15)',
      borderColor: 'rgba(245,158,11,0.45)',
    },
    badgeTxt: {
      fontSize: 13,
      fontWeight: '800',
      color: '#34d399',
    },
    badgeTxtWarn: {
      color: '#fbbf24',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    iconBtn: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
  });
}
