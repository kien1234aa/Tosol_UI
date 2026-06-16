import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { BankAccountListItem } from '@services/settings/bankAccountResponseTypes';
import { ProductStatusPill } from '../../../category/products/components/ProductStatusPill';
import type { ProductRowStatus } from '../../../category/products/productListTypes';

const W = {
  holder: 220,
  bankName: 140,
  accountNo: 160,
  status: 108,
  actions: 168,
};

const TABLE_MIN = W.holder + W.bankName + W.accountNo + W.status + W.actions;

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
    maxWidth: 160,
  },
  txt: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export type BankAccountsTableProps = {
  rows: BankAccountListItem[];
  /** Khóa các nút thao tác (đang gọi API). */
  actionsLocked?: boolean;
  onSetDefault?: (row: BankAccountListItem) => void;
  onToggleActive?: (row: BankAccountListItem) => void;
  onEdit?: (row: BankAccountListItem) => void;
  onDelete?: (row: BankAccountListItem) => void;
};

export function BankAccountsTable({
  rows,
  actionsLocked = false,
  onSetDefault,
  onToggleActive,
  onEdit,
  onDelete,
}: BankAccountsTableProps) {
  const styles = useThemeStyleSheet(create_styles);
  const palette = useAppColors();

  if (rows.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.empty}>
          <View style={styles.emptyIcoSlot}>
            <SystemIcon name="card" size={36} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTxt}>{'Chưa có tài khoản ngân hàng'}</Text>
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
            <Cell width={W.holder} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'CHỦ TÀI KHOẢN'}</Text>
            </Cell>
            <Cell width={W.bankName} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TÊN NGÂN HÀNG'}</Text>
            </Cell>
            <Cell width={W.accountNo} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'SỐ TÀI KHOẢN'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <AccountRow
              key={row.id}
              row={row}
              actionsLocked={actionsLocked}
              onSetDefault={onSetDefault}
              onToggleActive={onToggleActive}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type BankAccountsTableStyles = ReturnType<typeof create_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: BankAccountsTableStyles;
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

function AccountRow({
  row,
  actionsLocked,
  onSetDefault,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  row: BankAccountListItem;
  actionsLocked: boolean;
  onSetDefault?: (row: BankAccountListItem) => void;
  onToggleActive?: (row: BankAccountListItem) => void;
  onEdit?: (row: BankAccountListItem) => void;
  onDelete?: (row: BankAccountListItem) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const status: ProductRowStatus = row.is_active ? 'active' : 'inactive';
  const restricted = row.is_default;

  return (
    <View style={styles.tr}>
      <View style={styles.rowMain}>
        <Cell width={W.holder} styles={styles}>
          <View style={styles.holderCol}>
            <View style={styles.nameRow}>
              <SystemIcon
                name="business"
                size={14}
                color={palette.textMuted}
              />
              <Text style={styles.nameTxt} numberOfLines={3}>
                {row.account_name}
              </Text>
            </View>
            {row.is_default ? (
              <TonePill
                label="Mặc định"
                bg={palette.greenBg}
                color={palette.green}
              />
            ) : null}
          </View>
        </Cell>
        <Cell width={W.bankName} styles={styles}>
          <Text style={styles.td} numberOfLines={2}>
            {row.bank_name}
          </Text>
        </Cell>
        <Cell width={W.accountNo} styles={styles}>
          <Text style={styles.tdMono} numberOfLines={2} selectable>
            {row.account_number}
          </Text>
        </Cell>
        <Cell width={W.status} styles={styles}>
          <ProductStatusPill status={status} />
        </Cell>
      </View>
      <Cell width={W.actions} styles={styles}>
        <View style={styles.actions}>
          {restricted ? (
            <Pressable
              onPress={() => onEdit?.(row)}
              hitSlop={8}
              style={styles.iconBtn}
              accessibilityLabel="Sửa"
              disabled={actionsLocked}
            >
              <SystemIcon name="pencil" size={18} color={palette.textMuted} />
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => onSetDefault?.(row)}
                hitSlop={8}
                style={styles.iconBtn}
                accessibilityLabel="Đặt mặc định"
                disabled={actionsLocked}
              >
                <SystemIcon name="star" size={18} color={palette.textMuted} />
              </Pressable>
              <Pressable
                onPress={() => onToggleActive?.(row)}
                hitSlop={8}
                style={styles.iconBtn}
                accessibilityLabel="Bật tắt hoạt động"
                disabled={actionsLocked}
              >
                <SystemIcon
                  name="eyeOff"
                  size={18}
                  color={palette.textMuted}
                />
              </Pressable>
              <Pressable
                onPress={() => onEdit?.(row)}
                hitSlop={8}
                style={styles.iconBtn}
                accessibilityLabel="Sửa"
                disabled={actionsLocked}
              >
                <SystemIcon
                  name="pencil"
                  size={18}
                  color={palette.textMuted}
                />
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
            </>
          )}
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
    tdMono: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textPrimary,
      fontVariant: ['tabular-nums'],
    },
    holderCol: {
      gap: 6,
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
      flexWrap: 'wrap',
      gap: 2,
    },
    iconBtn: {
      padding: 6,
    },
  });
}
