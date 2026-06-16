import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { StaffUserApi } from '@services/settings/staffApiTypes';
import {
  formatStaffLastLogin,
  staffNameInitials,
  staffRoleLabel,
} from '../staffFormatters';

const W = {
  name: 168,
  contact: 200,
  role: 148,
  status: 120,
  login: 96,
  actions: 88,
};

const TABLE_MIN = W.name + W.contact + W.role + W.status + W.login + W.actions;

function RolePill({
  label,
  bg,
  color,
}: {
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <View style={[rolePillStyles.wrap, { backgroundColor: bg }]}>
      <Text style={[rolePillStyles.txt, { color }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const rolePillStyles = StyleSheet.create({
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

function StaffStatusPill({
  active,
  c,
}: {
  active: boolean;
  c: AppColorPalette;
}) {
  if (active) {
    return (
      <View style={[statusStyles.wrap, { backgroundColor: c.greenBg }]}>
        <Text style={[statusStyles.txt, { color: c.green }]} numberOfLines={1}>
          Hoạt động
        </Text>
      </View>
    );
  }
  return (
    <View
      style={[statusStyles.wrap, { backgroundColor: 'rgba(148,163,184,0.2)' }]}
    >
      <Text
        style={[statusStyles.txt, { color: c.textMuted }]}
        numberOfLines={1}
      >
        Không hoạt động
      </Text>
    </View>
  );
}

const statusStyles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 130,
  },
  txt: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export type StaffTableProps = {
  rows: StaffUserApi[];
  actionsLocked?: boolean;
  onView?: (row: StaffUserApi) => void;
  onDelete?: (row: StaffUserApi) => void;
};

export function StaffTable({
  rows,
  actionsLocked = false,
  onView,
  onDelete,
}: StaffTableProps) {
  const styles = useThemeStyleSheet(create_styles);
  const palette = useAppColors();

  if (rows.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.empty}>
          <View style={styles.emptyIcoSlot}>
            <SystemIcon name="person" size={36} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTxt}>{'Chưa có nhân viên'}</Text>
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
              <Text style={styles.th} numberOfLines={2}>{'HỌ TÊN'}</Text>
            </Cell>
            <Cell width={W.contact} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'LIÊN HỆ'}</Text>
            </Cell>
            <Cell width={W.role} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'VAI TRÒ'}</Text>
            </Cell>
            <Cell width={W.status} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'TRẠNG THÁI'}</Text>
            </Cell>
            <Cell width={W.login} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐĂNG NHẬP'}</Text>
            </Cell>
            <Cell width={W.actions} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'THAO TÁC'}</Text>
            </Cell>
          </View>
          {rows.map(row => (
            <StaffRow
              key={row.id}
              row={row}
              actionsLocked={actionsLocked}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type StaffTableStyles = ReturnType<typeof create_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: StaffTableStyles;
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

function StaffRow({
  row,
  actionsLocked,
  onView,
  onDelete,
}: {
  row: StaffUserApi;
  actionsLocked: boolean;
  onView?: (row: StaffUserApi) => void;
  onDelete?: (row: StaffUserApi) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const initials = staffNameInitials(row.name);
  const phoneLine = row.phone?.trim() ? row.phone.trim() : 'Chưa có SĐT';

  const openDetail = () => {
    if (!actionsLocked) {
      onView?.(row);
    }
  };

  return (
    <View style={styles.tr}>
      <Pressable
        style={styles.rowMain}
        onPress={openDetail}
        disabled={!onView || actionsLocked}
        accessibilityRole="button"
        accessibilityLabel={`Chi tiết ${row.name}`}
      >
        <Cell width={W.name} styles={styles}>
          <View style={styles.nameRow}>
            <View
              style={[styles.avatar, { backgroundColor: palette.bgButton }]}
            >
              <Text style={styles.avatarTxt}>{initials}</Text>
            </View>
            <Text style={styles.nameTxt} numberOfLines={3}>
              {row.name}
            </Text>
          </View>
        </Cell>
        <Cell width={W.contact} styles={styles}>
          <Text style={styles.td} numberOfLines={2} selectable>
            {row.email}
          </Text>
          <Text style={styles.phoneTxt} numberOfLines={2} selectable>
            {phoneLine}
          </Text>
        </Cell>
        <Cell width={W.role} styles={styles}>
          <RolePill
            label={staffRoleLabel(row.role)}
            bg="rgba(148,163,184,0.2)"
            color={palette.textSecondary}
          />
        </Cell>
        <Cell width={W.status} styles={styles}>
          <StaffStatusPill active={row.is_active} c={palette} />
        </Cell>
        <Cell width={W.login} styles={styles}>
          <Text style={styles.td} numberOfLines={1}>
            {formatStaffLastLogin(row.last_login_at)}
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
            disabled={actionsLocked}
          >
            <SystemIcon name="eye" size={18} color={palette.textMuted} />
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
    phoneTxt: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    avatarTxt: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textSecondary,
    },
    nameTxt: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
      minWidth: 0,
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
