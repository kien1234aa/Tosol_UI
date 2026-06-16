import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { FormDatePickerField } from '../../category/priceList/components/FormDatePickerField';
import {
  dateToIsoDateOnly,
  isoDateOnlyToLocalDate,
} from '../../category/priceList/components/datePickerUtils';
import { CurrencySelect } from '../../category/priceList/components/CurrencySelect';
import type { CurrencyApi } from '@services/category/priceListApiTypes';
import { getCurrencies } from '@services/category/priceListAPI';
import { getSuppliers } from '@services/category/supplierAPI';
import type { SupplierApi } from '@services/category/supplierApiTypes';
import { DetailScreenSkeleton } from '@shared/components/ui/skeleton/DetailScreenSkeleton';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { fetchProductSuggestions } from '@services/sales/saleProductAPI';
import type { ShopProductRow } from '@services/sales/saleProductApiTypes';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import {
  createPurchaseOrder,
  getPurchaseOrderDetail,
  updatePurchaseOrder,
} from '@services/warehouse/purchaseOrderAPI';
import type {
  CreatePurchaseOrderItemPayload,
  CreatePurchaseOrderPayload,
  PurchaseOrderApi,
} from '@services/warehouse/purchaseOrderApiTypes';
import { PURCHASE_ORDER_SUPPLIER_DROPDOWN_KEY, PURCHASE_ORDER_WAREHOUSE_DROPDOWN_KEY } from '../../dropdownFrequency/dropdownFrequencyKeys';
import { useFrequencyDropdown } from '../../dropdownFrequency/useFrequencyDropdown';

export type CreatePurchaseOrderScreenProps = {
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Khi sửa — `order_number` hoặc id (cùng quy ước GET chi tiết). */
  editOrderRef?: string | null;
  /** Sau khi tạo thành công — trả về đơn vừa tạo (điều hướng chi tiết / đổi kho). */
  onCreated?: (order: PurchaseOrderApi) => void;
  /** Sau khi cập nhật thành công (màn sửa tái dùng form tạo). */
  onUpdated?: (order: PurchaseOrderApi) => void;
};

type WarehouseOpt = { id: number; name: string };

/** Giá trị giả trên Android Picker (không trùng id thật). */
const ANDROID_PICK_PLACEHOLDER = -1;

type PoLine = {
  key: string;
  productId: number | null;
  productName: string;
  thumbUri?: string | null;
  quantity: string;
  unitPrice: string;
};

function newLine(): PoLine {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    productId: null,
    productName: '',
    quantity: '1',
    unitPrice: '0',
  };
}

function createMpStyles(c: AppColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 12,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    rowTitle: { fontSize: 15, fontWeight: '600', color: c.textPrimary },
    rowSub: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    empty: {
      padding: 20,
      textAlign: 'center',
      color: c.textMuted,
      fontWeight: '600',
    },
  });
}

function ModalPicker<T extends { id: number }>({
  visible,
  title,
  options,
  labelOf,
  valueId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: T[];
  labelOf: (o: T) => string;
  valueId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const mp = useThemeStyleSheet(createMpStyles);

  const renderItem = useCallback(
    ({ item }: { item: T }) => (
      <Pressable
        style={mp.row}
        onPress={() => {
          onSelect(item.id);
          onClose();
        }}
      >
        <Text style={mp.rowTitle} numberOfLines={2}>
          {labelOf(item)}
        </Text>
        {valueId === item.id ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [labelOf, onSelect, onClose, valueId, mp.row, mp.rowTitle, palette.teal],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={mp.backdrop} onPress={onClose}>
        <Pressable
          style={[mp.sheet, { paddingBottom: insets.bottom + 16 }]}
          onPress={e => e.stopPropagation()}
        >
          <Text style={mp.sheetTitle}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function parseMoney(s: string): number {
  const n = Number(String(s).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function parseQty(s: string): number {
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Đơn giá trong ô: VN dấu chấm nghìn; phần thập phân chỉ khi tiền tệ có `decimals > 0`. */
function formatPoUnitPrice(n: number, decimals: number): string {
  if (!Number.isFinite(n) || n < 0) {
    return '0';
  }
  const r = Math.round(n);
  if (decimals <= 0) {
    return r.toLocaleString('vi-VN');
  }
  return n.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function apiNum(v: number | string | null | undefined): number {
  if (v == null) {
    return 0;
  }
  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : 0;
  }
  return Number(String(v).replace(',', '.')) || 0;
}

/** Khớp payload API v2 (`expected_at`: `YYYY-MM-DD`). */
function toExpectedAtDateOnly(raw: string): string | null {
  const t = raw.trim();
  if (!t) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return t;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(t)) {
    return t.slice(0, 10);
  }
  return t.length >= 10 ? t.slice(0, 10) : t;
}

export function CreatePurchaseOrderScreen({
  onOpenDrawer,
  onBack,
  editOrderRef,
  onCreated,
  onUpdated,
}: CreatePurchaseOrderScreenProps) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const styles = useThemeStyleSheet(createPoStyles);
  const editRefTrim = editOrderRef?.trim() ?? '';
  const isEdit = editRefTrim.length > 0;
  const user = useAppSelector(s => s.auth.user);
  const selectedWarehouseId = useAppSelector(s => s.auth.selectedWarehouseId);
  const warehouses: WarehouseOpt[] = useMemo(() => {
    return (user?.warehouses ?? []).map(w => ({ id: w.id, name: w.name }));
  }, [user?.warehouses]);
  const dropdownAccountKey = useMemo(
    () => user?.uuid ?? user?.email ?? null,
    [user?.email, user?.uuid],
  );

  const [loadingRefs, setLoadingRefs] = useState(true);
  const [suppliers, setSuppliers] = useState<SupplierApi[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyApi[]>([]);
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [warehousePickerOpen, setWarehousePickerOpen] = useState(false);

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [expectedAt, setExpectedAt] = useState('');
  const [tracking, setTracking] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<PoLine[]>(() => [newLine()]);

  const [productPickerLineKey, setProductPickerLineKey] = useState<
    string | null
  >(null);
  const [productSearch, setProductSearch] = useState('');
  const [productHits, setProductHits] = useState<ShopProductRow[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEditPo, setLoadingEditPo] = useState(false);
  const productPickerInputRef = useRef<TextInput>(null);

  const closeProductPicker = useCallback(() => {
    setProductPickerLineKey(null);
    setProductSearch('');
    setProductHits([]);
  }, []);

  useEffect(() => {
    if (!productPickerLineKey) {
      return;
    }
    const t = setTimeout(() => productPickerInputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [productPickerLineKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingRefs(true);
      try {
        const [supRes, curList] = await Promise.all([
          getSuppliers({ page: 1, per_page: 100, is_active: true }),
          getCurrencies({ page: 1, per_page: 100 }),
        ]);
        if (cancelled) {
          return;
        }
        const supList =
          supRes.success && Array.isArray(supRes.data) ? supRes.data : [];
        setSuppliers(supList);
        setCurrencies(curList);
        if (!editOrderRef?.trim()) {
          const firstSup = supList[0];
          if (firstSup) {
            setSupplierId(firstSup.id);
          }
          const defCur =
            curList.find(c => c.is_default) ??
            curList.find(c => c.code === 'VND') ??
            curList[0];
          if (defCur) {
            setCurrencyId(defCur.id);
          }
          const wh =
            warehouses.find(w => w.id === selectedWarehouseId) ??
            warehouses[0] ??
            null;
          if (wh) {
            setWarehouseId(wh.id);
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Không tải được dữ liệu form.');
        }
      } finally {
        if (!cancelled) {
          setLoadingRefs(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedWarehouseId, warehouses, editOrderRef]);

  useEffect(() => {
    if (!editRefTrim || loadingRefs) {
      return;
    }
    let cancelled = false;
    setLoadingEditPo(true);
    void (async () => {
      try {
        const po = await getPurchaseOrderDetail(editRefTrim);
        if (cancelled) {
          return;
        }
        const dec = po.currency?.decimal_places ?? 0;
        setSupplierId(po.supplier_id ?? po.supplier?.id ?? null);
        setWarehouseId(po.warehouse_id ?? po.warehouse?.id ?? null);
        setCurrencyId(po.currency_id ?? po.currency?.id ?? null);
        const exp = po.expected_at?.trim();
        if (exp && exp.length >= 10) {
          setExpectedAt(exp.slice(0, 10));
        } else {
          setExpectedAt('');
        }
        setTracking((po.tracking_number ?? '').trim());
        setNote((po.note ?? '').trim());
        const rawItems = po.items ?? [];
        const nextLines: PoLine[] = rawItems.map((it, i) => {
          const pid = it.product_id ?? it.product?.id ?? null;
          const apiQty =
            apiNum(it.expected_quantity) > 0
              ? apiNum(it.expected_quantity)
              : apiNum(it.quantity);
          const priceNum = apiNum(it.unit_price);
          return {
            key: `po-line-${it.id ?? i}-${pid ?? 'x'}`,
            productId: pid,
            productName: (it.name ?? it.product?.name ?? '').trim(),
            quantity: String(apiQty),
            unitPrice: formatPoUnitPrice(priceNum, dec),
          };
        });
        setLines(nextLines.length > 0 ? nextLines : [newLine()]);
      } catch (e: unknown) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Không tải được đơn mua hàng để sửa.');
        }
      } finally {
        if (!cancelled) {
          setLoadingEditPo(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editRefTrim, loadingRefs]);

  useEffect(() => {
    if (!productPickerLineKey) {
      return;
    }
    const q = productSearch.trim();
    let cancelled = false;
    setProductLoading(true);
    const t = setTimeout(() => {
      fetchProductSuggestions({ search: q || undefined })
        .then(rows => {
          if (!cancelled) {
            setProductHits(rows);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setProductHits([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setProductLoading(false);
          }
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [productPickerLineKey, productSearch]);

  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const selectedWarehouse = warehouses.find(w => w.id === warehouseId);
  const supplierFrequencyOptions = useMemo(
    () => suppliers.map(s => ({ ...s, value: s.id })),
    [suppliers],
  );
  const warehouseFrequencyOptions = useMemo(
    () => warehouses.map(w => ({ ...w, value: w.id })),
    [warehouses],
  );
  const {
    sortedOptions: sortedSuppliers,
    handleSelect: recordSupplierSelect,
  } = useFrequencyDropdown(
    PURCHASE_ORDER_SUPPLIER_DROPDOWN_KEY,
    supplierFrequencyOptions,
    dropdownAccountKey,
  );
  const {
    sortedOptions: sortedWarehouses,
    handleSelect: recordWarehouseSelect,
  } = useFrequencyDropdown(
    PURCHASE_ORDER_WAREHOUSE_DROPDOWN_KEY,
    warehouseFrequencyOptions,
    dropdownAccountKey,
  );
  const handleSupplierSelect = useCallback(
    (id: number) => {
      setSupplierId(id);
      recordSupplierSelect(id);
    },
    [recordSupplierSelect],
  );
  const handleWarehouseSelect = useCallback(
    (id: number) => {
      setWarehouseId(id);
      recordWarehouseSelect(id);
    },
    [recordWarehouseSelect],
  );

  const { productCount, qtySum, subtotal } = useMemo(() => {
    let pc = 0;
    let qs = 0;
    let sub = 0;
    for (const ln of lines) {
      const q = parseQty(ln.quantity);
      const p = parseMoney(ln.unitPrice);
      const lineMoney = q * p;
      sub += lineMoney;
      if (ln.productId != null) {
        pc += 1;
        qs += q;
      }
    }
    return { productCount: pc, qtySum: qs, subtotal: sub };
  }, [lines]);

  const decimals =
    currencies.find(c => c.id === currencyId)?.decimal_places ?? 0;

  const updateLine = useCallback((key: string, patch: Partial<PoLine>) => {
    setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines(prev =>
      prev.length <= 1 ? prev : prev.filter(l => l.key !== key),
    );
  }, []);

  const submit = useCallback(async () => {
    if (warehouseId == null) {
      toast.warning('Chọn kho hàng.');
      return;
    }
    const items: CreatePurchaseOrderItemPayload[] = [];
    for (const ln of lines) {
      if (ln.productId == null) {
        continue;
      }
      const q = parseQty(ln.quantity);
      if (q <= 0) {
        toast.warning('Số lượng phải lớn hơn 0 cho mỗi dòng đã chọn sản phẩm.');
        return;
      }
      items.push({
        product_id: ln.productId,
        quantity: q.toFixed(2),
        unit_price: parseMoney(ln.unitPrice),
      });
    }
    if (items.length === 0) {
      toast.warning('Thêm ít nhất một sản phẩm.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreatePurchaseOrderPayload = {
        warehouse_id: warehouseId,
        items,
      };
      if (supplierId != null) {
        payload.supplier_id = supplierId;
      }
      if (currencyId != null) {
        payload.currency_id = currencyId;
      }
      const exp = toExpectedAtDateOnly(expectedAt);
      if (exp) {
        payload.expected_at = exp;
      }
      const tr = tracking.trim();
      if (tr) {
        payload.tracking_number = tr;
      }
      const nt = note.trim();
      if (nt) {
        payload.note = nt;
      }
      if (isEdit) {
        const updated = await updatePurchaseOrder(editRefTrim, payload);
        if (onUpdated) {
          onUpdated(updated);
          onBack();
        } else {
          toast.success('Đơn mua hàng đã được cập nhật.');
          onBack();
        }
      } else {
        const created = await createPurchaseOrder(payload);
        if (onCreated) {
          onCreated(created);
          onBack();
        } else {
          toast.success('Đơn mua hàng đã được tạo.');
          onBack();
        }
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Lỗi không xác định.');
    } finally {
      setSubmitting(false);
    }
  }, [
    supplierId,
    warehouseId,
    currencyId,
    expectedAt,
    tracking,
    note,
    lines,
    onBack,
    onCreated,
    onUpdated,
    isEdit,
    editRefTrim,
  ]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {loadingRefs || loadingEditPo ? (
          <DetailScreenSkeleton style={styles.loadingBox} />
        ) : (
          <View style={styles.formCol}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FormScreenHeading
                sectionLabel="Mua hàng"
                title={isEdit ? 'Sửa đơn mua hàng' : 'Tạo đơn mua hàng'}
              />
              <DetailCard title="Chi tiết đơn hàng" icon="clipboard">
                <Text style={styles.fieldLab}>Nhà cung cấp *</Text>
                {Platform.OS === 'android' ? (
                  suppliers.length === 0 ? (
                    <View style={[styles.fakeField, styles.fakeFieldDis]}>
                      <Text style={[styles.fakeFieldTxt, styles.ph]}>
                        Chưa có nhà cung cấp
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[styles.fakeField, styles.fakeFieldAndroidPicker]}
                    >
                      <Picker
                        mode="dialog"
                        prompt="Chọn nhà cung cấp"
                        dropdownIconColor={colors.textMuted}
                        style={styles.androidPicker}
                        selectedValue={supplierId ?? ANDROID_PICK_PLACEHOLDER}
                        onValueChange={v => {
                          const n = typeof v === 'string' ? Number(v) : v;
                          if (
                            !Number.isFinite(n) ||
                            n === ANDROID_PICK_PLACEHOLDER
                          ) {
                            return;
                          }
                          handleSupplierSelect(n);
                        }}
                      >
                        <Picker.Item
                          label="Chọn nhà cung cấp"
                          value={ANDROID_PICK_PLACEHOLDER}
                          enabled={false}
                        />
                        {sortedSuppliers.map(s => (
                          <Picker.Item key={s.id} label={s.name} value={s.id} />
                        ))}
                      </Picker>
                    </View>
                  )
                ) : (
                  <Pressable
                    onPress={() => setSupplierPickerOpen(true)}
                    style={styles.fakeField}
                  >
                    <Text
                      style={[
                        styles.fakeFieldTxt,
                        !selectedSupplier && styles.ph,
                      ]}
                      numberOfLines={2}
                    >
                      {selectedSupplier?.name ?? 'Chọn nhà cung cấp'}
                    </Text>
                    <SystemIcon
                      name="chevronDown"
                      size={16}
                      color={colors.textMuted}
                    />
                  </Pressable>
                )}

                <Text style={[styles.fieldLab, styles.mt]}>Kho hàng *</Text>
                {Platform.OS === 'android' ? (
                  warehouses.length === 0 ? (
                    <View style={[styles.fakeField, styles.fakeFieldDis]}>
                      <Text style={[styles.fakeFieldTxt, styles.ph]}>
                        Chưa có kho
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[styles.fakeField, styles.fakeFieldAndroidPicker]}
                    >
                      <Picker
                        mode="dialog"
                        prompt="Chọn kho hàng"
                        dropdownIconColor={colors.textMuted}
                        style={styles.androidPicker}
                        selectedValue={warehouseId ?? ANDROID_PICK_PLACEHOLDER}
                        onValueChange={v => {
                          const n = typeof v === 'string' ? Number(v) : v;
                          if (
                            !Number.isFinite(n) ||
                            n === ANDROID_PICK_PLACEHOLDER
                          ) {
                            return;
                          }
                          handleWarehouseSelect(n);
                        }}
                      >
                        <Picker.Item
                          label="Chọn kho"
                          value={ANDROID_PICK_PLACEHOLDER}
                          enabled={false}
                        />
                        {sortedWarehouses.map(w => (
                          <Picker.Item key={w.id} label={w.name} value={w.id} />
                        ))}
                      </Picker>
                    </View>
                  )
                ) : (
                  <Pressable
                    onPress={() =>
                      warehouses.length > 0 && setWarehousePickerOpen(true)
                    }
                    style={[
                      styles.fakeField,
                      warehouses.length === 0 && styles.fakeFieldDis,
                    ]}
                    disabled={warehouses.length === 0}
                  >
                    <View style={styles.whIcoSlot}>
                      <SystemIcon
                        name="store"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.fakeFieldTxt,
                        !selectedWarehouse && styles.ph,
                      ]}
                      numberOfLines={2}
                    >
                      {selectedWarehouse?.name ?? 'Chọn kho'}
                    </Text>
                    <SystemIcon
                      name="chevronDown"
                      size={16}
                      color={colors.textMuted}
                    />
                  </Pressable>
                )}

                <View style={styles.row2}>
                  <View style={styles.half}>
                    <CurrencySelect
                      label="Tiền tệ"
                      required
                      options={currencies}
                      valueId={currencyId}
                      onChange={setCurrencyId}
                    />
                  </View>
                  <View style={styles.half}>
                    <FormDatePickerField
                      label="Ngày dự kiến nhận"
                      value={isoDateOnlyToLocalDate(expectedAt)}
                      onChange={d => {
                        setExpectedAt(d ? dateToIsoDateOnly(d) : '');
                      }}
                    />
                  </View>
                </View>

                <TextField
                  label="Mã vận đơn"
                  variant="dark"
                  value={tracking}
                  onChangeText={setTracking}
                  placeholder="Theo dõi vận chuyển"
                />

                <Text style={styles.fieldLab}>Ghi chú</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ghi chú cho đơn mua…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  style={styles.note}
                  textAlignVertical="top"
                />
              </DetailCard>

              <DetailCard title="Sản phẩm" icon="cube">
                <Pressable
                  onPress={() => setLines(prev => [...prev, newLine()])}
                  style={styles.addProdBtn}
                >
                  <Text style={styles.addProdTxt}>+ Thêm dòng</Text>
                </Pressable>

                <View style={styles.prodList}>
                  {lines.map(ln => {
                    const pickerOpen = productPickerLineKey === ln.key;
                    return (
                      <View key={ln.key} style={styles.prodLine}>
                        <View style={styles.prodLineTop}>
                          {pickerOpen ? (
                            <View
                              style={[
                                styles.prodPick,
                                styles.prodPickOpen,
                              ]}
                            >
                              <TextInput
                                ref={productPickerInputRef}
                                value={productSearch}
                                onChangeText={setProductSearch}
                                placeholder="Tìm tên hoặc SKU…"
                                placeholderTextColor={colors.textMuted}
                                style={styles.prodPickInput}
                                autoCapitalize="none"
                                autoCorrect={false}
                              />
                              <Pressable
                                onPress={closeProductPicker}
                                hitSlop={10}
                              >
                                <SystemIcon
                                  name="chevronUp"
                                  size={20}
                                  color={colors.textMuted}
                                />
                              </Pressable>
                            </View>
                          ) : (
                            <Pressable
                              style={styles.prodPick}
                              onPress={() => {
                                setProductPickerLineKey(ln.key);
                                setProductSearch('');
                                setProductHits([]);
                              }}
                            >
                              {ln.productId != null ? (
                                ln.thumbUri ? (
                                  <Image
                                    source={{ uri: ln.thumbUri }}
                                    style={styles.prodPickThumb}
                                  />
                                ) : (
                                  <View style={styles.prodPickThumbPh}>
                                    <SystemIcon name="cube" size={14} color={colors.textMuted} />
                                  </View>
                                )
                              ) : null}
                              <Text
                                style={[
                                  styles.prodPickName,
                                  !ln.productName.trim() && styles.prodPickPh,
                                ]}
                                numberOfLines={2}
                              >
                                {ln.productName.trim() || 'Chọn sản phẩm'}
                              </Text>
                              <SystemIcon
                                name="chevronDown"
                                size={20}
                                color={colors.textMuted}
                              />
                            </Pressable>
                          )}
                          <Pressable
                            onPress={() => {
                              if (pickerOpen) {
                                closeProductPicker();
                              }
                              removeLine(ln.key);
                            }}
                            style={styles.prodDel}
                            hitSlop={8}
                          >
                            <SystemIcon
                              name="trash"
                              size={22}
                              color={colors.red}
                            />
                          </Pressable>
                        </View>

                        {pickerOpen ? (
                          <View style={styles.prodHits}>
                            {productLoading ? (
                              <ActivityIndicator
                                color={colors.cyan}
                                style={styles.prodHitsSpinner}
                              />
                            ) : (
                              <ScrollView
                                keyboardShouldPersistTaps="handled"
                                nestedScrollEnabled
                                style={styles.prodHitsScroll}
                              >
                                {productHits.length === 0 ? (
                                  <Text style={styles.prodHitsEmpty}>
                                    Không thấy sản phẩm
                                  </Text>
                                ) : (
                                  productHits.map(item => (
                                    <Pressable
                                      key={String(item.id)}
                                      style={styles.prodHit}
                                      onPress={() => {
                                        updateLine(ln.key, {
                                          productId: item.id,
                                          productName: item.name,
                                          thumbUri: item.thumbUri ?? null,
                                          unitPrice: formatPoUnitPrice(
                                            item.price,
                                            decimals,
                                          ),
                                        });
                                        closeProductPicker();
                                      }}
                                    >
                                      {item.thumbUri ? (
                                        <Image
                                          source={{ uri: item.thumbUri }}
                                          style={styles.prodHitThumb}
                                        />
                                      ) : (
                                        <View style={styles.prodHitThumbPh}>
                                          <SystemIcon name="cube" size={16} color="#9ca3af" />
                                        </View>
                                      )}
                                      <View style={styles.prodHitInfo}>
                                        <Text
                                          style={styles.prodHitName}
                                          numberOfLines={2}
                                        >
                                          {item.name}
                                        </Text>
                                        {item.sku ? (
                                          <Text style={styles.prodHitSku} numberOfLines={1}>
                                            {item.sku}
                                          </Text>
                                        ) : null}
                                      </View>
                                    </Pressable>
                                  ))
                                )}
                              </ScrollView>
                            )}
                          </View>
                        ) : null}

                        <View style={styles.prodNums}>
                          <TextField
                            label="SL"
                            variant="dark"
                            size="md"
                            value={ln.quantity}
                            onChangeText={t =>
                              updateLine(ln.key, { quantity: t })
                            }
                            keyboardType="decimal-pad"
                            containerStyle={styles.prodNumField}
                          />
                          <TextField
                            label="Đơn giá"
                            variant="dark"
                            size="md"
                            value={ln.unitPrice}
                            onChangeText={t =>
                              updateLine(ln.key, { unitPrice: t })
                            }
                            keyboardType="decimal-pad"
                            containerStyle={styles.prodPriceField}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </DetailCard>

              <DetailCard title="Tổng thành tiền" icon="cash">
                <Text style={styles.grandTotal}>
                  {decimals <= 0
                    ? Math.round(subtotal).toLocaleString('vi-VN')
                    : subtotal.toLocaleString('vi-VN', {
                        maximumFractionDigits: decimals,
                      })}
                </Text>
                <Text style={styles.grandMeta}>
                  {productCount} dòng ·{' '}
                  {qtySum.toLocaleString('vi-VN', {
                    maximumFractionDigits: 2,
                  })}{' '}
                  SL
                </Text>
              </DetailCard>
            </ScrollView>

            <View
              style={[
                styles.footerActions,
                { paddingBottom: Math.max(insets.bottom, 12) },
              ]}
            >
              <Button
                title="Hủy"
                variant="secondary"
                onPress={onBack}
                disabled={submitting}
                style={styles.footerBtn}
              />
              <Button
                title={isEdit ? 'Lưu' : 'Tạo mới'}
                variant="primary"
                loading={submitting}
                onPress={() => {
                  void submit();
                }}
                style={styles.footerBtn}
              />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {Platform.OS !== 'android' ? (
        <>
          <ModalPicker<SupplierApi>
            visible={supplierPickerOpen}
            title="Nhà cung cấp"
            options={sortedSuppliers}
            labelOf={s => s.name}
            valueId={supplierId}
            onSelect={handleSupplierSelect}
            onClose={() => setSupplierPickerOpen(false)}
          />
          <ModalPicker<WarehouseOpt>
            visible={warehousePickerOpen}
            title="Kho hàng"
            options={sortedWarehouses}
            labelOf={w => w.name}
            valueId={warehouseId}
            onSelect={handleWarehouseSelect}
            onClose={() => setWarehousePickerOpen(false)}
          />
        </>
      ) : null}
    </View>
  );
}

function createPoStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1, minHeight: 0 },
    formCol: { flex: 1, minHeight: 0 },
    loadingBox: { flex: 1, justifyContent: 'center', paddingVertical: 48 },
    scroll: { flex: 1, minHeight: 0 },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 16,
    },
    footerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.bgLayer,
    },
    footerBtn: { flex: 1, minWidth: 0 },
    fieldLab: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 6,
    },
    mt: { marginTop: 12 },
    fakeField: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      marginBottom: 4,
    },
    fakeFieldDis: { opacity: 0.5 },
    /** Picker Android không nằm trong hàng ngang `row` của fakeField — tránh tràn / đè lên hàng dưới. */
    fakeFieldAndroidPicker: {
      flexDirection: 'column',
      alignItems: 'stretch',
      alignSelf: 'stretch',
      paddingVertical: 2,
      paddingHorizontal: 8,
    },
    androidPicker: {
      width: '100%',
      color: c.textPrimary,
      backgroundColor: 'transparent',
    },
    fakeFieldTxt: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    ph: { color: c.textMuted, fontWeight: '500' },
    whIcoSlot: { marginRight: 8, justifyContent: 'center' },
    row2: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 12,
    },
    half: { flex: 1, minWidth: 0 },
    note: {
      minHeight: 88,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: c.textPrimary,
      marginBottom: 4,
    },
    addProdBtn: {
      alignSelf: 'stretch',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.teal,
      backgroundColor: 'rgba(45,212,191,0.1)',
    },
    addProdTxt: { fontSize: 15, fontWeight: '800', color: c.tealLight },
    prodList: { gap: 16 },
    prodLine: { gap: 10 },
    prodLineTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    prodPick: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 52,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    prodPickOpen: {
      borderColor: c.teal,
      backgroundColor: 'rgba(45,212,191,0.06)',
    },
    prodPickInput: {
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      fontWeight: '600',
      color: c.textPrimary,
      paddingVertical: 0,
    },
    prodPickName: {
      flex: 1,
      minWidth: 0,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      color: c.textPrimary,
    },
    prodPickPh: { color: c.textMuted, fontWeight: '500' },
    prodPickThumb: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: c.bgInput,
    },
    prodPickThumbPh: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    prodDel: {
      width: 44,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(239,68,68,0.1)',
    },
    prodHits: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgLayer3,
      overflow: 'hidden',
    },
    prodHitsSpinner: { paddingVertical: 14 },
    prodHitsScroll: { maxHeight: 200 },
    prodHit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    prodHitThumb: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: c.bgInput,
    },
    prodHitThumbPh: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    prodHitInfo: { flex: 1, minWidth: 0 },
    prodHitName: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
    prodHitSku: { fontSize: 12, fontWeight: '500', color: c.textMuted, marginTop: 2 },
    prodHitsEmpty: {
      padding: 16,
      textAlign: 'center',
      fontSize: 14,
      color: c.textMuted,
      fontWeight: '600',
    },
    prodNums: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    prodNumField: { width: 96, marginBottom: 0 },
    prodPriceField: { flex: 1, minWidth: 0, marginBottom: 0 },
    grandTotal: {
      fontSize: 28,
      fontWeight: '800',
      color: c.tealLight,
      letterSpacing: -0.5,
    },
    grandMeta: {
      marginTop: 6,
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
    },
  });
}
