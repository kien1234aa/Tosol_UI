import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
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
import { Button } from '@shared/components/ui/Button';
import { TextField } from '@shared/components/ui/TextField';
import { fetchCategoryPriceLists } from '@services/category/categoryPriceListSlice';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { getShopById, updateShop } from '@services/settings/shopAPI';
import type { ShopDetailApi } from '@services/settings/shopResponseTypes';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  fetchSalesMenuShops,
  fetchShopDirectory,
} from '@services/settings/shopSlice';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import {
  FormMenuSelect,
  type FormMenuOption,
} from './components/FormMenuSelect';

const PICK_STRATEGIES = [
  { key: 'FIFO', label: 'FIFO - First In First Out' },
  { key: 'LIFO', label: 'LIFO - Last In First Out' },
  { key: 'FEFO', label: 'FEFO - First Expired First Out' },
] as const satisfies readonly FormMenuOption<string>[];

type PickKey = (typeof PICK_STRATEGIES)[number]['key'];

const PAYMENT_METHODS = [
  { key: 'none', label: 'Không' },
  { key: 'cod', label: 'COD' },
  { key: 'bank_transfer', label: 'Chuyển khoản' },
  { key: 'e_wallet', label: 'Ví điện tử' },
] as const satisfies readonly FormMenuOption<string>[];

type PaymentKey = (typeof PAYMENT_METHODS)[number]['key'];

function pickKeyFromApi(raw: string): PickKey {
  const u = (raw || 'FIFO').trim().toUpperCase();
  return PICK_STRATEGIES.some(p => p.key === u) ? (u as PickKey) : 'FIFO';
}

function paymentKeyFromApi(raw: string): PaymentKey {
  const k = (raw || 'none').trim().toLowerCase();
  const hit = PAYMENT_METHODS.find(p => p.key === k);
  return (hit?.key ?? 'none') as PaymentKey;
}

export type EditShopScreenProps = {
  shopId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Gọi sau khi lưu thành công (vd. tải lại chi tiết). */
  onSaved?: () => void;
};

export function EditShopScreen({
  shopId,
  onOpenDrawer,
  onBack,
  onSaved,
}: EditShopScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const priceListItems = useAppSelector(s => s.categoryPriceList.items);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shop, setShop] = useState<ShopDetailApi | null>(null);

  const [name, setName] = useState('');
  const [platformShopId, setPlatformShopId] = useState('');
  const [pickStrategy, setPickStrategy] = useState<PickKey>('FIFO');
  const [paymentMethod, setPaymentMethod] = useState<PaymentKey>('none');
  const [priceListId, setPriceListId] = useState<string>('');
  const [autoSync, setAutoSync] = useState(false);

  useEffect(() => {
    void dispatch(fetchCategoryPriceLists({ page: 1, per_page: 100 }));
  }, [dispatch]);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await getShopById(shopId);
      setShop(data);
      setName(data.name);
      setPlatformShopId(data.platform_shop_id?.trim() ?? '');
      setPickStrategy(pickKeyFromApi(data.pick_strategy));
      setPaymentMethod(paymentKeyFromApi(data.default_payment_method));
      setPriceListId(
        data.default_price_list_id != null
          ? String(data.default_price_list_id)
          : '',
      );
      setAutoSync(Boolean(data.auto_sync));
    } catch (e: unknown) {
      setShop(null);
      setLoadError(e instanceof Error ? e.message : 'Không tải được cửa hàng');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    void load();
  }, [load]);

  const platformShopDisabled = shop?.platform === 'manual';

  const priceListOptions = useMemo((): FormMenuOption<string>[] => {
    const cur = shop?.currency_id ?? null;
    const rows =
      cur == null
        ? []
        : priceListItems.filter(p => p.currency_id === cur && p.is_active);
    return [
      { key: '', label: 'Chưa chọn —' },
      ...rows.map(p => ({ key: String(p.id), label: `${p.name} (${p.code})` })),
    ];
  }, [priceListItems, shop?.currency_id]);

  const handleSubmit = useCallback(async () => {
    const n = name.trim();
    if (!n) {
      toast.warning('Vui lòng nhập Tên cửa hàng.');
      return;
    }
    const defaultPriceListId =
      priceListId !== '' && Number.isFinite(Number(priceListId))
        ? Number(priceListId)
        : null;

    setSubmitting(true);
    try {
      await updateShop(shopId, {
        name: n,
        platform_shop_id: platformShopDisabled ? '' : platformShopId.trim(),
        pick_strategy: pickStrategy,
        default_payment_method: paymentMethod,
        default_price_list_id: defaultPriceListId,
        auto_sync: autoSync,
      });
      void dispatch(
        fetchShopDirectory({ page: 1, per_page: 10, status: 'all' }),
      );
      void dispatch(fetchSalesMenuShops());
      onSaved?.();
      toast.success(n);
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [
    name,
    platformShopId,
    platformShopDisabled,
    pickStrategy,
    paymentMethod,
    priceListId,
    autoSync,
    shopId,
    dispatch,
    onBack,
    onSaved,
  ]);

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {loading ? (
          <DetailScreenSkeleton />
        ) : loadError ? (
          <View style={styles.errWrap}>
            <Text style={styles.errTxt}>{loadError}</Text>
            <Pressable onPress={() => void load()} style={styles.retryBtn}>
              <Text style={styles.retryTxt}>Thử lại</Text>
            </Pressable>
            <Button
              title="Đóng"
              variant="outline"
              onPress={onBack}
              style={styles.errClose}
            />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              canvasListScrollContent({ paddingHorizontal: 0 }),
              { paddingBottom: insets.bottom + 28 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <DetailCard title="Sửa cửa hàng" icon="store">
              <TextField
                label="Tên cửa hàng *"
                variant="dark"
                value={name}
                onChangeText={setName}
                placeholder="Tên cửa hàng"
              />

              <TextField
                label="ID cửa hàng trên sàn"
                variant="dark"
                value={platformShopId}
                onChangeText={setPlatformShopId}
                placeholder="Nhập ID trên sàn"
                editable={!platformShopDisabled}
              />

              <FormMenuSelect
                label="Chiến lược lấy hàng"
                sheetTitle="Chiến lược lấy hàng"
                options={PICK_STRATEGIES}
                value={pickStrategy}
                onChange={k => setPickStrategy(k as PickKey)}
              />

              <FormMenuSelect
                label="Phương thức thanh toán mặc định"
                sheetTitle="Phương thức thanh toán"
                options={PAYMENT_METHODS}
                value={paymentMethod}
                onChange={k => setPaymentMethod(k as PaymentKey)}
              />

              <FormMenuSelect
                label="Bảng giá mặc định"
                sheetTitle="Bảng giá mặc định"
                options={priceListOptions}
                value={priceListId}
                onChange={setPriceListId}
              />
              <Text style={styles.fieldHint}>
                Chỉ hiển thị bảng giá cùng loại tiền tệ
              </Text>

              <View style={styles.switchRow}>
                <View style={styles.switchLabels}>
                  <Text style={styles.switchTitle}>Đồng bộ tự động</Text>
                  <Text style={styles.switchHint}>
                    Tự động đồng bộ đơn từ sàn mỗi 30 phút
                  </Text>
                </View>
                <Switch
                  value={autoSync}
                  onValueChange={setAutoSync}
                  trackColor={{ false: palette.border, true: palette.teal }}
                  thumbColor={palette.surfaceWhite}
                />
              </View>

              <View style={styles.footerActions}>
                <Button
                  title="Hủy"
                  variant="outline"
                  disabled={submitting}
                  onPress={onBack}
                  style={styles.footerBtn}
                  textStyle={styles.footerCancelText}
                />
                <Button
                  title="Lưu"
                  variant="primary"
                  loading={submitting}
                  onPress={() => void handleSubmit()}
                  style={styles.footerBtn}
                />
              </View>
            </DetailCard>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    flex: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    errWrap: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    errTxt: {
      fontSize: 14,
      fontWeight: '600',
      color: c.red,
      marginBottom: 12,
    },
    retryBtn: { alignSelf: 'flex-start', marginBottom: 16 },
    retryTxt: { fontSize: 14, fontWeight: '800', color: c.cyan },
    errClose: { alignSelf: 'flex-start' },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    backArrow: { fontSize: 20, color: c.cyan, fontWeight: '700' },
    backTxt: { fontSize: 15, fontWeight: '700', color: c.textSecondary },
    fieldHint: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 4,
      marginBottom: 12,
      lineHeight: 15,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      gap: 12,
    },
    switchLabels: { flex: 1, minWidth: 0 },
    switchTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    switchHint: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 4,
      lineHeight: 17,
    },
    footerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 20,
    },
    footerBtn: {
      minWidth: 100,
    },
    footerCancelText: {
      color: c.textPrimary,
    },
  });
}
