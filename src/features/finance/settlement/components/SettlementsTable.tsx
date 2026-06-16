import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type {
  SettlementListRow,
  SettlementRowStatus,
} from '../settlementListTypes';

const W = {
  num: 148,
  seller: 128,
  period: 156,
  cod: 100,
  fee: 108,
  net: 132,
  status: 118,
  actions: 52,
};

const TABLE_MIN =
  W.num + W.seller + W.period + W.cod + W.fee + W.net + W.status + W.actions;

export type SettlementsTableProps = {
  rows: SettlementListRow[];
  onRowPress?: (row: SettlementListRow) => void;
};

export function SettlementsTable({ rows, onRowPress }: SettlementsTableProps) {
  const styles = useThemeStyleSheet(create_SettlementsTable_styles);
  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN }}>
          <View style={[styles.tr, styles.headerTr]}>
            <Cell width={W.num} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SỐ ĐỐI SOÁT'}</Text>
            </Cell>
            <Cell width={W.seller} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SELLER'}</Text>
            </Cell>
            <Cell width={W.period} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'KỲ THANH TOÁN'}</Text>
            </Cell>
            <Cell width={W.cod} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'COD ĐÃ THU'}</Text>
            </Cell>
            <Cell width={W.fee} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TỔNG PHÍ'}</Text>
            </Cell>
            <Cell width={W.net} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SỐ TIỀN RÒNG'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTxt}>{'Không có đối soát phù hợp.'}</Text>
            </View>
          ) : (
            rows.map(r => (
              <SettlementRowView key={r.id} row={r} onRowPress={onRowPress} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

type SettlementsTableStyles = ReturnType<typeof create_SettlementsTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: SettlementsTableStyles;
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

function SettlementRowView({
  row,
  onRowPress,
}: {
  row: SettlementListRow;
  onRowPress?: (row: SettlementListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_SettlementsTable_styles);

  function statusPillStyle(s: SettlementRowStatus) {
    switch (s) {
      case 'draft':
        return styles.pillMuted;
      case 'confirmed':
        return styles.pillBlue;
      case 'settled':
        return styles.pillGreen;
      case 'cancelled':
        return styles.pillRed;
      default:
        return styles.pillMuted;
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.tr, pressed && styles.trPressed]}
      onPress={() => onRowPress?.(row)}
    >
      <Cell width={W.num} styles={styles}>
        <Text style={styles.settlementNum} numberOfLines={2}>
          {row.settlementNumber}
        </Text>
      </Cell>
      <Cell width={W.seller} styles={styles}>
        {row.sellerName ? (
          <Text style={styles.tdBold} numberOfLines={2}>
            {row.sellerName}
          </Text>
        ) : null}
        {row.sellerCode ? (
          <Text style={styles.tdMuted} numberOfLines={1}>
            {row.sellerCode}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.period} styles={styles}>
        {row.periodLabel ? (
          <Text style={styles.td} numberOfLines={2}>
            {row.periodLabel}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.cod} styles={styles}>
        {row.codCollectedDisplay ? (
          <Text style={styles.tdCod} numberOfLines={2}>
            {row.codCollectedDisplay}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.fee} styles={styles}>
        {row.totalFeeDisplay ? (
          <Text style={styles.tdFee} numberOfLines={2}>
            {row.totalFeeDisplay}
          </Text>
        ) : null}
      </Cell>
      <Cell width={W.net} styles={styles}>
        {row.netAmountDisplay ? (
          <Text style={styles.tdNet} numberOfLines={2}>
            {row.netAmountDisplay}
          </Text>
        ) : null}
        {row.netDirectionLabel ? (
          <View style={styles.dirBadge}>
            <Text style={styles.dirBadgeTxt} numberOfLines={2}>
              {row.netDirectionLabel}
            </Text>
          </View>
        ) : null}
      </Cell>
      <Cell width={W.status} styles={styles}>
        <View style={[styles.pill, statusPillStyle(row.status)]}>
          <View style={styles.pillInner}>
            {row.status === 'settled' ? (
              <SystemIcon
                name="check"
                size={12}
                color={palette.textPrimary}
              />
            ) : null}
            <Text style={styles.pillTxt} numberOfLines={2}>
              {row.statusLabel}
            </Text>
          </View>
        </View>
      </Cell>
      <Cell width={W.actions} styles={styles}>
        <View style={styles.eyeBtn}>
          <SystemIcon name="eye" size={16} color={palette.textMuted} />
        </View>
      </Cell>
    </Pressable>
  );
}

function create_SettlementsTable_styles(c: AppColorPalette) {
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
      minHeight: 56,
    },
    trPressed: {
      backgroundColor: 'rgba(255,255,255,0.04)',
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
      fontSize: 9,
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
    tdMuted: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 2,
    },
    tdCod: {
      fontSize: 13,
      fontWeight: '800',
      color: c.green,
    },
    tdFee: {
      fontSize: 13,
      fontWeight: '800',
      color: c.red,
    },
    tdNet: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
    },
    settlementNum: {
      fontSize: 12,
      fontWeight: '800',
      color: c.cyan,
    },
    dirBadge: {
      alignSelf: 'flex-start',
      marginTop: 6,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: 'rgba(180,130,70,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(212,165,116,0.45)',
    },
    dirBadgeTxt: {
      fontSize: 10,
      fontWeight: '800',
      color: '#d4a574',
    },
    pill: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    pillInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pillTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textPrimary,
    },
    pillMuted: {
      backgroundColor: c.statusNeutralBg,
      borderColor: c.border,
    },
    pillBlue: {
      backgroundColor: c.blueBg,
      borderColor: c.blueBorder,
    },
    pillGreen: {
      backgroundColor: c.greenBg,
      borderColor: c.greenBorder,
    },
    pillRed: {
      backgroundColor: c.redBg,
      borderColor: c.redBorder,
    },
    eyeBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    },
    empty: {
      paddingVertical: 28,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    emptyTxt: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
    },
  });
}
