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
import type { PriceListRow } from '../priceListTypes';

const W = {
  code: 100,
  name: 180,
  currency: 88,
  def: 120,
  from: 100,
  to: 100,
  status: 100,
  actions: 100,
};

const TABLE_MIN_WIDTH =
  W.code + W.name + W.currency + W.def + W.from + W.to + W.status + W.actions;

export type PriceListsTableProps = {
  rows: PriceListRow[];
  onView?: (row: PriceListRow) => void;
  onEdit?: (row: PriceListRow) => void;
  onDelete?: (row: PriceListRow) => void;
};

export function PriceListsTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: PriceListsTableProps) {
  const styles = useThemeStyleSheet(create_PriceListsTable_styles);

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN_WIDTH }}>
          <View style={[styles.tr, styles.trHeader]}>
            <Cell width={W.code} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MÃ BẢNG GIÁ'}</Text>
            </Cell>
            <Cell width={W.name} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TÊN BẢNG GIÁ'}</Text>
            </Cell>
            <Cell width={W.currency} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'LOẠI TIỀN'}</Text>
            </Cell>
            <Cell width={W.def} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MẶC ĐỊNH'}</Text>
            </Cell>
            <Cell width={W.from} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'HIỆU LỰC TỪ'}</Text>
            </Cell>
            <Cell width={W.to} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'HIỆU LỰC ĐẾN'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <PriceListRowView
              key={row.key}
              row={row}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type PriceListsTableStyles = ReturnType<typeof create_PriceListsTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: PriceListsTableStyles;
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

function CurrencyBadge({
  code,
  styles,
}: {
  code: string;
  styles: PriceListsTableStyles;
}) {
  return (
    <View style={styles.currBadge}>
      <Text style={styles.currBadgeTxt}>{code}</Text>
    </View>
  );
}

function DefaultBadge({
  isDefault,
  styles,
}: {
  isDefault: boolean;
  styles: PriceListsTableStyles;
}) {
  return (
    <View style={[styles.defBadge, isDefault && styles.defBadgeOn]}>
      <Text
        style={[styles.defBadgeTxt, isDefault && styles.defBadgeTxtOn]}
        numberOfLines={1}
      >
        {isDefault ? 'Mặc định' : 'Không mặc định'}
      </Text>
    </View>
  );
}

function PriceListRowView({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: PriceListRow;
  onView?: (row: PriceListRow) => void;
  onEdit?: (row: PriceListRow) => void;
  onDelete?: (row: PriceListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_PriceListsTable_styles);
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
            {row.code}
          </Text>
        </Cell>
        <Cell width={W.name} styles={styles}>
          <Text style={styles.tdBold} numberOfLines={3}>
            {row.name}
          </Text>
        </Cell>
        <Cell width={W.currency} styles={styles}>
          <CurrencyBadge code={row.currencyCode} styles={styles} />
        </Cell>
        <Cell width={W.def} styles={styles}>
          <DefaultBadge isDefault={row.isDefault} styles={styles} />
        </Cell>
        <Cell width={W.from} styles={styles}>
          <Text style={styles.td} numberOfLines={1}>
            {row.validFromLabel}
          </Text>
        </Cell>
        <Cell width={W.to} styles={styles}>
          <Text style={styles.td} numberOfLines={1}>
            {row.validToLabel}
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
            accessibilityLabel="Xem"
          >
            <SystemIcon name="eye" size={18} color={palette.textMuted} />
          </Pressable>
          {onEdit ? (
            <Pressable
              onPress={() => onEdit(row)}
              hitSlop={8}
              style={styles.iconBtn}
              accessibilityLabel="Sửa"
            >
              <SystemIcon name="pencil" size={18} color={palette.textMuted} />
            </Pressable>
          ) : null}
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

function create_PriceListsTable_styles(c: AppColorPalette) {
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
    },
    codeTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.cyan,
    },
    rowMainPress: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    currBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: 'rgba(220,38,38,0.22)',
      borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.35)',
    },
    currBadgeTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: '#fca5a5',
    },
    defBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
      maxWidth: W.def - 4,
    },
    defBadgeOn: {
      backgroundColor: 'rgba(34,211,238,0.12)',
      borderColor: 'rgba(34,211,238,0.3)',
    },
    defBadgeTxt: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textMuted,
    },
    defBadgeTxtOn: {
      color: c.tealLight,
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
