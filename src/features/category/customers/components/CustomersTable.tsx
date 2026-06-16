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
import type { CustomerListRow } from '../customerListTypes';

const W = {
  name: 140,
  contact: 150,
  address: 160,
  orders: 88,
  created: 96,
  actions: 88,
};

const TABLE_MIN_WIDTH =
  W.name + W.contact + W.address + W.orders + W.created + W.actions;

export type CustomersTableProps = {
  rows: CustomerListRow[];
  onView?: (row: CustomerListRow) => void;
  onDelete?: (row: CustomerListRow) => void;
};

export function CustomersTable({
  rows,
  onView,
  onDelete,
}: CustomersTableProps) {
  const styles = useThemeStyleSheet(create_CustomersTable_styles);

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN_WIDTH }}>
          <View style={[styles.tr, styles.trHeader]}>
            <Cell width={W.name} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TÊN KHÁCH HÀNG'}</Text>
            </Cell>
            <Cell width={W.contact} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'LIÊN HỆ'}</Text>
            </Cell>
            <Cell width={W.address} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐỊA CHỈ'}</Text>
            </Cell>
            <Cell width={W.orders} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TỔNG SỐ ĐƠN HÀNG'}</Text>
            </Cell>
            <Cell width={W.created} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NGÀY TẠO'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <CustomerRowView
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

type CustomersTableStyles = ReturnType<typeof create_CustomersTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: CustomersTableStyles;
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
          numberOfLines={header ? 2 : 5}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function OrdersBadge({
  n,
  styles,
}: {
  n: number;
  styles: CustomersTableStyles;
}) {
  return (
    <View style={styles.poBadge}>
      <Text style={styles.poBadgeTxt}>{n.toLocaleString('vi-VN')}</Text>
    </View>
  );
}

function CustomerRowView({
  row,
  onView,
  onDelete,
}: {
  row: CustomerListRow;
  onView?: (row: CustomerListRow) => void;
  onDelete?: (row: CustomerListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_CustomersTable_styles);
  return (
    <View style={styles.tr}>
      <Pressable
        style={styles.rowMainPress}
        onPress={() => onView?.(row)}
        disabled={!onView}
        accessibilityRole="button"
        accessibilityLabel={`Chi tiết ${row.name}`}
      >
        <Cell width={W.name} styles={styles}>
          <Text style={styles.nameTxt} numberOfLines={3}>
            {row.name}
          </Text>
        </Cell>
        <Cell width={W.contact} styles={styles}>
          {row.phoneLabel || row.emailLabel ? (
            <View style={styles.contactStack}>
              {row.phoneLabel ? (
                <View style={styles.contactRow}>
                  <SystemIcon
                    name="call"
                    size={12}
                    color={palette.textSecondary}
                  />
                  <Text style={styles.contactLine} numberOfLines={2}>
                    {row.phoneLabel}
                  </Text>
                </View>
              ) : null}
              {row.emailLabel ? (
                <View style={styles.contactRow}>
                  <SystemIcon name="mail" size={12} color={palette.textMuted} />
                  <Text style={styles.contactLineMuted} numberOfLines={2}>
                    {row.emailLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </Cell>
        <Cell width={W.address} styles={styles}>
          {row.addressLabel ? (
            <Text style={styles.td} numberOfLines={4}>
              {row.addressLabel}
            </Text>
          ) : null}
        </Cell>
        <Cell width={W.orders} styles={styles}>
          <OrdersBadge n={row.ordersCount} styles={styles} />
        </Cell>
        <Cell width={W.created} styles={styles}>
          {row.createdLabel ? (
            <Text style={styles.td} numberOfLines={1}>
              {row.createdLabel}
            </Text>
          ) : null}
        </Cell>
      </Pressable>
      <Cell width={W.actions} styles={styles}>
        <View style={styles.actions}>
          <Pressable
            onPress={() => onView?.(row)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Xem"
          >
            <SystemIcon name="eye" size={18} color={palette.textMuted} />
          </Pressable>
          {onDelete ? (
            <Pressable
              onPress={() => onDelete(row)}
              hitSlop={8}
              style={styles.iconBtn}
              accessibilityLabel="Xóa"
            >
              <SystemIcon name="trash" size={18} color={palette.red} />
            </Pressable>
          ) : null}
        </View>
      </Cell>
    </View>
  );
}

function create_CustomersTable_styles(c: AppColorPalette) {
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
    nameTxt: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textPrimary,
    },
    contactStack: { gap: 4 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    contactLine: {
      flex: 1,
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
    },
    contactLineMuted: {
      flex: 1,
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
    },
    rowMainPress: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    poBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: 'rgba(34,211,238,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(34,211,238,0.35)',
    },
    poBadgeTxt: {
      fontSize: 12,
      fontWeight: '800',
      color: c.cyan,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    iconBtn: {
      padding: 4,
    },
  });
}
