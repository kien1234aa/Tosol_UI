import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { ListMobileCardSkeleton } from '@shared/components/ui/skeleton/ListMobileCardSkeleton';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import {
  FormMenuSelect,
  type FormMenuOption,
} from '../shops/components/FormMenuSelect';
import {
  createBankAccount,
  getBankAccountById,
  updateBankAccount,
} from '@services/settings/bankAccountAPI';
import type { BankAccountListItem } from '@services/settings/bankAccountResponseTypes';
import { getSepayBanksCatalog } from '@services/settings/sepayBanksAPI';
import type { SepayBank } from '@services/settings/sepayBanksTypes';

export type CreateBankAccountScreenProps = {
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Làm mới danh sách sau khi tạo / cập nhật thành công. */
  onCreated?: () => void;
  /** Có giá trị → chế độ sửa (`GET`/`PUT` `/bank-accounts/:id`). */
  bankAccountId?: number | null;
};

function toBankOptions(banks: SepayBank[]): FormMenuOption<string>[] {
  return banks.map(b => ({
    key: b.code,
    label: b.short_name
      ? `${b.short_name} — ${b.name}`
      : b.name,
  }));
}

export function CreateBankAccountScreen({
  onOpenDrawer,
  onBack,
  onCreated,
  bankAccountId = null,
}: CreateBankAccountScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();

  const isEdit = bankAccountId != null && bankAccountId > 0;

  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [banks, setBanks] = useState<SepayBank[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [loadedRecord, setLoadedRecord] = useState<BankAccountListItem | null>(
    null,
  );

  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadBanks = useCallback(async () => {
    setBanksError(null);
    setBanksLoading(true);
    try {
      const list = await getSepayBanksCatalog();
      setBanks(list);
    } catch (e: unknown) {
      setBanks([]);
      setBanksError(
        e instanceof Error ? e.message : 'Không tải được danh sách ngân hàng',
      );
    } finally {
      setBanksLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBanks();
  }, [loadBanks]);

  const resetCreateForm = useCallback(() => {
    setLoadedRecord(null);
    setDetailError(null);
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
    setIsDefault(false);
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!isEdit || !bankAccountId) {
      resetCreateForm();
      setDetailLoading(false);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    void (async () => {
      try {
        const acc = await getBankAccountById(bankAccountId);
        if (cancelled) {
          return;
        }
        setLoadedRecord(acc);
        setBankCode(acc.bank_code);
        setAccountNumber(acc.account_number);
        setAccountName(acc.account_name);
        setIsDefault(acc.is_default);
        setIsActive(acc.is_active);
      } catch (e: unknown) {
        if (!cancelled) {
          setLoadedRecord(null);
          setDetailError(
            e instanceof Error ? e.message : 'Không tải được tài khoản',
          );
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, bankAccountId, resetCreateForm]);

  const bankMenuOptions = useMemo(() => {
    const base = toBankOptions(banks);
    if (!bankCode) {
      return base;
    }
    if (base.some(o => o.key === bankCode)) {
      return base;
    }
    const label = loadedRecord?.bank_name ?? bankCode;
    return [{ key: bankCode, label }, ...base];
  }, [banks, bankCode, loadedRecord]);

  const selectedBankSepay = useMemo(
    () => banks.find(b => b.code === bankCode) ?? null,
    [banks, bankCode],
  );

  const bankNameForSubmit = useMemo(() => {
    if (selectedBankSepay) {
      return (selectedBankSepay.short_name || selectedBankSepay.name).trim();
    }
    return (loadedRecord?.bank_name ?? '').trim();
  }, [selectedBankSepay, loadedRecord]);

  const handleSubmit = useCallback(() => {
    if (!bankCode.trim()) {
      toast.warning('Vui lòng chọn ngân hàng.');
      return;
    }
    const n = accountNumber.trim();
    const a = accountName.trim();
    if (!a) {
      toast.warning('Vui lòng nhập tên chủ tài khoản.');
      return;
    }
    if (!n) {
      toast.warning('Vui lòng nhập số tài khoản.');
      return;
    }
    const bn = bankNameForSubmit;
    if (!bn) {
      toast.warning('Vui lòng chọn ngân hàng hợp lệ.');
      return;
    }
    if (isEdit && !loadedRecord) {
      toast.warning('Chưa tải xong tài khoản để cập nhật.');
      return;
    }
    void (async () => {
      setSubmitting(true);
      try {
        const payload = {
          bank_code: bankCode.trim(),
          bank_name: bn,
          account_number: n,
          account_name: a,
          is_default: isDefault,
          is_active: isActive,
        };
        if (isEdit && bankAccountId && loadedRecord) {
          await updateBankAccount(bankAccountId, {
            ...payload,
            seller_id: loadedRecord.seller_id,
          });
          toast.success('Đã cập nhật tài khoản ngân hàng.');
        } else {
          await createBankAccount(payload);
          toast.success('Đã thêm tài khoản ngân hàng.');
        }
        onCreated?.();
        onBack();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
      } finally {
        setSubmitting(false);
      }
    })();
  }, [
    bankCode,
    accountNumber,
    accountName,
    isDefault,
    isActive,
    bankNameForSubmit,
    isEdit,
    bankAccountId,
    loadedRecord,
    onCreated,
    onBack,
  ]);

  const formLocked = banksLoading || (isEdit && detailLoading);
  const formHeadingTitle = isEdit
    ? 'Sửa tài khoản ngân hàng'
    : 'Thêm tài khoản ngân hàng';
  const submitLabel = isEdit ? 'Cập Nhật' : 'Tạo Mới';

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
          <FormScreenHeading
            sectionLabel="Tài khoản ngân hàng"
            title={formHeadingTitle}
          />

          <DetailCard title="Thông tin tài khoản" icon="card">
            {isEdit && detailLoading ? (
              <ListMobileCardSkeleton withLeading={false} />
            ) : null}

            {isEdit && detailError && !detailLoading ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{detailError}</Text>
                <Pressable
                  onPress={() => {
                    if (bankAccountId) {
                      setDetailLoading(true);
                      setDetailError(null);
                      void (async () => {
                        try {
                          const acc = await getBankAccountById(bankAccountId);
                          setDetailError(null);
                          setLoadedRecord(acc);
                          setBankCode(acc.bank_code);
                          setAccountNumber(acc.account_number);
                          setAccountName(acc.account_name);
                          setIsDefault(acc.is_default);
                          setIsActive(acc.is_active);
                        } catch (e: unknown) {
                          setDetailError(
                            e instanceof Error
                              ? e.message
                              : 'Không tải được tài khoản',
                          );
                        } finally {
                          setDetailLoading(false);
                        }
                      })();
                    }
                  }}
                  style={styles.retryBtn}
                >
                  <Text style={styles.retryTxt}>Thử lại</Text>
                </Pressable>
              </View>
            ) : null}

            {banksError ? (
              <View style={styles.errBox}>
                <Text style={styles.errTxt}>{banksError}</Text>
                <Pressable
                  onPress={() => void loadBanks()}
                  style={styles.retryBtn}
                >
                  <Text style={styles.retryTxt}>Thử lại</Text>
                </Pressable>
              </View>
            ) : null}

            {!(isEdit && detailLoading) && !(isEdit && detailError) ? (
              <>
                <FormMenuSelect
                  label="Tên ngân hàng *"
                  required
                  sheetTitle="Chọn ngân hàng"
                  searchable
                  searchPlaceholder="Tìm theo tên, mã ngân hàng…"
                  options={bankMenuOptions}
                  value={bankCode}
                  onChange={setBankCode}
                  disabled={formLocked || bankMenuOptions.length === 0}
                  hint={
                    banksLoading
                      ? 'Đang tải danh sách từ Sepay…'
                      : bankMenuOptions.length === 0
                      ? 'Không có ngân hàng được hỗ trợ'
                      : selectedBankSepay
                      ? selectedBankSepay.name
                      : loadedRecord && loadedRecord.bank_code === bankCode
                      ? loadedRecord.bank_name
                      : undefined
                  }
                  leadingSlot={
                    banksLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={palette.textMuted}
                      />
                    ) : bankCode ? (
                      <SystemIcon
                        name="business"
                        size={16}
                        color={palette.tealLight}
                      />
                    ) : null
                  }
                />

                <TextField
                  label="Chủ tài khoản *"
                  variant="dark"
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Họ tên chủ tài khoản"
                  editable={!formLocked}
                />

                <TextField
                  label="Số tài khoản *"
                  variant="dark"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Nhập số tài khoản"
                  editable={!formLocked}
                />

                <View style={styles.switchRow}>
                  <View style={styles.switchLabels}>
                    <Text style={styles.switchTitle}>Đặt làm mặc định</Text>
                  </View>
                  <Switch
                    value={isDefault}
                    onValueChange={setIsDefault}
                    disabled={formLocked}
                    trackColor={{
                      false: palette.border,
                      true: palette.greenBg,
                    }}
                    thumbColor={isDefault ? palette.green : palette.textMuted}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchLabels}>
                    <Text style={styles.switchTitle}>Hoạt động</Text>
                  </View>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    disabled={formLocked}
                    trackColor={{
                      false: palette.border,
                      true: palette.greenBg,
                    }}
                    thumbColor={isActive ? palette.green : palette.textMuted}
                  />
                </View>

                <View style={styles.footerRow}>
                  <Button
                    title="Hủy"
                    variant="outline"
                    onPress={onBack}
                    style={[styles.footerCancel, styles.footerPrimary]}
                    textStyle={styles.footerCancelText}
                  />
                  <Button
                    title={submitLabel}
                    variant="primary"
                    onPress={handleSubmit}
                    disabled={submitting || formLocked}
                    style={styles.footerPrimary}
                  />
                </View>
              </>
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
    scrollContent: { paddingHorizontal: 14, paddingTop: 12 },
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
      minWidth: 100,
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    footerCancelText: {
      color: c.textPrimary,
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
  });
}
