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
import type {
  GatewayTxnListRow,
  GatewayTxnRowStatus,
} from '../gatewayTransactionListTypes';

const W = {
  provider: 128,
  order: 132,
  amount: 104,
  status: 108,
  type: 96,
  created: 100,
  actions: 52,
};

const TABLE_MIN =
  W.provider + W.order + W.amount + W.status + W.type + W.created + W.actions;

export type GatewayTransactionsTableProps = {
  rows: GatewayTxnListRow[];
  onRowPress?: (row: GatewayTxnListRow) => void;
};

export function GatewayTransactionsTable({
  rows,
  onRowPress,
}: GatewayTransactionsTableProps) {
  const styles = useThemeStyleSheet(create_GatewayTransactionsTable_styles);
  const palette = useAppColors();

  return (
    <View style={styles.card}>
      {rows.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcoSlot}>
            <SystemIcon name="server" size={36} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTxt}>{'Không có dữ liệu'}</Text>
          <Text style={styles.emptyHint}>
            {'Thử đổi bộ lọc hoặc từ khóa tìm kiếm'}
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ minWidth: TABLE_MIN }}>
            <View style={[styles.tr, styles.headerTr]}>
              <Cell width={W.provider} header styles={styles}>
                <Text style={styles.th} numberOfLines={2}>{'NHÀ CUNG CẤP'}</Text>
              </Cell>
              <Cell width={W.order} header styles={styles}>
                <Text style={styles.th} numberOfLines={2}>{'ĐƠN HÀNG'}</Text>
              </Cell>
              <Cell width={W.amount} header styles={styles}>
                <Text style={styles.th} numberOfLines={2}>{'SỐ TIỀN'}</Text>
              </Cell>
              <Cell width={W.status} header styles={styles}>
                <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
              </Cell>
              <Cell width={W.type} header styles={styles}>
                <Text style={styles.th} numberOfLines={2}>{'LOẠI'}</Text>
              </Cell>
              <Cell width={W.created} header styles={styles}>
                <Text style={styles.th} numberOfLines={2}>{'NGÀY TẠO'}</Text>
              </Cell>
              <Cell width={W.actions} header styles={styles}>
                <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
              </Cell>
            </View>
            {rows.map(r => (
              <GatewayTxnRowView key={r.id} row={r} onRowPress={onRowPress} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

type GatewayTransactionsTableStyles = ReturnType<
  typeof create_GatewayTransactionsTable_styles
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
  styles: GatewayTransactionsTableStyles;
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

function GatewayTxnRowView({
  row,
  onRowPress,
}: {
  row: GatewayTxnListRow;
  onRowPress?: (row: GatewayTxnListRow) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_GatewayTransactionsTable_styles);

  function statusPillStyle(s: GatewayTxnRowStatus) {
    switch (s) {
      case 'pending':
        return styles.pillOrange;
      case 'processing':
        return styles.pillTeal;
      case 'completed':
        return styles.pillGreen;
      case 'failed':
        return styles.pillRed;
      default:
        return styles.pillMuted;
    }
  }

  const rowBody = (
    <>
      <Cell width={W.provider} styles={styles}>
        <Text style={styles.tdBold} numberOfLines={3}>
          {row.providerName}
        </Text>
      </Cell>
      <Cell width={W.order} styles={styles}>
        <Text style={styles.orderNum} numberOfLines={2}>
          {row.orderRef}
        </Text>
      </Cell>
      <Cell width={W.amount} styles={styles}>
        <Text style={styles.tdMoney} numberOfLines={2}>
          {row.amountDisplay}
        </Text>
      </Cell>
      <Cell width={W.status} styles={styles}>
        <View style={[styles.pill, statusPillStyle(row.status)]}>
          <View style={styles.pillInner}>
            {row.status === 'completed' ? (
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
      <Cell width={W.type} styles={styles}>
        <View style={styles.typePill}>
          <Text style={styles.typePillTxt} numberOfLines={2}>
            {row.typeLabel}
          </Text>
        </View>
      </Cell>
      <Cell width={W.created} styles={styles}>
        <Text style={styles.td} numberOfLines={2}>
          {row.createdLabel}
        </Text>
      </Cell>
      <Cell width={W.actions} styles={styles}>
        <View style={styles.eyeBtn}>
          <SystemIcon name="eye" size={16} color={palette.textMuted} />
        </View>
      </Cell>
    </>
  );

  if (onRowPress) {
    return (
      <Pressable onPress={() => onRowPress(row)}>
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

function create_GatewayTransactionsTable_styles(c: AppColorPalette) {
  return StyleSheet.create({
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      overflow: 'hidden',
      marginBottom: 12,
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
    tdMoney: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
    },
    orderNum: {
      fontSize: 12,
      fontWeight: '800',
      color: c.cyan,
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
    pillOrange: {
      backgroundColor: c.orangeBg,
      borderColor: c.orangeBorder,
    },
    pillTeal: {
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
    pillMuted: {
      backgroundColor: c.statusNeutralBg,
      borderColor: c.border,
    },
    typePill: {
      alignSelf: 'flex-start',
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(148,163,184,0.1)',
      borderWidth: 1,
      borderColor: c.border,
    },
    typePillTxt: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
    },
    eyeBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    },
    empty: {
      width: '100%',
      paddingVertical: 40,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyIcoSlot: { marginBottom: 8, opacity: 0.45 },
    emptyTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyHint: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 17,
    },
  });
}
