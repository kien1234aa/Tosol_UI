import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  KeyboardAvoidingView,
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
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { CurrencySelect } from '../../category/priceList/components/CurrencySelect';
import { getCurrencies } from '@services/category/priceListAPI';
import type { CurrencyApi } from '@services/category/priceListApiTypes';
import { fetchCategoryPriceLists } from '@services/category/categoryPriceListSlice';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { createShop } from '@services/settings/shopAPI';
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

const PLATFORMS = [
  { key: 'manual', label: 'Bán trực tiếp' },
  { key: 'shopee', label: 'Shopee' },
  { key: 'lazada', label: 'Lazada' },
  { key: 'tiktok', label: 'TikTok' },
] as const satisfies readonly FormMenuOption<string>[];

type PlatformKey = (typeof PLATFORMS)[number]['key'];

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

export type CreateShopScreenProps = {
  onOpenDrawer: () => void;
  onBack: () => void;
};

export function CreateShopScreen({
  onOpenDrawer,
  onBack,
}: CreateShopScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const priceListItems = useAppSelector(s => s.categoryPriceList.items);

  const [submitting, setSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyApi[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<PlatformKey>('manual');
  const [platformShopId, setPlatformShopId] = useState('');
  const [pickStrategy, setPickStrategy] = useState<PickKey>('FIFO');
  const [paymentMethod, setPaymentMethod] = useState<PaymentKey>('none');
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [priceListId, setPriceListId] = useState<string>('');
  const [autoSync, setAutoSync] = useState(false);

  useEffect(() => {
    void dispatch(fetchCategoryPriceLists({ page: 1, per_page: 100 }));
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCurrenciesLoading(true);
      try {
        const list = await getCurrencies({ page: 1, per_page: 100 });
        if (!cancelled) {
          setCurrencies(list);
        }
      } catch {
        if (!cancelled) {
          setCurrencies([]);
        }
      } finally {
        if (!cancelled) {
          setCurrenciesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currencyId != null || currencies.length === 0) {
      return;
    }
    const vnd = currencies.find(c => c.code === 'VND');
    const first = vnd ?? currencies[0];
    if (first) {
      setCurrencyId(first.id);
    }
  }, [currencies, currencyId]);

  useEffect(() => {
    setPriceListId('');
  }, [currencyId]);

  const priceListOptions = useMemo((): FormMenuOption<string>[] => {
    const rows = priceListItems.filter(
      p => p.currency_id === currencyId && p.is_active,
    );
    const opts: FormMenuOption<string>[] = [
      { key: '', label: 'Chưa chọn —' },
      ...rows.map(p => ({ key: String(p.id), label: `${p.name} (${p.code})` })),
    ];
    return opts;
  }, [priceListItems, currencyId]);

  const platformShopDisabled = platform === 'manual';

  const handleSubmit = useCallback(async () => {
    const n = name.trim();
    if (!n) {
      toast.warning('Vui lòng nhập Tên cửa hàng.');
      return;
    }
    if (currencyId == null) {
      toast.warning('Vui lòng chọn Tiền tệ.');
      return;
    }
    const pid = platformShopId.trim();
    const platformShopPayload = platformShopDisabled ? '' : pid;

    const defaultPriceListId =
      priceListId !== '' && Number.isFinite(Number(priceListId))
        ? Number(priceListId)
        : null;

    setSubmitting(true);
    try {
      await createShop({
        name: n,
        platform,
        platform_shop_id: platformShopPayload,
        pick_strategy: pickStrategy,
        default_payment_method: paymentMethod,
        currency_id: currencyId,
        default_price_list_id: defaultPriceListId,
        auto_sync: autoSync,
      });
      void dispatch(
        fetchShopDirectory({ page: 1, per_page: 10, status: 'all' }),
      );
      void dispatch(fetchSalesMenuShops());
      toast.success(n);
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [
    name,
    platform,
    platformShopId,
    pickStrategy,
    paymentMethod,
    currencyId,
    priceListId,
    autoSync,
    dispatch,
    onBack,
    platformShopDisabled,
  ]);

  const selectedCurrency = currencies.find(c => c.id === currencyId);
  const vndBadge =
    selectedCurrency?.code === 'VND' ? (
      <View
        style={[
          styles.codePill,
          { borderColor: palette.red, backgroundColor: palette.redBg },
        ]}
      >
        <Text style={[styles.codePillTxt, { color: palette.red }]}>VND</Text>
      </View>
    ) : selectedCurrency ? (
      <View
        style={[
          styles.codePill,
          { borderColor: palette.border, backgroundColor: palette.bgButton },
        ]}
      >
        <Text style={[styles.codePillTxt, { color: palette.textSecondary }]}>
          {selectedCurrency.code}
        </Text>
      </View>
    ) : null;

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
          <FormScreenHeading sectionLabel="Cửa hàng" title="Tạo cửa hàng" />

          <DetailCard title="Thông tin cửa hàng" icon="store">
            <TextField
              label="Tên cửa hàng *"
              variant="dark"
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên cửa hàng"
            />

            <View style={styles.dimRow}>
              <View style={styles.dimHalf}>
                <FormMenuSelect
                  label="Sàn TMĐT"
                  required
                  sheetTitle="Sàn TMĐT"
                  options={PLATFORMS}
                  value={platform}
                  onChange={k => setPlatform(k as PlatformKey)}
                  leadingSlot={
                    platform === 'manual' ? (
                      <SystemIcon
                        name="pencil"
                        size={16}
                        color={palette.orange}
                      />
                    ) : null
                  }
                />
              </View>
              <View style={styles.dimHalf}>
                <TextField
                  label="ID cửa hàng trên sàn"
                  variant="dark"
                  value={platformShopId}
                  onChangeText={setPlatformShopId}
                  placeholder={platformShopDisabled ? '—' : 'Nhập ID trên sàn'}
                  editable={!platformShopDisabled}
                />
              </View>
            </View>

            <View style={styles.dimRow}>
              <View style={styles.dimHalf}>
                <FormMenuSelect
                  label="Chiến lược lấy hàng"
                  sheetTitle="Chiến lược lấy hàng"
                  options={PICK_STRATEGIES}
                  value={pickStrategy}
                  onChange={k => setPickStrategy(k as PickKey)}
                />
                <Text style={styles.fieldHint}>
                  Khuyến nghị dùng FIFO (Vào trước ra trước)
                </Text>
              </View>
              <View style={styles.dimHalf}>
                <FormMenuSelect
                  label="Phương thức thanh toán mặc định"
                  sheetTitle="Phương thức thanh toán"
                  options={PAYMENT_METHODS}
                  value={paymentMethod}
                  onChange={k => setPaymentMethod(k as PaymentKey)}
                />
              </View>
            </View>

            <View style={styles.dimRow}>
              <View style={styles.dimHalf}>
                <CurrencySelect
                  label="Tiền tệ"
                  required
                  hint={
                    currenciesLoading
                      ? 'Đang tải danh sách tiền tệ…'
                      : undefined
                  }
                  options={currencies}
                  valueId={currencyId}
                  onChange={setCurrencyId}
                  disabled={currenciesLoading || currencies.length === 0}
                  trailingAdornment={vndBadge}
                />
              </View>
              <View style={styles.dimHalf}>
                <FormMenuSelect
                  label="Bảng giá mặc định"
                  sheetTitle="Bảng giá mặc định"
                  options={priceListOptions}
                  value={priceListId}
                  onChange={setPriceListId}
                  disabled={currencyId == null}
                />
                <Text style={styles.fieldHint}>
                  Chỉ hiển thị bảng giá cùng loại tiền tệ
                </Text>
              </View>
            </View>

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

            <View style={styles.footerRow}>
              <Button
                title="Tạo Mới"
                variant="primary"
                loading={submitting}
                onPress={() => void handleSubmit()}
                style={styles.footerPrimary}
              />
              <Button
                title="Hủy"
                variant="outline"
                disabled={submitting}
                onPress={onBack}
                style={styles.footerCancel}
                textStyle={styles.footerCancelText}
              />
            </View>
          </DetailCard>
        </ScrollView>
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
    flex: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    dimRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'flex-start',
      marginTop: 4,
    },
    dimHalf: {
      flex: 1,
      minWidth: 148,
    },
    fieldHint: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 4,
      lineHeight: 15,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      gap: 12,
    },
    switchLabels: {
      flex: 1,
      minWidth: 0,
    },
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
    footerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 20,
      alignItems: 'center',
    },
    footerPrimary: {
      flexGrow: 1,
      minWidth: 120,
    },
    footerCancel: {
      flexGrow: 1,
      minWidth: 100,
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    footerCancelText: {
      color: c.textPrimary,
    },
    codePill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
    },
    codePillTxt: {
      fontSize: 11,
      fontWeight: '800',
    },
  });
}
