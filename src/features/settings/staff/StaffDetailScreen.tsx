import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { store } from '../../../app/store';
import { Button } from '@shared/components/ui/Button';
import { CanvasDetailHeroCard } from '@shared/components/ui/canvasDetail/CanvasDetailHeroCard';
import { DetailScreenTabScroll } from '@shared/components/ui/DetailScreenTabScroll';
import { toast, confirmDialog } from '@shared/components/ui/appFeedback/appFeedback';
import {
  detailScreenMainCol,
  detailScreenRoot,
} from '@shared/components/ui/detailScreenLayout';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { ProductStatusPill } from '../../category/products/components/ProductStatusPill';
import type { ProductRowStatus } from '../../category/products/productListTypes';
import {
  activateStaffUser,
  deactivateStaffUser,
  deleteStaffUser,
  getStaffUserById,
} from '@services/settings/staffAPI';
import type { StaffUserDetailApi } from '@services/settings/staffApiTypes';
import {
  formatStaffCreatedDateVi,
  formatStaffCreatedRelative,
  formatStaffLastLogin,
  staffNameInitials,
  staffRoleLabel,
} from './staffFormatters';
import { StaffChangePasswordModal } from './StaffChangePasswordModal';
import { StaffEditInfoModal } from './StaffEditInfoModal';

export type StaffDetailScreenProps = {
  staffUserId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  reloadSignal?: number;
  /** Sau khi đổi trạng thái người dùng — làm mới danh sách / thống kê. */
  onStaffUpdated?: () => void;
};

export function StaffDetailScreen({
  staffUserId,
  onOpenDrawer,
  onBack,
  reloadSignal = 0,
  onStaffUpdated,
}: StaffDetailScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();
  const [detail, setDetail] = useState<StaffUserDetailApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const load = useCallback(async (goBackOnFail = false) => {
    setError(null);
    try {
      const data = await getStaffUserById(staffUserId);
      setDetail(data);
    } catch (e: unknown) {
      const fallbackRow = store
        .getState()
        .sellerStaff.directoryItems.find(r => r.id === staffUserId);
      if (fallbackRow) {
        setDetail({
          ...fallbackRow,
          seller: null,
          warehouses: [],
        });
        setError(null);
      } else {
        const msg = e instanceof Error ? e.message : 'Không tải được nhân viên';
        toast.error(msg);
        if (goBackOnFail) {
          onBack();
        } else {
          setDetail(null);
          setError(msg);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [staffUserId, onBack]);

  useEffect(() => {
    setLoading(true);
    void load(true);
  }, [load, reloadSignal]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const statusPill: ProductRowStatus | null = useMemo(() => {
    if (detail == null) {
      return null;
    }
    return detail.is_active ? 'active' : 'inactive';
  }, [detail]);

  const emailStatus = useMemo(() => {
    if (!detail?.email_verified_at?.trim()) {
      return 'Chưa xác thực';
    }
    return 'Đã xác thực';
  }, [detail]);

  const warehouseEmpty = useMemo(() => {
    const w = detail?.warehouses;
    return !Array.isArray(w) || w.length === 0;
  }, [detail]);

  const onEdit = useCallback(() => {
    const uuid = detail?.uuid?.trim();
    if (!uuid) {
      toast.error('Không có mã định danh (UUID) để sửa thông tin.');
      return;
    }
    setEditOpen(true);
  }, [detail?.uuid]);

  const onDeactivate = useCallback(async () => {
    if (!detail) {
      return;
    }
    const deactivating = detail.is_active;
    const uuid = detail.uuid?.trim();
    if (!uuid) {
      toast.error('Không có mã định danh (UUID) để gọi API.');
      return;
    }
    const ok = await confirmDialog({
      title: deactivating ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng',
      message: deactivating
        ? `Bạn có chắc muốn vô hiệu hóa ${detail.name}? Người dùng sẽ không thể đăng nhập cho đến khi được kích hoạt.`
        : `Bạn có chắc muốn kích hoạt ${detail.name}?`,
      confirmText: deactivating ? 'Vô hiệu hóa' : 'Kích hoạt',
      destructive: deactivating,
    });
    if (ok) {
      setBusy(true);
      try {
        const next = deactivating
          ? await deactivateStaffUser(uuid)
          : await activateStaffUser(uuid);
        toast.success(deactivating ? `Đã vô hiệu hóa ${detail.name}.` : `Đã kích hoạt ${detail.name}.`);
        setDetail(prev =>
          prev
            ? {
                ...prev,
                ...next,
                seller: prev.seller,
                warehouses: prev.warehouses ?? [],
              }
            : null,
        );
        onStaffUpdated?.();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Không thực hiện được thao tác.');
      } finally {
        setBusy(false);
      }
    }
  }, [detail, onStaffUpdated]);

  const onChangePassword = useCallback(() => {
    const uuid = detail?.uuid?.trim();
    if (!uuid) {
      toast.error('Không có mã định danh (UUID) để đổi mật khẩu.');
      return;
    }
    setPasswordOpen(true);
  }, [detail?.uuid]);

  const onAssignWarehouse = useCallback(() => {
    toast.info('Luồng phân kho sẽ được bổ sung sau.');
  }, []);

  const onDeleteUser = useCallback(async () => {
    if (!detail) {
      return;
    }
    const uuid = detail.uuid?.trim();
    if (!uuid) {
      toast.error('Không có mã định danh (UUID) để xóa người dùng.');
      return;
    }
    const ok = await confirmDialog({
      title: 'Xóa người dùng',
      message: `Bạn có chắc muốn xóa người dùng ${detail.name}? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      destructive: true,
    });
    if (ok) {
      setBusy(true);
      try {
        await deleteStaffUser(uuid);
        toast.success(`Đã xóa người dùng ${detail.name}.`);
        onStaffUpdated?.();
        onBack();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      } finally {
        setBusy(false);
      }
    }
  }, [detail, onBack, onStaffUpdated]);

  const timelineSub = useMemo(() => {
    const org = detail?.seller?.name?.trim();
    if (org) {
      return `${org} · Quản trị`;
    }
    return 'Tổ chức';
  }, [detail]);

  const heroTrailing = useMemo(
    () => (
      <View
        style={[
          styles.heroAvatar,
          { backgroundColor: palette.bgButton },
        ]}
      >
        <Text style={styles.heroAvatarTxt}>
          {staffNameInitials(detail?.name ?? '')}
        </Text>
      </View>
    ),
    [styles.heroAvatar, styles.heroAvatarTxt, palette.bgButton, detail?.name],
  );

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={palette.textSecondary}
      />
    ),
    [refreshing, onRefresh, palette.textSecondary],
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <View style={detailScreenMainCol}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onRefresh}
            style={styles.refreshBtn}
            hitSlop={10}
            accessibilityLabel="Tải lại"
          >
            <SystemIcon name="refresh" size={22} color={palette.cyan} />
          </Pressable>
        </View>

        {loading && !detail ? (
          <DetailScreenSkeleton />
        ) : error && !detail ? (
          <DetailScreenTabScroll
            contentContainerStyle={[
              canvasListScrollContent({ paddingHorizontal: 0 }),
              { paddingBottom: insets.bottom + 24 },
            ]}
          >
            <View style={styles.errBox}>
              <Text style={styles.errTxt}>{error}</Text>
              <Pressable onPress={() => void load(true)} style={styles.retryBtn}>
                <Text style={styles.retryTxt}>Thử lại</Text>
              </Pressable>
            </View>
          </DetailScreenTabScroll>
        ) : detail ? (
          <DetailScreenTabScroll
            contentContainerStyle={[
              canvasListScrollContent({ paddingHorizontal: 0 }),
              { paddingBottom: insets.bottom + 28 },
            ]}
            refreshControl={memoizedRefreshControl}
          >
            <CanvasDetailHeroCard
              title={detail.name}
              subtitle={staffRoleLabel(detail.role)}
              healthLabel="Email"
              healthValue={detail.email}
              statusSlot={
                <View style={styles.heroBadgeRow}>
                  {statusPill ? (
                    <ProductStatusPill status={statusPill} />
                  ) : null}
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: 'rgba(148,163,184,0.22)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleBadgeTxt,
                        { color: palette.textSecondary },
                      ]}
                    >
                      {staffRoleLabel(detail.role)}
                    </Text>
                  </View>
                </View>
              }
              trailing={heroTrailing}
              footer={
                <View style={styles.heroActions}>
                  <Button
                    title="Sửa Thông Tin"
                    variant="primary"
                    size="sm"
                    onPress={onEdit}
                    disabled={busy}
                    style={styles.heroBtn}
                  />
                  <Pressable
                    onPress={() => { void onDeactivate(); }}
                    disabled={busy}
                    style={({ pressed }) => [
                      detail.is_active
                        ? styles.deactivateBtn
                        : styles.activateBtn,
                      pressed && styles.statusToggleBtnPressed,
                    ]}
                  >
                  {detail.is_active ? (
                    <>
                      <SystemIcon
                        name="close"
                        size={16}
                        color={palette.orange}
                      />
                      <Text
                        style={[
                          styles.deactivateBtnTxt,
                          { color: palette.orange },
                        ]}
                      >
                        Vô Hiệu Hóa
                      </Text>
                    </>
                  ) : (
                    <>
                      <SystemIcon
                        name="checkCircle"
                        size={18}
                        color={palette.green}
                      />
                      <Text
                        style={[
                          styles.activateBtnTxt,
                          { color: palette.green },
                        ]}
                      >
                        Kích hoạt
                      </Text>
                    </>
                  )}
                </Pressable>
                </View>
              }
            />

            <DetailCard title="Chi tiết tài khoản" icon="person">
              <View style={styles.gridTwo}>
                <View style={styles.gridCol}>
                  <InfoRowLocal
                    icon="calendar"
                    label="Ngày tạo"
                    value={formatStaffCreatedDateVi(detail.created_at)}
                    styles={styles}
                    iconColor={palette.textMuted}
                  />
                  <InfoRowLocal
                    icon="mail"
                    label="Trạng thái email"
                    value={emailStatus}
                    styles={styles}
                    iconColor={palette.textMuted}
                  />
                </View>
                <View style={styles.gridCol}>
                  <InfoRowLocal
                    icon="time"
                    label="Đăng nhập lần cuối"
                    value={formatStaffLastLogin(detail.last_login_at)}
                    styles={styles}
                    iconColor={palette.textMuted}
                  />
                  <InfoRowLocal
                    icon="document"
                    label="Vai trò"
                    value={staffRoleLabel(detail.role)}
                    styles={styles}
                    iconColor={palette.textMuted}
                  />
                </View>
              </View>
            </DetailCard>

            <DetailCard title="Kho truy cập" icon="cube">
              {warehouseEmpty ? (
                <View style={styles.emptyWh}>
                  <SystemIcon name="cube" size={40} color={palette.textMuted} />
                  <Text style={styles.emptyWhTxt}>Chưa phân công kho</Text>
                </View>
              ) : (
                <Text style={styles.whHint}>
                  Danh sách kho sẽ hiển thị khi có dữ liệu.
                </Text>
              )}
            </DetailCard>

            <DetailCard title="Thao tác nhanh" icon="ellipsis">
              <Pressable style={styles.actionRow} onPress={onChangePassword}>
                <SystemIcon
                  name="document"
                  size={18}
                  color={palette.textMuted}
                />
                <Text style={styles.actionRowTxt}>Đổi mật khẩu</Text>
                <SystemIcon
                  name="chevronForward"
                  size={16}
                  color={palette.textMuted}
                />
              </Pressable>
              <Pressable style={styles.actionRow} onPress={onAssignWarehouse}>
                <SystemIcon name="cube" size={18} color={palette.textMuted} />
                <Text style={styles.actionRowTxt}>Phân kho</Text>
                <SystemIcon
                  name="chevronForward"
                  size={16}
                  color={palette.textMuted}
                />
              </Pressable>
              <Pressable style={styles.actionRow} onPress={() => { void onDeleteUser(); }}>
                <SystemIcon name="trash" size={18} color={palette.red} />
                <Text style={[styles.actionRowTxt, styles.actionDanger]}>
                  Xóa người dùng
                </Text>
                <SystemIcon
                  name="chevronForward"
                  size={16}
                  color={palette.textMuted}
                />
              </Pressable>
            </DetailCard>

            <DetailCard title="Lịch sử hoạt động" icon="time">
              <View style={styles.timeline}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: palette.greenBg },
                  ]}
                >
                  <Text style={[styles.timelinePlus, { color: palette.green }]}>
                    +
                  </Text>
                </View>
                <View style={styles.timelineBody}>
                  <View style={styles.timelineTitleRow}>
                    <Text style={styles.timelineTitle}>
                      {formatStaffCreatedRelative(detail.created_at)}
                    </Text>
                    <SystemIcon
                      name="chevronDown"
                      size={16}
                      color={palette.textMuted}
                    />
                  </View>
                  <Text style={styles.timelineSub}>{timelineSub}</Text>
                </View>
              </View>
            </DetailCard>
          </DetailScreenTabScroll>
        ) : null}
      </View>

      {detail ? (
        <StaffEditInfoModal
          visible={editOpen}
          userUuid={detail.uuid}
          initialName={detail.name}
          initialEmail={detail.email}
          initialPhone={detail.phone?.trim() ?? ''}
          initialRole={String(detail.role)}
          onClose={() => setEditOpen(false)}
          onSaved={u => {
            setDetail(prev =>
              prev
                ? {
                    ...prev,
                    ...u,
                    seller: prev.seller,
                    warehouses: prev.warehouses ?? [],
                  }
                : null,
            );
            onStaffUpdated?.();
            setEditOpen(false);
          }}
        />
      ) : null}

      {detail ? (
        <StaffChangePasswordModal
          visible={passwordOpen}
          userUuid={detail.uuid}
          onClose={() => setPasswordOpen(false)}
        />
      ) : null}
    </View>
  );
}

type StaffDetailStyles = ReturnType<typeof create_styles>;

function InfoRowLocal({
  icon,
  label,
  value,
  styles,
  iconColor,
}: {
  icon: SystemIconName;
  label: string;
  value: string;
  styles: StaffDetailStyles;
  iconColor: string;
}) {
  return (
    <View style={styles.infoRow}>
      <SystemIcon name={icon} size={18} color={iconColor} />
      <View style={styles.infoRowText}>
        <Text style={styles.infoLab}>{label}</Text>
        <Text style={styles.infoVal}>{value}</Text>
      </View>
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { ...detailScreenRoot, backgroundColor: c.bg },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 8,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backArrow: { fontSize: 20, color: c.cyan, fontWeight: '700' },
    backTxt: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    refreshBtn: { padding: 6 },
    scrollContent: { paddingHorizontal: 16, gap: 14 },
    errBox: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    errTxt: { fontSize: 14, fontWeight: '600', color: c.red, marginBottom: 10 },
    retryBtn: { alignSelf: 'flex-start' },
    retryTxt: { fontSize: 15, fontWeight: '800', color: c.cyan },
    hero: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      padding: 16,
      marginBottom: 4,
    },
    heroMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
    },
    heroAvatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    heroAvatarTxt: {
      fontSize: 22,
      fontWeight: '800',
      color: c.textSecondary,
    },
    heroTextCol: { flex: 1, minWidth: 0, gap: 8 },
    heroTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: c.textPrimary,
    },
    heroBadgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    roleBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    roleBadgeTxt: { fontSize: 11, fontWeight: '700' },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    contactTxt: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.textPrimary,
    },
    sellerTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    sellerTagTxt: { fontSize: 12, fontWeight: '700' },
    heroActions: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      alignItems: 'center',
    },
    heroBtn: {
      flexGrow: 1,
      minWidth: 140,
    },
    deactivateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: 'rgba(245,158,11,0.55)',
      backgroundColor: c.orangeBg,
      flexGrow: 1,
      minWidth: 140,
    },
    activateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: 'rgba(39,174,96,0.45)',
      backgroundColor: c.greenBg,
      flexGrow: 1,
      minWidth: 140,
    },
    statusToggleBtnPressed: { opacity: 0.88 },
    deactivateBtnTxt: { fontSize: 14, fontWeight: '700' },
    activateBtnTxt: { fontSize: 14, fontWeight: '700' },
    gridTwo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    gridCol: {
      flex: 1,
      minWidth: 148,
      gap: 14,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    infoRowText: { flex: 1, minWidth: 0 },
    infoLab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 4,
    },
    infoVal: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
    },
    emptyWh: {
      alignItems: 'center',
      paddingVertical: 28,
      gap: 10,
    },
    emptyWhTxt: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textMuted,
    },
    whHint: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    actionRowTxt: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    actionDanger: { color: c.red },
    timeline: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    timelineDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelinePlus: {
      fontSize: 18,
      fontWeight: '800',
      lineHeight: 20,
    },
    timelineBody: { flex: 1, minWidth: 0 },
    timelineTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    timelineTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
      flex: 1,
    },
    timelineSub: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
    },
  });
}
