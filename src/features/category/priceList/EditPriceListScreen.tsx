import React, { useCallback, useEffect, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import {
  getCurrencies,
  getPriceListById,
  updatePriceList,
} from '@services/category/priceListAPI';
import type {
  CurrencyApi,
  UpdatePriceListPayload,
} from '@services/category/priceListApiTypes';
import { fetchCategoryPriceLists } from '@services/category/categoryPriceListSlice';
import { CurrencySelect } from './components/CurrencySelect';
import { FormDatePickerField } from './components/FormDatePickerField';
import {
  dateToIsoDateOnly,
  isoDateOnlyToLocalDate,
} from './components/datePickerUtils';

export type EditPriceListScreenProps = {
  priceListId: number;
  onOpenDrawer: () => void;
  onBack: () => void;
  onSaved?: () => void;
};

function sanitizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 30);
}

export function EditPriceListScreen({
  priceListId,
  onOpenDrawer,
  onBack,
  onSaved,
}: EditPriceListScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_EditPriceListScreen_styles);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyApi[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [priceListName, setPriceListName] = useState('');

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [validFromDate, setValidFromDate] = useState<Date | null>(null);
  const [validToDate, setValidToDate] = useState<Date | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCurrenciesLoading(true);
      try {
        const list = await getCurrencies();
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
    let cancelled = false;
    (async () => {
      setInitialLoading(true);
      setLoadError(null);
      try {
        const pl = await getPriceListById(priceListId, {
          include: 'currency,seller',
        });
        if (cancelled) {
          return;
        }
        setName(pl.name);
        setPriceListName(pl.name);
        setCode(pl.code);
        setCurrencyId(pl.currency_id);
        setValidFromDate(isoDateOnlyToLocalDate(pl.valid_from));
        setValidToDate(isoDateOnlyToLocalDate(pl.valid_to));
        setIsDefault(pl.is_default);
        setIsActive(pl.is_active);
      } catch (e: unknown) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Không tải được bảng giá');
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [priceListId]);

  const handleSubmit = useCallback(async () => {
    const n = name.trim();
    const c = code.trim();
    if (!n || !c) {
      toast.warning('Vui lòng nhập Tên bảng giá và Mã bảng giá.');
      return;
    }
    if (currencyId == null) {
      toast.warning('Vui lòng chọn Loại tiền.');
      return;
    }

    const fromIso = validFromDate ? dateToIsoDateOnly(validFromDate) : null;
    const toIso = validToDate ? dateToIsoDateOnly(validToDate) : null;
    if (fromIso && toIso && fromIso > toIso) {
      toast.error('Hiệu lực từ phải trước hoặc bằng Hiệu lực đến.');
      return;
    }

    const payload: UpdatePriceListPayload = {
      name: n,
      code: c,
      currency_id: currencyId,
      is_default: isDefault,
      is_active: isActive,
      valid_from: fromIso,
      valid_to: toIso,
    };

    setSubmitting(true);
    try {
      await updatePriceList(priceListId, payload);
      void dispatch(fetchCategoryPriceLists({}));
      onSaved?.();
      toast.success(`${n} đã được lưu.`);
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [
    name, code, currencyId, validFromDate, validToDate,
    isDefault, isActive, priceListId, dispatch, onBack, onSaved,
  ]);

  const scrollContent = [
    canvasListScrollContent({ paddingHorizontal: 0 }),
    { paddingBottom: insets.bottom + 28 },
  ];

  if (initialLoading) {
    return (
      <View style={styles.root}>
        <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
        <DetailScreenSkeleton />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.root}>
        <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
        <View style={styles.errWrap}>
          <Text style={styles.errTxt}>{loadError}</Text>
          <Pressable onPress={onBack} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>Quay lại</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormScreenHeading
            sectionLabel="Bảng giá"
            title="Sửa bảng giá"
            subtitle={priceListName || undefined}
          />

          <DetailCard title="Thông tin cơ bản" icon="tag">
            <TextField
              label="Tên bảng giá *"
              variant="dark"
              value={name}
              onChangeText={setName}
              placeholder="VD: Giá lẻ 2026"
            />

            <TextField
              label="Mã bảng giá *"
              variant="dark"
              value={code}
              onChangeText={t => setCode(sanitizeCode(t))}
              placeholder="VD: GIA-LE"
              autoCapitalize="characters"
            />
            <Text style={styles.fieldHint}>
              {'Chỉ chữ in hoa (A-Z), số (0-9), gạch ngang (-) và gạch dưới (_). Tối đa 30 ký tự.'}
            </Text>

            <CurrencySelect
              label="Loại tiền *"
              required
              options={currencies}
              valueId={currencyId}
              onChange={setCurrencyId}
              disabled={currenciesLoading || currencies.length === 0}
            />
          </DetailCard>

          <DetailCard title="Thời gian hiệu lực" icon="calendar">
            <View style={styles.dateRow}>
              <View style={styles.dateHalf}>
                <FormDatePickerField
                  label="Hiệu lực từ"
                  value={validFromDate}
                  onChange={setValidFromDate}
                  maximumDate={validToDate ?? undefined}
                />
              </View>
              <View style={styles.dateHalf}>
                <FormDatePickerField
                  label="Hiệu lực đến"
                  value={validToDate}
                  onChange={setValidToDate}
                  minimumDate={validFromDate ?? undefined}
                />
              </View>
            </View>
            <Text style={styles.fieldHint}>
              {'Để trống nếu bảng giá không giới hạn thời gian.'}
            </Text>
          </DetailCard>

          <DetailCard title="Cài đặt" icon="settings">
            <View style={styles.switchRow}>
              <View style={styles.switchLabels}>
                <Text style={styles.switchTitle}>Bảng giá mặc định</Text>
                <Text style={styles.switchHint}>
                  Áp dụng tự động khi tạo đơn hàng
                </Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: palette.border, true: palette.teal }}
                thumbColor={palette.textPrimary}
              />
            </View>

            <View style={[styles.switchRow, styles.switchRowLast]}>
              <View style={styles.switchLabels}>
                <Text style={styles.switchTitle}>Đang hoạt động</Text>
                <Text style={styles.switchHint}>
                  Bảng giá có thể được sử dụng
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: palette.border, true: palette.teal }}
                thumbColor={palette.textPrimary}
              />
            </View>
          </DetailCard>

          <View style={styles.footer}>
            <Button
              title="Lưu thay đổi"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function create_EditPriceListScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    flex: { flex: 1, minHeight: 0 },
    scroll: { flex: 1 },
    fieldHint: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 4,
      marginBottom: 8,
      lineHeight: 15,
    },
    dateRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'flex-start',
    },
    dateHalf: {
      flex: 1,
      minWidth: 140,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    switchRowLast: {
      borderBottomWidth: 0,
    },
    switchLabels: {
      flex: 1,
      marginRight: 12,
      minWidth: 0,
    },
    switchTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    switchHint: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
    footer: {
      gap: 12,
      marginTop: 8,
      paddingHorizontal: 20,
    },
    footerPrimary: { width: '100%' },
    footerCancel: {
      width: '100%',
      backgroundColor: c.bgButton,
      borderColor: c.border,
    },
    footerCancelText: { color: c.textPrimary },
    errWrap: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    errTxt: {
      fontSize: 14,
      fontWeight: '600',
      color: c.red,
      marginBottom: 16,
      textAlign: 'center',
    },
    retryBtn: { alignSelf: 'center' },
    retryTxt: { fontSize: 15, fontWeight: '800', color: c.teal },
  });
}
