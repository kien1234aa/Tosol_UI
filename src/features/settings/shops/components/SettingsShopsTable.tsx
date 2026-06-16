import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { ShopListItem } from '@services/settings/shopResponseTypes';
import { formatDateTimeVi } from '../../../sales/screens/orderDetail/orderDetailFormatters';
import { ProductStatusPill } from '../../../category/products/components/ProductStatusPill';
import type { ProductRowStatus } from '../../../category/products/productListTypes';
import {
  currencyLabelFromId,
  defaultPriceListLabel,
  platformDisplayLabel,
} from '../shopDirectoryLabels';

const W = {
  name: 200,
  platform: 104,
  currency: 88,
  priceList: 132,
  autoSync: 108,
  lastSync: 120,
  status: 108,
  actions: 88,
};

const TABLE_MIN =
  W.name +
  W.platform +
  W.currency +
  W.priceList +
  W.autoSync +
  W.lastSync +
  W.status +
  W.actions;

function TonePill({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <View style={[pillStyles.wrap, { backgroundColor: bg }]}>
      <Text style={[pillStyles.txt, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 140,
  },
  txt: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export type SettingsShopsTableProps = {
  rows: ShopListItem[];
  onView?: (row: ShopListItem) => void;
  onEdit?: (row: ShopListItem) => void;
  onDelete?: (row: ShopListItem) => void;
};

export function SettingsShopsTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: SettingsShopsTableProps) {
  const styles = useThemeStyleSheet(create_styles);
  const palette = useAppColors();

  if (rows.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.empty}>
          <View style={styles.emptyIcoSlot}>
            <SystemIcon name="store" size={36} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTxt}>{'Không có cửa hàng'}</Text>
          <Text style={styles.emptyHint}>
            {'Thử đổi bộ lọc hoặc từ khóa tìm kiếm'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN }}>
          <View style={[styles.tr, styles.trHeader]}>
            <Cell width={W.name} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TÊN CỬA HÀNG'}</Text>
            </Cell>
            <Cell width={W.platform} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SÀN TMĐT'}</Text>
            </Cell>
            <Cell width={W.currency} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TIỀN TỆ'}</Text>
            </Cell>
            <Cell width={W.priceList} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'BẢNG GIÁ MẶC ĐỊNH'}</Text>
            </Cell>
            <Cell width={W.autoSync} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐỒNG BỘ TỰ ĐỘNG'}</Text>
            </Cell>
            <Cell width={W.lastSync} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐỒNG BỘ LẦN CUỐI'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <ShopRow
              key={row.id}
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

type SettingsShopsTableStyles = ReturnType<typeof create_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: SettingsShopsTableStyles;
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

function ShopRow({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: ShopListItem;
  onView?: (row: ShopListItem) => void;
  onEdit?: (row: ShopListItem) => void;
  onDelete?: (row: ShopListItem) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const status: ProductRowStatus =
    row.is_active === true ? 'active' : 'inactive';
  const last =
    row.last_sync_at != null && row.last_sync_at !== ''
      ? formatDateTimeVi(row.last_sync_at)
      : '–';

  return (
    <View style={styles.tr}>
      <Pressable
        style={styles.rowMainPress}
        onPress={() => {
          if (onView) {
            onView(row);
            return;
          }
          onEdit?.(row);
        }}
        disabled={!onView && !onEdit}
        accessibilityRole="button"
        accessibilityLabel={
          onView ? `Chi tiết ${row.name}` : `Sửa ${row.name}`
        }
      >
        <Cell width={W.name} styles={styles}>
          <View style={styles.nameRow}>
            <SystemIcon name="pencil" size={14} color={palette.textMuted} />
            <Text style={styles.nameTxt} numberOfLines={3}>
              {row.name}
            </Text>
          </View>
        </Cell>
        <Cell width={W.platform} styles={styles}>
          <TonePill
            label={platformDisplayLabel(row.platform)}
            bg={palette.orangeBg}
            color={palette.orange}
          />
        </Cell>
        <Cell width={W.currency} styles={styles}>
          <TonePill
            label={currencyLabelFromId(row.currency_id)}
            bg={palette.redBg}
            color={palette.red}
          />
        </Cell>
        <Cell width={W.priceList} styles={styles}>
          <Text style={styles.tdMuted} numberOfLines={2}>
            {defaultPriceListLabel(row)}
          </Text>
        </Cell>
        <Cell width={W.autoSync} styles={styles}>
          <TonePill
            label={row.auto_sync ? 'Bật' : 'Tắt'}
            bg={row.auto_sync ? palette.greenBg : 'rgba(148,163,184,0.2)'}
            color={row.auto_sync ? palette.green : palette.textMuted}
          />
        </Cell>
        <Cell width={W.lastSync} styles={styles}>
          <Text style={styles.td} numberOfLines={2}>
            {last}
          </Text>
        </Cell>
        <Cell width={W.status} styles={styles}>
          <ProductStatusPill status={status} />
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

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    shell: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      overflow: 'hidden',
    },
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      paddingVertical: 36,
      paddingHorizontal: 16,
    },
    empty: {
      alignItems: 'center',
      gap: 8,
    },
    emptyIcoSlot: {
      marginBottom: 4,
    },
    emptyTxt: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
    },
    emptyHint: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      textAlign: 'center',
    },
    tr: {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    trHeader: {
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
      fontSize: 10,
      fontWeight: '800',
      color: c.textSecondary,
      letterSpacing: 0.3,
    },
    td: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textPrimary,
    },
    tdMuted: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
    },
    rowMainPress: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'stretch',
      minWidth: 0,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    nameTxt: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    iconBtn: {
      padding: 6,
    },
  });
}
