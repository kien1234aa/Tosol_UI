import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ShipmentListRow } from '../shipmentListTypes';
import { ShipmentStatusPill } from './ShipmentStatusPill';

const W = {
  partner: 140,
  order: 120,
  status: 130,
  recipient: 168,
  cod: 92,
  fee: 88,
  date: 88,
};

const TABLE_MIN_WIDTH =
  W.partner + W.order + W.status + W.recipient + W.cod + W.fee + W.date;

export type ShipmentsTableProps = {
  rows: ShipmentListRow[];
  onRowPress?: (row: ShipmentListRow) => void;
};

export function ShipmentsTable({ rows, onRowPress }: ShipmentsTableProps) {
  const styles = useThemeStyleSheet(create_ShipmentsTable_styles);

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={{ minWidth: TABLE_MIN_WIDTH }}>
          <View style={[styles.tr, styles.trHeader]}>
            <Cell width={W.partner} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐỐI TÁC VC'}</Text>
            </Cell>
            <Cell width={W.order} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'MÃ ĐƠN'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.recipient} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NGƯỜI NHẬN'}</Text>
            </Cell>
            <Cell width={W.cod} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'COD'}</Text>
            </Cell>
            <Cell width={W.fee} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'PHÍ VC'}</Text>
            </Cell>
            <Cell width={W.date} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'NGÀY TẠO'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <ShipmentRow key={row.key} row={row} onPress={onRowPress} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type ShipmentsTableStyles = ReturnType<typeof create_ShipmentsTable_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: ShipmentsTableStyles;
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

function ShipmentRow({
  row,
  onPress,
}: {
  row: ShipmentListRow;
  onPress?: (row: ShipmentListRow) => void;
}) {
  const styles = useThemeStyleSheet(create_ShipmentsTable_styles);
  const rowBody = (
    <>
      <Cell width={W.partner} styles={styles}>
        <View style={styles.partnerRow}>
          {row.partnerLogoUrl ? (
            <Image
              source={{ uri: row.partnerLogoUrl }}
              style={styles.partnerLogo}
            />
          ) : (
            <View style={styles.partnerLogoPh} />
          )}
          <Text style={styles.td} numberOfLines={2}>
            {row.partnerName}
          </Text>
        </View>
      </Cell>
      <Cell width={W.order} styles={styles}>
        <Text style={styles.linkOrder} numberOfLines={1}>
          {row.orderNumber}
        </Text>
      </Cell>
      <Cell width={W.status} styles={styles}>
        <ShipmentStatusPill status={row.status} />
      </Cell>
      <Cell width={W.recipient} styles={styles}>
        <View>
          <Text style={styles.tdBold} numberOfLines={1}>
            {row.recipientName}
          </Text>
          <Text style={styles.tdSub} numberOfLines={1}>
            {row.recipientPhone}
          </Text>
          <Text style={styles.tdSub} numberOfLines={2}>
            {row.recipientAddressShort}
          </Text>
        </View>
      </Cell>
      <Cell width={W.cod} styles={styles}>
        <Text style={styles.tdBold} numberOfLines={1}>
          {row.codDisplay}
        </Text>
      </Cell>
      <Cell width={W.fee} styles={styles}>
        <Text style={styles.td} numberOfLines={1}>
          {row.feeDisplay}
        </Text>
      </Cell>
      <Cell width={W.date} styles={styles}>
        <Text style={styles.td} numberOfLines={1}>
          {row.createdAtDisplay}
        </Text>
      </Cell>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={() => onPress(row)}>
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

function create_ShipmentsTable_styles(c: AppColorPalette) {
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
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      minHeight: 56,
    },
    trPressed: {
      backgroundColor: 'rgba(45,200,200,0.08)',
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
    tdSub: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 2,
    },
    linkOrder: {
      fontSize: 12,
      fontWeight: '700',
      color: c.cyan,
    },
    partnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    partnerLogo: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
    partnerLogoPh: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: c.bgButton,
      borderWidth: 1,
      borderColor: c.border,
    },
  });
}
