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
import { ProductStatusPill } from '../../products/components/ProductStatusPill';
import type { SupplierListRow } from '../supplierTypes';

const W = {
  code: 96,
  name: 200,
  contact: 140,
  po: 100,
  status: 100,
  created: 100,
  actions: 88,
};

const TABLE_MIN_WIDTH =
  W.code + W.name + W.contact + W.po + W.status + W.created + W.actions;

export type SuppliersTableProps = {
  rows: SupplierListRow[];
  onView?: (row: SupplierListRow) => void;
  onDelete?: (row: SupplierListRow) => void;
};

export function SuppliersTable({
  rows,
  onView,
  onDelete,
}: SuppliersTableProps) {
  const styles = useThemeStyleSheet(create_SuppliersTable_styles);

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN_WIDTH }}>
          <View style={[styles.tr, styles.trHeader]}>
            <Cell width={W.code} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MÃ NHÀ CUNG CẤP'}</Text>
            </Cell>
            <Cell width={W.name} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TÊN NHÀ CUNG CẤP'}</Text>
            </Cell>
            <Cell width={W.contact} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'LIÊN HỆ'}</Text>
            </Cell>
            <Cell width={W.po} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐƠN MUA HÀNG'}</Text>
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
          {rows.map(row => (
            <SupplierRowView
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

type SuppliersTableStyles = ReturnType<typeof create_SuppliersTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: SuppliersTableStyles;
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

function PoBadge({ n, styles }: { n: number; styles: SuppliersTableStyles }) {
  return (
    <View style={styles.poBadge}>
      <Text style={styles.poBadgeTxt}>{n.toLocaleString('vi-VN')}</Text>
    </View>
  );
}

function SupplierRowView({
  row,
  onView,
  onDelete,
}: {
  row: SupplierListRow;
  onView?: (row: SupplierListRow) => void;
  onDelete?: (row: SupplierListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_SuppliersTable_styles);
  return (
    <View style={styles.tr}>
      <Pressable
        style={styles.rowMainPress}
        onPress={() => onView?.(row)}
        disabled={!onView}
        accessibilityRole="button"
        accessibilityLabel={`Chi tiết ${row.name}`}
      >
        <Cell width={W.code} styles={styles}>
          <Text style={styles.codeTxt} numberOfLines={2}>
            {row.codeLabel.length > 0 ? row.codeLabel : '—'}
          </Text>
        </Cell>
        <Cell width={W.name} styles={styles}>
          <View style={styles.nameRow}>
            <SystemIcon name="business" size={14} color={palette.textMuted} />
            <Text style={styles.tdBold} numberOfLines={3}>
              {row.name}
            </Text>
          </View>
        </Cell>
        <Cell width={W.contact} styles={styles}>
          <Text style={styles.td} numberOfLines={3}>
            {row.contactLabel ?? '—'}
          </Text>
        </Cell>
        <Cell width={W.po} styles={styles}>
          <PoBadge n={row.purchaseOrdersCount} styles={styles} />
        </Cell>
        <Cell width={W.status} styles={styles}>
          <ProductStatusPill status={row.status} />
        </Cell>
        <Cell width={W.created} styles={styles}>
          <Text style={styles.td} numberOfLines={1}>
            {row.createdLabel}
          </Text>
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

function create_SuppliersTable_styles(c: AppColorPalette) {
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
    tdBold: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textPrimary,
      flex: 1,
      minWidth: 0,
    },
    codeTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.cyan,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
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
