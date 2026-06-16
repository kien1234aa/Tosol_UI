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
import type { PurchaseOrderListRow } from '../purchaseTypes';

const W = {
  order: 132,
  supplier: 120,
  warehouse: 148,
  product: 200,
  status: 118,
  progress: 124,
  total: 104,
  expected: 104,
};

const TABLE_MIN =
  W.order +
  W.supplier +
  W.warehouse +
  W.product +
  W.status +
  W.progress +
  W.total +
  W.expected;

export type PurchaseOrderTableProps = {
  rows: PurchaseOrderListRow[];
  onRowPress?: (row: PurchaseOrderListRow) => void;
};

export function PurchaseOrderTable({
  rows,
  onRowPress,
}: PurchaseOrderTableProps) {
  const styles = useThemeStyleSheet(create_PurchaseOrderTable_styles);
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ minWidth: TABLE_MIN }}>
          <View style={[styles.tr, styles.headerTr]}>
            <Cell width={W.order} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MÃ ĐƠN MUA'}</Text>
            </Cell>
            <Cell width={W.supplier} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NHÀ CUNG CẤP'}</Text>
            </Cell>
            <Cell width={W.warehouse} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'KHO HÀNG'}</Text>
            </Cell>
            <Cell width={W.product} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SẢN PHẨM'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.progress} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TIẾN ĐỘ NHẬP KHO'}</Text>
            </Cell>
            <Cell width={W.total} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TỔNG TIỀN'}</Text>
            </Cell>
            <Cell width={W.expected} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NGÀY DỰ KIẾN'}</Text>
            </Cell>
          </View>
          {rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>{'Chưa có đơn mua hàng.'}</Text>
            </View>
          ) : (
            rows.map(r => <PoRowView key={r.id} row={r} onPress={onRowPress} t={t} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

type PurchaseOrderTableStyles = ReturnType<
  typeof create_PurchaseOrderTable_styles
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
  styles: PurchaseOrderTableStyles;
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

function StatusPill({
  row,
  styles,
}: {
  row: PurchaseOrderListRow;
  styles: PurchaseOrderTableStyles;
}) {
  const st =
    row.rowStatus === 'received'
      ? styles.pillOk
      : row.rowStatus === 'confirmed'
      ? styles.pillBlue
      : row.rowStatus === 'partial'
      ? styles.pillOrange
      : row.rowStatus === 'draft'
      ? styles.pillMuted
      : row.rowStatus === 'cancelled'
      ? styles.pillRed
      : styles.pillMuted;
  return (
    <View style={[styles.pill, st]}>
      <Text style={styles.pillTxt} numberOfLines={2}>
        {row.statusLabel}
      </Text>
    </View>
  );
}

function ProgressCell({
  row,
  styles,
}: {
  row: PurchaseOrderListRow;
  styles: PurchaseOrderTableStyles;
}) {
  const pct = row.progressPct;
  return (
    <View style={styles.progWrap}>
      <Text style={styles.progFrac} numberOfLines={1}>
        {row.receivedQty}/{row.expectedQty}
      </Text>
      <Text style={styles.progPct}>{pct}%</Text>
      <View style={styles.progBarBg}>
        <View style={[styles.progBarFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function PoRowView({
  row,
  onPress,
  t,
}: {
  row: PurchaseOrderListRow;
  onPress?: (row: PurchaseOrderListRow) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_PurchaseOrderTable_styles);
  return (
    <Pressable
      onPress={() => onPress?.(row)}
      style={({ pressed }) => [styles.tr, pressed && styles.trPressed]}
    >
      <Cell width={W.order} styles={styles}>
        <View style={styles.orderRow}>
          <SystemIcon name="cart" size={14} color={palette.textSecondary} />
          <Text style={styles.orderNum} numberOfLines={2}>
            {row.orderNumber}
          </Text>
        </View>
      </Cell>
      <Cell width={W.supplier} styles={styles}>
        {row.supplierName ? (
          <Text style={styles.tdBold} numberOfLines={3}>
            {row.supplierName}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.warehouse} styles={styles}>
        {row.warehouseName ? (
          <View style={styles.whBadge}>
            <SystemIcon name="business" size={12} color={palette.tealLight} />
            <Text style={styles.whTxt} numberOfLines={2}>
              {row.warehouseName}
            </Text>
          </View>
        ) : null}
      </Cell>
      <Cell width={W.product} styles={styles}>
        <View style={styles.productCol}>
          <View style={styles.productRow}>
            {row.productThumb ? (
              <Image source={{ uri: row.productThumb }} style={styles.thumb} />
            ) : (
              <View style={styles.thumbPh}>
                <SystemIcon
                  name="package"
                  size={18}
                  color={palette.textMuted}
                />
              </View>
            )}
            {row.productLabel ? (
              <Text style={styles.prodName} numberOfLines={2}>
                {row.productLabel}
              </Text>
            ) : null}
          </View>
          {row.productSecondLabel != null &&
          row.productSecondLabel.length > 0 ? (
            <Text style={styles.prodSecond} numberOfLines={1}>
              {row.productSecondLabel}
            </Text>
          ) : null}
          {row.moreProductsCount > 0 ? (
            <Text style={styles.moreProducts} numberOfLines={1}>
              {t('common.moreProducts', { count: row.moreProductsCount })}
            </Text>
          ) : null}
        </View>
      </Cell>
      <Cell width={W.status} styles={styles}>
        <StatusPill row={row} styles={styles} />
      </Cell>
      <Cell width={W.progress} styles={styles}>
        <ProgressCell row={row} styles={styles} />
      </Cell>
      <Cell width={W.total} styles={styles}>
        {row.totalLabel ? (
          <Text style={styles.tdMoney} numberOfLines={2}>
            {row.totalLabel}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.expected} styles={styles}>
        {row.expectedDateLabel ? (
          <Text style={styles.td} numberOfLines={2}>
            {row.expectedDateLabel}
          </Text>
        ) : null}
      </Cell>
    </Pressable>
  );
}

function create_PurchaseOrderTable_styles(c: AppColorPalette) {
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
    trPressed: {
      backgroundColor: 'rgba(34,211,238,0.06)',
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
      fontSize: 10,
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
    tdMoney: {
      fontSize: 13,
      fontWeight: '800',
      color: c.tealLight,
    },
    orderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    orderNum: {
      flex: 1,
      fontSize: 12,
      fontWeight: '800',
      color: c.textPrimary,
      lineHeight: 16,
    },
    whBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: c.blueBg,
      borderWidth: 1,
      borderColor: c.blueBorder,
    },
    whTxt: {
      flex: 1,
      fontSize: 11,
      fontWeight: '700',
      color: c.blue,
      lineHeight: 15,
    },
    productCol: {
      gap: 4,
      minWidth: 0,
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    prodSecond: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
      marginLeft: 48,
    },
    moreProducts: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textMuted,
      marginLeft: 48,
    },
    thumb: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bgInput,
    },
    thumbPh: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    prodName: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: c.textPrimary,
      lineHeight: 17,
    },
    pill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    pillTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textPrimary,
      textAlign: 'center',
    },
    pillOk: {
      backgroundColor: c.greenBg,
      borderColor: c.greenBorder,
    },
    pillBlue: {
      backgroundColor: c.blueBg,
      borderColor: c.blueBorder,
    },
    pillOrange: {
      backgroundColor: c.orangeBg,
      borderColor: c.orangeBorder,
    },
    pillMuted: {
      backgroundColor: c.statusNeutralBg,
      borderColor: c.border,
    },
    pillRed: {
      backgroundColor: c.redBg,
      borderColor: c.redBorder,
    },
    progWrap: { gap: 4 },
    progFrac: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textPrimary,
    },
    progPct: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
    },
    progBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.border,
      overflow: 'hidden',
    },
    progBarFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.teal,
      maxWidth: '100%',
    },
    empty: {
      paddingVertical: 28,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    emptyTxt: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
    },
  });
}
