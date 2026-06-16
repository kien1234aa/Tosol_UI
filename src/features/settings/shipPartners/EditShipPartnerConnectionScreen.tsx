import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { ListMobileCardSkeleton } from '@shared/components/ui/skeleton/ListMobileCardSkeleton';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  testSellerShippingPartnerConnection,
  updateSellerShippingPartner,
} from '@services/settings/shipPartnerAPI';
import { FormMenuSelect } from '../shops/components/FormMenuSelect';
import { fetchShipPartnerDirectory } from '@services/settings/shipPartnerSlice';
import {
  BEST_EXPRESS_CONNECTION_GUIDE,
  GENERIC_SHIP_PARTNER_GUIDE,
  buildDefaultServiceOptions,
  isBestExpressPartner,
} from './shipPartnerFormUtils';

function readCredential(
  cred: Record<string, string> | null | undefined,
  keys: string[],
): string {
  if (!cred) {
    return '';
  }
  for (const k of keys) {
    const v = cred[k];
    if (typeof v === 'string' && v.trim()) {
      return v.trim();
    }
  }
  return '';
}

export type EditShipPartnerConnectionScreenProps = {
  sellerShippingPartnerSellerId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  onSaved?: () => void;
};

export function EditShipPartnerConnectionScreen({
  sellerShippingPartnerSellerId,
  onOpenDrawer,
  onBack,
  onSaved,
}: EditShipPartnerConnectionScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { directoryItems, directoryLoading } = useAppSelector(
    s => s.shipPartner,
  );

  const [hydrating, setHydrating] = useState(false);
  const [hydrateAttempted, setHydrateAttempted] = useState(false);

  const row = useMemo(
    () =>
      directoryItems.find(r => r.id === sellerShippingPartnerSellerId) ?? null,
    [directoryItems, sellerShippingPartnerSellerId],
  );

  useEffect(() => {
    if (row != null) {
      setHydrateAttempted(false);
      return;
    }
    if (hydrateAttempted) {
      return;
    }
    setHydrating(true);
    setHydrateAttempted(true);
    void dispatch(
      fetchShipPartnerDirectory({
        page: 1,
        per_page: 100,
        status: 'all',
      }),
    ).finally(() => setHydrating(false));
  }, [row, hydrateAttempted, dispatch]);

  const serviceOptions = useMemo(() => {
    if (!row) {
      return [];
    }
    return buildDefaultServiceOptions(
      row.shipping_partner,
      row.default_service,
    );
  }, [row]);

  const [defaultService, setDefaultService] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [webhookToken, setWebhookToken] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const formHydratedForId = useRef<number | null>(null);
  useEffect(() => {
    if (!row || serviceOptions.length === 0) {
      return;
    }
    if (formHydratedForId.current === row.id) {
      return;
    }
    formHydratedForId.current = row.id;
    const cur = row.default_service?.trim();
    const nextDefault =
      cur && serviceOptions.some(o => o.key === cur)
        ? cur
        : serviceOptions[0]?.key ?? '';
    setDefaultService(nextDefault);
    setUsername(
      readCredential(row.credentials, [
        'username',
        'v9_username',
        'user_name',
        'account',
      ]),
    );
    setPassword('');
    setWebhookToken(
      readCredential(row.credentials, [
        'webhook_token',
        'webhookToken',
        'webhook',
      ]),
    );
    setIsActive(row.is_active);
  }, [row, serviceOptions]);

  const partner = row?.shipping_partner;
  const partnerMenuOptions = useMemo(() => {
    if (!partner) {
      return [];
    }
    const label = partner.name?.trim() || 'Đối tác';
    return [{ key: 'fixed', label }];
  }, [partner]);

  const guideTitle = useMemo(() => {
    if (partner && isBestExpressPartner(partner)) {
      return 'Hướng dẫn kết nối Best Express';
    }
    return 'Hướng dẫn kết nối';
  }, [partner]);

  const guideBody = useMemo(() => {
    if (partner && isBestExpressPartner(partner)) {
      return BEST_EXPRESS_CONNECTION_GUIDE;
    }
    return GENERIC_SHIP_PARTNER_GUIDE;
  }, [partner]);

  const onTestConnection = useCallback(() => {
    if (!row) {
      return;
    }
    void (async () => {
      setTestLoading(true);
      try {
        const res = await testSellerShippingPartnerConnection(row.id);
        const when = res.tested_at
          ? new Date(res.tested_at).toLocaleString('vi-VN')
          : '';
        toast.info(
          [
            res.message?.trim() || 'Thành công.',
            when ? `Thời điểm: ${when}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
        );
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      } finally {
        setTestLoading(false);
      }
    })();
  }, [row]);

  const handleSubmit = useCallback(() => {
    if (!row) {
      return;
    }
    const u = username.trim();
    if (!u) {
      toast.warning('Vui lòng nhập tài khoản đăng nhập (Username V9).');
      return;
    }
    if (!defaultService.trim()) {
      toast.warning('Vui lòng chọn dịch vụ mặc định.');
      return;
    }
    const cred: Record<string, string> = { username: u };
    const p = password.trim();
    if (p) {
      cred.password = p;
    }
    const w = webhookToken.trim();
    if (w) {
      cred.webhook_token = w;
    }
    void (async () => {
      setSubmitting(true);
      try {
        await updateSellerShippingPartner(row.id, {
          default_service: defaultService.trim(),
          is_active: isActive,
          credentials: cred,
        });
        toast.success('Đã cập nhật cấu hình kết nối.');
        onSaved?.();
        onBack();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      } finally {
        setSubmitting(false);
      }
    })();
  }, [
    row,
    username,
    password,
    webhookToken,
    defaultService,
    isActive,
    onSaved,
    onBack,
  ]);

  const busy = directoryLoading || hydrating;
  const notFound = !row && !busy && hydrateAttempted;

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            canvasListScrollContent({ paddingHorizontal: 0 }),
            { paddingBottom: insets.bottom + 28 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DetailCard title="Sửa kết nối" icon="pencil">
            {busy && !row ? (
              <ListMobileCardSkeleton withLeading={false} />
            ) : null}

            {notFound ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>Không tìm thấy kết nối này.</Text>
                <Pressable onPress={onBack} style={styles.retryBtn}>
                  <Text style={styles.retryTxt}>Quay lại</Text>
                </Pressable>
              </View>
            ) : null}

            {row && partner ? (
              <View style={styles.formBlock}>
                <FormMenuSelect
                  label="Đối tác vận chuyển"
                  required
                  sheetTitle="Đối tác"
                  options={partnerMenuOptions}
                  value="fixed"
                  onChange={() => {}}
                  disabled
                  hint="Không đổi đối tác khi sửa kết nối."
                />

                <View style={styles.partnerCard}>
                  {partner.logo_url ? (
                    <Image
                      source={{ uri: partner.logo_url }}
                      style={styles.partnerLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.partnerLogoSlot}>
                      <SystemIcon
                        name="truck"
                        size={22}
                        color={palette.textMuted}
                      />
                    </View>
                  )}
                  <View style={styles.partnerCardText}>
                    <Text style={styles.partnerCardName} numberOfLines={2}>
                      {partner.name?.trim() || '—'}
                    </Text>
                    <Text style={styles.partnerCardCode} numberOfLines={1}>
                      {partner.code?.trim() || '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.guideBox}>
                  <View style={styles.guideAccent} />
                  <View style={styles.guideInner}>
                    <Text style={styles.guideTitle}>{guideTitle}</Text>
                    <Text style={styles.guideBody}>{guideBody}</Text>
                  </View>
                </View>

                <FormMenuSelect
                  label="Dịch vụ mặc định"
                  sheetTitle="Chọn dịch vụ"
                  options={serviceOptions}
                  value={defaultService}
                  onChange={setDefaultService}
                  hint="Chọn loại dịch vụ vận chuyển mặc định"
                />

                <View style={styles.sectionHead}>
                  <SystemIcon
                    name="server"
                    size={18}
                    color={palette.tealLight}
                  />
                  <Text style={styles.sectionTitle}>
                    Thông Tin Xác Thực API
                  </Text>
                  <View style={styles.sectionLine} />
                </View>

                <TextField
                  label="Password (V9)"
                  variant="dark"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  isPassword
                  editable={!submitting}
                  startIcon={
                    <SystemIcon
                      name="document"
                      size={18}
                      color={palette.textMuted}
                    />
                  }
                  containerStyle={styles.fieldGap}
                />
                <Text style={styles.inlineHint}>
                  Mật khẩu đăng nhập hệ thống V9. Để trống nếu không đổi mật
                  khẩu.
                </Text>

                <TextField
                  label="Username (V9) *"
                  variant="dark"
                  value={ username}
                  onChangeText={setUsername}
                  placeholder="cus632948"
                  editable={!submitting}
                  startIcon={
                    <SystemIcon
                      name="document"
                      size={18}
                      color={palette.textMuted}
                    />
                  }
                  containerStyle={styles.fieldGapT}
                />
                <Text style={styles.inlineHint}>
                  {partner && isBestExpressPartner(partner)
                    ? 'Tài khoản đăng nhập V9 (https://v9.800best.com)'
                    : 'Tài khoản hoặc mã đăng nhập theo cổng đối tác.'}
                </Text>

                <TextField
                  label="Webhook Token"
                  variant="dark"
                  value={webhookToken}
                  onChangeText={setWebhookToken}
                  placeholder={
                    partner && isBestExpressPartner(partner)
                      ? 'Token cung cấp cho Best Express'
                      : 'Token webhook (nếu có)'
                  }
                  editable={!submitting}
                  startIcon={
                    <SystemIcon
                      name="document"
                      size={18}
                      color={palette.textMuted}
                    />
                  }
                  containerStyle={styles.fieldGapT}
                />
                <Text style={styles.inlineHint}>
                  {partner && isBestExpressPartner(partner)
                    ? 'Token này cần gửi kèm Webhook URL cho nhân viên Best Express khi cấu hình webhook.'
                    : 'Cung cấp cho đối tác khi họ yêu cầu xác thực webhook (nếu áp dụng).'}
                </Text>

                <View style={styles.switchRow}>
                  <Text style={styles.switchTitle}>Hoạt động</Text>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    disabled={submitting}
                    trackColor={{
                      false: palette.border,
                      true: palette.greenBg,
                    }}
                    thumbColor={isActive ? palette.green : palette.textMuted}
                  />
                </View>

                <Button
                  title="Kiểm Tra Kết Nối"
                  variant="secondary"
                  onPress={onTestConnection}
                  disabled={submitting || testLoading}
                  loading={testLoading}
                  style={styles.testBtn}
                />

                <View style={styles.footerRow}>
                  <Button
                    title="Hủy"
                    variant="ghost"
                    onPress={onBack}
                    style={styles.footerGhost}
                    textStyle={styles.footerGhostText}
                  />
                  <Button
                    title="Cập Nhật"
                    variant="primary"
                    onPress={handleSubmit}
                    disabled={submitting || busy}
                    style={styles.footerPrimary}
                  />
                </View>
              </View>
            ) : null}
          </DetailCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1, minHeight: 0 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    backArrow: { fontSize: 20, color: c.cyan, fontWeight: '700' },
    backTxt: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    detailLoading: {
      paddingVertical: 32,
      alignItems: 'center',
      gap: 12,
    },
    detailLoadingTxt: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
    },
    errBox: {
      marginBottom: 12,
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
    },
    errTxt: { fontSize: 13, fontWeight: '600', color: c.red, marginBottom: 8 },
    retryBtn: { alignSelf: 'flex-start' },
    retryTxt: { fontSize: 14, fontWeight: '800', color: c.cyan },
    formBlock: { gap: 4 },
    partnerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(45,212,191,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(45,212,191,0.32)',
      marginTop: 8,
      marginBottom: 8,
    },
    partnerLogo: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: c.bgInput,
    },
    partnerLogoSlot: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: c.bgInput,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    partnerCardText: { flex: 1, minWidth: 0, gap: 2 },
    partnerCardName: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
    },
    partnerCardCode: {
      fontSize: 13,
      fontWeight: '600',
      color: c.tealLight,
    },
    guideBox: {
      flexDirection: 'row',
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'rgba(56,189,248,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(56,189,248,0.28)',
      marginBottom: 12,
    },
    guideAccent: {
      width: 4,
      backgroundColor: c.cyan,
    },
    guideInner: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 12,
      gap: 8,
    },
    guideTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
    },
    guideBody: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 20,
    },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
    },
    sectionLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      minWidth: 24,
    },
    fieldGap: { marginTop: 4 },
    fieldGapT: { marginTop: 12 },
    inlineHint: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
      marginBottom: 4,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    switchTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    testBtn: {
      marginTop: 16,
    },
    footerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 16,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    footerPrimary: {
      minWidth: 132,
    },
    footerGhost: {
      minWidth: 88,
    },
    footerGhostText: {
      color: c.textSecondary,
      fontWeight: '700',
    },
  });
}
