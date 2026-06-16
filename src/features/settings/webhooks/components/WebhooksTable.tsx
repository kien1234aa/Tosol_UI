import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { SellerWebhookApi } from '@services/settings/webhookApiTypes';
import { ProductStatusPill } from '../../../category/products/components/ProductStatusPill';
import type { ProductRowStatus } from '../../../category/products/productListTypes';

const W = {
  url: 200,
  detail: 168,
  status: 100,
  created: 104,
  actions: 100,
};

const TABLE_MIN = W.url + W.detail + W.status + W.created + W.actions;

function formatCreatedVi(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('vi-VN');
}

function detailLine(row: SellerWebhookApi): string {
  const ev = row.events_label?.trim();
  const desc = row.description?.trim();
  const parts = [desc, ev].filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(' · ') : '—';
}

export type WebhooksTableProps = {
  rows: SellerWebhookApi[];
  actionsLocked?: boolean;
  onEdit?: (row: SellerWebhookApi) => void;
  onDelete?: (row: SellerWebhookApi) => void;
};

export function WebhooksTable({
  rows,
  actionsLocked = false,
  onEdit,
  onDelete,
}: WebhooksTableProps) {
  const styles = useThemeStyleSheet(create_styles);
  const palette = useAppColors();

  if (rows.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.empty}>
          <View style={styles.emptyIcoSlot}>
            <SystemIcon name="server" size={36} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTxt}>{'Chưa có webhook'}</Text>
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
            <Cell width={W.url} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'URL'}</Text>
            </Cell>
            <Cell width={W.detail} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MÔ TẢ / SỰ KIỆN'}</Text>
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
            <WebhookRow
              key={row.id}
              row={row}
              actionsLocked={actionsLocked}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type WebhooksTableStyles = ReturnType<typeof create_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: WebhooksTableStyles;
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
          numberOfLines={header ? 2 : 6}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function WebhookRow({
  row,
  actionsLocked,
  onEdit,
  onDelete,
}: {
  row: SellerWebhookApi;
  actionsLocked: boolean;
  onEdit?: (row: SellerWebhookApi) => void;
  onDelete?: (row: SellerWebhookApi) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const status: ProductRowStatus = row.is_active ? 'active' : 'inactive';

  return (
    <View style={styles.tr}>
      <View style={styles.rowMain}>
        <Cell width={W.url} styles={styles}>
          <View style={styles.urlRow}>
            <SystemIcon name="link" size={14} color={palette.textMuted} />
            <Text style={styles.urlTxt} numberOfLines={3} selectable>
              {row.url}
            </Text>
          </View>
        </Cell>
        <Cell width={W.detail} styles={styles}>
          <Text style={styles.td} numberOfLines={4}>
            {detailLine(row)}
          </Text>
        </Cell>
        <Cell width={W.status} styles={styles}>
          <ProductStatusPill status={status} />
        </Cell>
        <Cell width={W.created} styles={styles}>
          <Text style={styles.td} numberOfLines={1}>
            {formatCreatedVi(row.created_at)}
          </Text>
        </Cell>
      </View>
      <Cell width={W.actions} styles={styles}>
        <View style={styles.actions}>
          <Pressable
            onPress={() => onEdit?.(row)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Sửa"
            disabled={actionsLocked}
          >
            <SystemIcon name="pencil" size={18} color={palette.textMuted} />
          </Pressable>
          <Pressable
            onPress={() => onDelete?.(row)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Xóa"
            disabled={actionsLocked}
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
    rowMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'stretch',
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
      color: c.textSecondary,
      letterSpacing: 0.3,
    },
    td: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textPrimary,
    },
    urlRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    urlTxt: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.tealLight,
      fontVariant: ['tabular-nums'],
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2,
    },
    iconBtn: {
      padding: 6,
    },
  });
}
