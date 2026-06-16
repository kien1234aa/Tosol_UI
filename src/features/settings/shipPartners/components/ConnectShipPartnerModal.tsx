import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { ListScreenSkeleton } from '@shared/components/ui/skeleton/ListScreenSkeleton';
import { TextField } from '@shared/components/ui/TextField';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  createSellerShippingPartner,
  getShippingPartnersDirectory,
} from '@services/settings/shipPartnerAPI';
import type { ShippingPartnerCatalogApi } from '@services/settings/shipApiTypes';
import { FormMenuSelect } from '../../shops/components/FormMenuSelect';
import {
  BEST_EXPRESS_CONNECTION_GUIDE,
  buildDefaultServiceOptions,
  GENERIC_SHIP_PARTNER_GUIDE,
  isBestExpressPartner,
} from '../shipPartnerFormUtils';

export type ConnectShipPartnerModalProps = {
  visible: boolean;
  /** `shipping_partner_id` đã kết nối — ẩn khỏi danh sách chọn. */
  connectedPartnerIds: number[];
  onClose: () => void;
  onConnected?: () => void;
};

function createFormStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
      flex: 1,
      marginHorizontal: 8,
    },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 28, gap: 14 },
    loadingBox: { paddingVertical: 32, alignItems: 'center', gap: 10 },
    loadingTxt: { fontSize: 14, color: c.textMuted, fontWeight: '600' },
    partnerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
    },
    partnerLogo: { width: 44, height: 44, borderRadius: 8 },
    partnerLogoSlot: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: c.bgRow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    partnerCardText: { flex: 1, minWidth: 0 },
    partnerCardName: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    partnerCardCode: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    guideBox: {
      flexDirection: 'row',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.border,
    },
    guideAccent: { width: 4, backgroundColor: c.teal },
    guideInner: { flex: 1, padding: 12, backgroundColor: c.bgCard },
    guideTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 6,
    },
    guideBody: { fontSize: 12, color: c.textSecondary, lineHeight: 18 },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
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
    },
    inlineHint: {
      fontSize: 12,
      color: c.textMuted,
      fontWeight: '600',
      marginTop: -8,
    },
    activeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    activeLabel: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    footerBtn: { flex: 1 },
    pickerBackdrop: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'flex-end',
    },
    pickerSheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 12,
      maxHeight: '72%',
    },
    pickerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    pickerRowTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
      flex: 1,
    },
    pickerRowSub: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    pickerEmpty: {
      padding: 20,
      textAlign: 'center',
      color: c.textMuted,
      fontWeight: '600',
    },
    partnerPickerLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 6,
    },
    partnerPickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
    },
    partnerPickerRowText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
      flex: 1,
      marginRight: 8,
    },
  });
}

export function ConnectShipPartnerModal({
  visible,
  connectedPartnerIds,
  onClose,
  onConnected,
}: ConnectShipPartnerModalProps) {
  const palette = useAppColors();
  const form = useThemeStyleSheet(createFormStyles);
  const insets = useSafeAreaInsets();

  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [partners, setPartners] = useState<ShippingPartnerCatalogApi[]>([]);
  const [partnerPickerOpen, setPartnerPickerOpen] = useState(false);
  const [partnerId, setPartnerId] = useState<number | null>(null);

  const [defaultService, setDefaultService] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [webhookToken, setWebhookToken] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availablePartners = useMemo(() => {
    const connected = new Set(connectedPartnerIds);
    return partners.filter(p => !connected.has(p.id));
  }, [partners, connectedPartnerIds]);

  const selectedPartner = useMemo(
    () => availablePartners.find(p => p.id === partnerId) ?? null,
    [availablePartners, partnerId],
  );

  const serviceOptions = useMemo(() => {
    if (!selectedPartner) {
      return [];
    }
    return buildDefaultServiceOptions(selectedPartner, null);
  }, [selectedPartner]);

  const isBest = selectedPartner
    ? isBestExpressPartner(selectedPartner)
    : false;
  const guideTitle = isBest ? 'Hướng dẫn Best Express' : 'Hướng dẫn kết nối';
  const guideBody = isBest
    ? BEST_EXPRESS_CONNECTION_GUIDE
    : GENERIC_SHIP_PARTNER_GUIDE;

  useEffect(() => {
    if (!visible) {
      return;
    }
    setPartnerPickerOpen(false);
    setPartnerId(null);
    setDefaultService('');
    setUsername('');
    setPassword('');
    setWebhookToken('');
    setIsActive(true);
    setSubmitting(false);
    setCatalogError(null);
    setCatalogLoading(true);
    void (async () => {
      try {
        const r = await getShippingPartnersDirectory({
          page: 1,
          per_page: 100,
          isActive: true,
        });
        setPartners(r.items);
      } catch (e: unknown) {
        setPartners([]);
        setCatalogError(
          e instanceof Error
            ? e.message
            : 'Không tải được danh mục đối tác',
        );
      } finally {
        setCatalogLoading(false);
      }
    })();
  }, [visible]);

  useEffect(() => {
    if (!visible || availablePartners.length === 0) {
      return;
    }
    if (
      partnerId == null ||
      !availablePartners.some(p => p.id === partnerId)
    ) {
      setPartnerId(availablePartners[0]!.id);
    }
  }, [visible, availablePartners, partnerId]);

  useEffect(() => {
    if (serviceOptions.length === 0) {
      setDefaultService('');
      return;
    }
    if (!serviceOptions.some(o => o.key === defaultService)) {
      setDefaultService(serviceOptions[0]!.key);
    }
  }, [serviceOptions, defaultService]);

  const partnerLabel =
    selectedPartner?.name?.trim() ??
    (availablePartners.length === 0
      ? 'Không còn đối tác để kết nối'
      : 'Chọn đối tác');

  const onSubmit = useCallback(async () => {
    if (partnerId == null) {
      toast.warning('Chọn đối tác vận chuyển.');
      return;
    }
    const u = username.trim();
    if (!u) {
      toast.warning('Vui lòng nhập tài khoản đăng nhập (Username).');
      return;
    }
    const p = password.trim();
    if (!p) {
      toast.warning('Vui lòng nhập mật khẩu API.');
      return;
    }
    if (!defaultService.trim()) {
      toast.warning('Vui lòng chọn dịch vụ mặc định.');
      return;
    }
    const cred: Record<string, string> = { username: u, password: p };
    const w = webhookToken.trim();
    if (w) {
      cred.webhook_token = w;
    }
    setSubmitting(true);
    try {
      await createSellerShippingPartner({
        shipping_partner_id: partnerId,
        default_service: defaultService.trim(),
        is_active: isActive,
        credentials: cred,
      });
      toast.success('Đã kết nối đối tác vận chuyển thành công.');
      onConnected?.();
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  }, [
    partnerId,
    username,
    password,
    defaultService,
    webhookToken,
    isActive,
    onConnected,
    onClose,
  ]);

  type AvailablePartner = (typeof availablePartners)[0];
  const renderPartnerItem = useCallback(
    ({ item }: { item: AvailablePartner }) => (
      <Pressable
        style={form.pickerRow}
        onPress={() => {
          setPartnerId(item.id);
          setPartnerPickerOpen(false);
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={form.pickerRowTitle} numberOfLines={2}>
            {item.name?.trim() || '—'}
          </Text>
          <Text style={form.pickerRowSub} numberOfLines={1}>
            {item.code?.trim() || '—'}
          </Text>
        </View>
        {partnerId === item.id ? (
          <SystemIcon name="check" size={20} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [partnerId, form.pickerRow, form.pickerRowTitle, form.pickerRowSub, palette.teal],
  );

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={form.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[form.header, { paddingTop: Math.max(insets.top, 8) }]}>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
            >
              <SystemIcon
                name="chevronBack"
                size={24}
                color={palette.textPrimary}
              />
            </Pressable>
            <Text style={form.title} numberOfLines={1}>
              Kết nối đối tác
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {catalogLoading ? (
            <ListScreenSkeleton count={4} showSectionHeader={false} />
          ) : (
            <ScrollView
              style={form.scroll}
              contentContainerStyle={form.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {catalogError ? (
                <Text style={{ color: palette.red, fontWeight: '600' }}>
                  {catalogError}
                </Text>
              ) : null}

              <View>
                <Text style={form.partnerPickerLabel}>
                  Đối tác vận chuyển *
                </Text>
                <Pressable
                  style={form.partnerPickerRow}
                  onPress={() =>
                    availablePartners.length > 0 && setPartnerPickerOpen(true)
                  }
                  disabled={availablePartners.length === 0}
                >
                  <Text
                    style={form.partnerPickerRowText}
                    numberOfLines={2}
                  >
                    {partnerLabel}
                  </Text>
                  <SystemIcon
                    name="chevronDown"
                    size={18}
                    color={palette.textMuted}
                  />
                </Pressable>
              </View>

              {selectedPartner ? (
                <>
                  <View style={form.partnerCard}>
                    {selectedPartner.logo_url ? (
                      <Image
                        source={{ uri: selectedPartner.logo_url }}
                        style={form.partnerLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={form.partnerLogoSlot}>
                        <SystemIcon
                          name="truck"
                          size={22}
                          color={palette.textMuted}
                        />
                      </View>
                    )}
                    <View style={form.partnerCardText}>
                      <Text style={form.partnerCardName} numberOfLines={2}>
                        {selectedPartner.name?.trim() || '—'}
                      </Text>
                      <Text style={form.partnerCardCode} numberOfLines={1}>
                        {selectedPartner.code?.trim() || '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={form.guideBox}>
                    <View style={form.guideAccent} />
                    <View style={form.guideInner}>
                      <Text style={form.guideTitle}>{guideTitle}</Text>
                      <Text style={form.guideBody}>{guideBody}</Text>
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

                  <View style={form.sectionHead}>
                    <SystemIcon
                      name="server"
                      size={18}
                      color={palette.tealLight}
                    />
                    <Text style={form.sectionTitle}>
                      Thông tin xác thực API
                    </Text>
                    <View style={form.sectionLine} />
                  </View>

                  <TextField
                    label="Username *"
                    variant="dark"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="cus632948"
                    editable={!submitting}
                  />
                  <TextField
                    label="Password *"
                    variant="dark"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    isPassword
                    editable={!submitting}
                  />
                  <TextField
                    label="Webhook token"
                    variant="dark"
                    value={webhookToken}
                    onChangeText={setWebhookToken}
                    placeholder={
                      isBest ? 'Bearer token cho Best Express' : 'Tuỳ chọn'
                    }
                    editable={!submitting}
                  />
                  <Text style={form.inlineHint}>
                    {isBest
                      ? 'Token gửi kèm Webhook URL cho nhân viên Best Express.'
                      : 'Cung cấp khi đối tác yêu cầu xác thực webhook.'}
                  </Text>

                  <View style={form.activeRow}>
                    <Text style={form.activeLabel}>Kích hoạt kết nối</Text>
                    <Switch
                      value={isActive}
                      onValueChange={setIsActive}
                      disabled={submitting}
                    />
                  </View>
                </>
              ) : null}
            </ScrollView>
          )}

          <View style={[form.footer, { paddingBottom: insets.bottom + 12 }]}>
            <View style={form.footerBtn}>
              <Button
                title="Hủy"
                variant="outline"
                onPress={onClose}
                disabled={submitting}
              />
            </View>
            <View style={form.footerBtn}>
              <Button
                title="Kết nối"
                variant="primary"
                onPress={() => {
                  void onSubmit();
                }}
                loading={submitting}
                disabled={
                  submitting ||
                  catalogLoading ||
                  availablePartners.length === 0
                }
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={partnerPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPartnerPickerOpen(false)}
      >
        <Pressable
          style={form.pickerBackdrop}
          onPress={() => setPartnerPickerOpen(false)}
        >
          <Pressable
            style={[form.pickerSheet, { paddingBottom: insets.bottom + 8 }]}
            onPress={e => e.stopPropagation()}
          >
            <Text style={form.pickerTitle}>Chọn đối tác</Text>
            {availablePartners.length === 0 ? (
              <Text style={form.pickerEmpty}>
                Tất cả đối tác đang hoạt động đã được kết nối.
              </Text>
            ) : (
              <FlatList
                data={availablePartners}
                keyExtractor={p => String(p.id)}
                renderItem={renderPartnerItem}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
