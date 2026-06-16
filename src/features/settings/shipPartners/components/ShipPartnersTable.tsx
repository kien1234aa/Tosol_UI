import React from 'react';
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
import type { SellerShippingPartnerApi } from '@services/settings/shipApiTypes';
import { ProductStatusPill } from '../../../category/products/components/ProductStatusPill';
import type { ProductRowStatus } from '../../../category/products/productListTypes';

const W = {
  partner: 220,
  defaultService: 128,
  status: 108,
  created: 112,
  actions: 132,
};

const TABLE_MIN =
  W.partner + W.defaultService + W.status + W.created + W.actions;

function formatCreatedVi(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleDateString('vi-VN');
}

export type ShipPartnersTableProps = {
  rows: SellerShippingPartnerApi[];
  actionsLocked?: boolean;
  /** Giữa Sửa và Xóa — gọi API kiểm tra kết nối. */
  onTestConnection?: (row: SellerShippingPartnerApi) => void;
  onEdit?: (row: SellerShippingPartnerApi) => void;
  onDelete?: (row: SellerShippingPartnerApi) => void;
};

export function ShipPartnersTable({
  rows,
  actionsLocked = false,
  onTestConnection,
  onEdit,
  onDelete,
}: ShipPartnersTableProps) {
  const styles = useThemeStyleSheet(create_styles);
  const palette = useAppColors();

  if (rows.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.empty}>
          <View style={styles.emptyIcoSlot}>
            <SystemIcon name="truck" size={36} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTxt}>
            {'Chưa có kết nối đối tác vận chuyển'}
          </Text>
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
            <Cell width={W.partner} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'ĐỐI TÁC VẬN CHUYỂN'}</Text>
            </Cell>
            <Cell width={W.defaultService} header styles={styles}>
              <Text style={styles.th} numberOfLines={2}>{'DỊCH VỤ MẶC ĐỊNH'}</Text>
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
            <PartnerRow
              key={row.id}
              row={row}
              actionsLocked={actionsLocked}
              onEdit={onEdit}
              onDelete={onDelete}
              onTestConnection={onTestConnection}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type ShipPartnersTableStyles = ReturnType<typeof create_styles>;

function Cell({
  width,
  children,
  header,
  styles,
}: {
  width: number;
  children: React.ReactNode;
  header?: boolean;
  styles: ShipPartnersTableStyles;
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

function PartnerRow({
  row,
  actionsLocked,
  onEdit,
  onDelete,
  onTestConnection,
}: {
  row: SellerShippingPartnerApi;
  actionsLocked: boolean;
  onEdit?: (row: SellerShippingPartnerApi) => void;
  onDelete?: (row: SellerShippingPartnerApi) => void;
  onTestConnection?: (row: SellerShippingPartnerApi) => void;
}) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const sp = row.shipping_partner;
  const name = sp?.name?.trim() || 'Đối tác';
  const code = sp?.code?.trim() || '—';
  const logo = sp?.logo_url?.trim();
  const status: ProductRowStatus = row.is_active ? 'active' : 'inactive';
  const defaultSvc = row.default_service?.trim();

  return (
    <View style={styles.tr}>
      <View style={styles.rowMain}>
        <Cell width={W.partner} styles={styles}>
          <View style={styles.partnerCol}>
            <View style={styles.partnerTop}>
              {logo ? (
                <Image
                  source={{ uri: logo }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.logoSlot}>
                  <SystemIcon
                    name="truck"
                    size={18}
                    color={palette.textMuted}
                  />
                </View>
              )}
              <View style={styles.partnerText}>
                <Text style={styles.partnerName} numberOfLines={2}>
                  {name}
                </Text>
                <Text style={styles.partnerCode} numberOfLines={1}>
                  {code}
                </Text>
              </View>
            </View>
          </View>
        </Cell>
        <Cell width={W.defaultService} styles={styles}>
          <Text style={styles.td} numberOfLines={2}>
            {defaultSvc && defaultSvc.length > 0 ? defaultSvc : '—'}
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
            onPress={() => onTestConnection?.(row)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Kiểm tra kết nối"
            disabled={actionsLocked}
          >
            <SystemIcon name="activity" size={18} color={palette.tealLight} />
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
    partnerCol: {
      gap: 4,
    },
    partnerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: c.bgInput,
    },
    logoSlot: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: c.bgInput,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    partnerText: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    partnerName: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
    },
    partnerCode: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
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
