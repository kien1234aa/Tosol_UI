import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { Button } from '@shared/components/ui/Button';
import { TextField } from '@shared/components/ui/TextField';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { fetchProductSuggestions } from '@services/sales/saleProductAPI';
import type { ShopProductRow } from '@services/sales/saleProductApiTypes';
import { createComboAssembly } from '@services/warehouse/comboAssemblyAPI';
import type { ComboAssemblyApi } from '@services/warehouse/comboAssemblyApiTypes';
import { COMBO_ASSEMBLY_WAREHOUSE_DROPDOWN_KEY } from '../../dropdownFrequency/dropdownFrequencyKeys';
import { useFrequencyDropdown } from '../../dropdownFrequency/useFrequencyDropdown';

export type CreateComboAssemblyModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Sau khi tạo thành công (đã lưu trên server). */
  onCreated?: (row: ComboAssemblyApi) => void;
};

type WarehouseOpt = { id: number; name: string };

function parseQty(s: string): number {
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function createModalPickerStyles(c: AppColorPalette) {
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
      maxHeight: '72%',
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
    rowTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
      flex: 1,
    },
    empty: {
      padding: 20,
      textAlign: 'center',
      color: c.textMuted,
      fontWeight: '600',
    },
  });
}

function WarehousePickerModal({
  visible,
  options,
  valueId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  options: WarehouseOpt[];
  valueId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const mp = useThemeStyleSheet(createModalPickerStyles);

  const renderItem = useCallback(
    ({ item }: { item: WarehouseOpt }) => (
      <Pressable
        style={mp.row}
        onPress={() => {
          onSelect(item.id);
          onClose();
        }}
      >
        <Text style={mp.rowTitle} numberOfLines={2}>
          {item.name}
        </Text>
        {valueId === item.id ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [onSelect, onClose, valueId, mp.row, mp.rowTitle, palette.teal],
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
          <Text style={mp.sheetTitle}>Chọn kho</Text>
          <FlatList
            data={options}
            keyExtractor={item => String(item.id)}
            ListEmptyComponent={<Text style={mp.empty}>Không có kho.</Text>}
            renderItem={renderItem}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(c: AppColorPalette) {
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
    hint: {
      fontSize: 12,
      color: c.textMuted,
      fontWeight: '600',
      marginTop: -6,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 6,
    },
    selectRow: {
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
    selectText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    suggestionsBox: {
      maxHeight: 200,
      marginTop: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
      backgroundColor: c.bgCard,
    },
    sugRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    sugThumbWrap: {
      width: 40,
      height: 40,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      flexShrink: 0,
    },
    sugThumbImg: { width: '100%', height: '100%' },
    sugThumbPh: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    sugTextCol: { flex: 1, minWidth: 0 },
    sugName: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
    sugSku: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    selectedChip: {
      marginTop: 8,
      padding: 10,
      borderRadius: 10,
      backgroundColor: c.bgRow,
    },
    selectedChipText: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
    strategyRow: { flexDirection: 'row', gap: 10 },
    strategyBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      backgroundColor: c.bgCard,
    },
    strategyBtnOn: {
      borderColor: c.teal,
      backgroundColor: c.bgRow,
    },
    strategyLabel: { fontSize: 14, fontWeight: '700', color: c.textPrimary },
    strategyLabelOn: { color: c.teal },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    footerBtn: { flex: 1 },
    noteInput: {
      minHeight: 88,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: c.textPrimary,
      backgroundColor: c.bgCard,
      textAlignVertical: 'top',
    },
  });
}

export function CreateComboAssemblyModal({
  visible,
  onClose,
  onCreated,
}: CreateComboAssemblyModalProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createStyles);
  const insets = useSafeAreaInsets();
  const user = useAppSelector(s => s.auth.user);
  const dropdownAccountKey = useMemo(
    () => user?.uuid ?? user?.email ?? null,
    [user?.email, user?.uuid],
  );

  const warehouses: WarehouseOpt[] = useMemo(
    () =>
      (user?.warehouses ?? []).map(w => ({
        id: w.id,
        name: w.name?.trim() ? w.name : w.code ?? `Kho #${w.id}`,
      })),
    [user?.warehouses],
  );
  const warehouseFrequencyOptions = useMemo(
    () => warehouses.map(w => ({ ...w, value: w.id })),
    [warehouses],
  );
  const {
    sortedOptions: sortedWarehouses,
    handleSelect: recordWarehouseSelect,
  } = useFrequencyDropdown(
    COMBO_ASSEMBLY_WAREHOUSE_DROPDOWN_KEY,
    warehouseFrequencyOptions,
    dropdownAccountKey,
  );

  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [debouncedProductQuery, setDebouncedProductQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ShopProductRow[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProductRow | null>(
    null,
  );
  const [quantity, setQuantity] = useState('1');
  const [pickStrategy, setPickStrategy] = useState<'FIFO' | 'FEFO'>('FIFO');
  const [requestNote, setRequestNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedProductQuery(productQuery.trim()),
      350,
    );
    return () => clearTimeout(t);
  }, [productQuery]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const w = user?.current_warehouse_id;
    const first = warehouses[0]?.id ?? null;
    setWarehouseId(typeof w === 'number' && Number.isFinite(w) ? w : first);
    setProductQuery('');
    setDebouncedProductQuery('');
    setSuggestions([]);
    setSelectedProduct(null);
    setQuantity('1');
    setPickStrategy('FIFO');
    setRequestNote('');
    setPickerOpen(false);
    setSubmitting(false);
  }, [visible, user?.current_warehouse_id, warehouses]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (debouncedProductQuery.length < 1) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    let cancelled = false;
    setSuggestLoading(true);
    void (async () => {
      try {
        const rows = await fetchProductSuggestions({
          search: debouncedProductQuery,
        });
        if (!cancelled) {
          setSuggestions(rows);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSuggestLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, debouncedProductQuery]);

  const warehouseLabel = useMemo(() => {
    const w = warehouses.find(x => x.id === warehouseId);
    return w?.name ?? 'Chọn kho';
  }, [warehouses, warehouseId]);

  const handleWarehouseSelect = useCallback(
    (id: number) => {
      setWarehouseId(id);
      recordWarehouseSelect(id);
    },
    [recordWarehouseSelect],
  );

  const onSubmit = useCallback(async () => {
    if (warehouseId == null) {
      toast.warning('Vui lòng chọn kho.');
      return;
    }
    if (!selectedProduct) {
      toast.warning('Vui lòng tìm và chọn sản phẩm combo cần đóng gói.');
      return;
    }
    const qty = parseQty(quantity);
    if (qty <= 0) {
      toast.warning('Nhập số lượng hợp lệ (lớn hơn 0).');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createComboAssembly({
        warehouse_id: warehouseId,
        product_id: selectedProduct.id,
        quantity: qty,
        pick_strategy: pickStrategy,
        request_note: requestNote.trim() || undefined,
        seller_id: user?.seller?.id ?? undefined,
      });
      onCreated?.(created);
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  }, [
    warehouseId,
    selectedProduct,
    quantity,
    pickStrategy,
    requestNote,
    user?.seller?.id,
    onCreated,
    onClose,
  ]);

  const noWarehouses = warehouses.length === 0;

  const renderSuggestionItem = useCallback(
    ({ item }: { item: ShopProductRow }) => {
      const uri = item.thumbUri?.trim() ?? '';
      return (
        <Pressable
          style={styles.sugRow}
          onPress={() => {
            setSelectedProduct(item);
            setProductQuery(item.name);
            setSuggestions([]);
          }}
        >
          <View style={styles.sugThumbWrap}>
            {uri ? (
              <Image
                source={{ uri }}
                style={styles.sugThumbImg}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.sugThumbPh}>
                <SystemIcon name="package" size={18} color={palette.textMuted} />
              </View>
            )}
          </View>
          <View style={styles.sugTextCol}>
            <Text style={styles.sugName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.sku ? (
              <Text style={styles.sugSku}>{item.sku}</Text>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [
      styles.sugRow,
      styles.sugThumbWrap,
      styles.sugThumbImg,
      styles.sugThumbPh,
      styles.sugTextCol,
      styles.sugName,
      styles.sugSku,
      palette.textMuted,
    ],
  );

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}
          >
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
            <Text style={styles.title} numberOfLines={1}>
              Tạo yêu cầu mới
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <Text style={styles.fieldLabel}>Kho</Text>
              <Pressable
                style={styles.selectRow}
                onPress={() => !noWarehouses && setPickerOpen(true)}
                disabled={noWarehouses}
              >
                <Text style={styles.selectText} numberOfLines={2}>
                  {noWarehouses ? 'Không có kho gắn tài khoản' : warehouseLabel}
                </Text>
                <SystemIcon
                  name="chevronDown"
                  size={18}
                  color={palette.textMuted}
                />
              </Pressable>
            </View>

            <View>
              <Text style={styles.fieldLabel}>Sản phẩm combo</Text>
              <Text style={styles.hint}>
                Gõ SKU hoặc tên để tìm; chỉ chọn sản phẩm dạng combo cần lắp.
              </Text>
              <TextField
                label=""
                placeholder="Tìm sản phẩm…"
                value={productQuery}
                onChangeText={t => {
                  setProductQuery(t);
                  if (selectedProduct) {
                    setSelectedProduct(null);
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {suggestLoading ? (
                <View style={{ paddingVertical: 8, alignItems: 'center' }}>
                  <ActivityIndicator color={palette.teal} />
                </View>
              ) : null}
              {debouncedProductQuery.length > 0 && suggestions.length > 0 ? (
                <View style={styles.suggestionsBox}>
                  <FlatList
                    data={suggestions}
                    keyboardShouldPersistTaps="handled"
                    keyExtractor={item => String(item.id)}
                    nestedScrollEnabled
                    renderItem={renderSuggestionItem}
                  />
                </View>
              ) : null}
              {selectedProduct ? (
                <View style={styles.selectedChip}>
                  <Text style={styles.selectedChipText} numberOfLines={2}>
                    Đã chọn: {selectedProduct.name}
                    {selectedProduct.sku ? ` (${selectedProduct.sku})` : ''}
                  </Text>
                </View>
              ) : null}
            </View>

            <View>
              <Text style={styles.fieldLabel}>Số lượng combo</Text>
              <TextField
                label=""
                placeholder="1"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
            </View>

            <View>
              <Text style={styles.fieldLabel}>
                Chiến lược lấy hàng linh kiện
              </Text>
              <View style={styles.strategyRow}>
                <Pressable
                  style={[
                    styles.strategyBtn,
                    pickStrategy === 'FIFO' ? styles.strategyBtnOn : null,
                  ]}
                  onPress={() => setPickStrategy('FIFO')}
                >
                  <Text
                    style={[
                      styles.strategyLabel,
                      pickStrategy === 'FIFO' ? styles.strategyLabelOn : null,
                    ]}
                  >
                    FIFO
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.strategyBtn,
                    pickStrategy === 'FEFO' ? styles.strategyBtnOn : null,
                  ]}
                  onPress={() => setPickStrategy('FEFO')}
                >
                  <Text
                    style={[
                      styles.strategyLabel,
                      pickStrategy === 'FEFO' ? styles.strategyLabelOn : null,
                    ]}
                  >
                    FEFO
                  </Text>
                </Pressable>
              </View>
            </View>

            <View>
              <Text style={styles.fieldLabel}>Ghi chú (tuỳ chọn)</Text>
              <TextInput
                value={requestNote}
                onChangeText={setRequestNote}
                placeholder="Ghi chú cho kho / picker…"
                placeholderTextColor={palette.textMuted}
                multiline
                style={styles.noteInput}
              />
            </View>
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.footerBtn}>
              <Button
                title="Hủy"
                variant="outline"
                onPress={onClose}
                disabled={submitting}
              />
            </View>
            <View style={styles.footerBtn}>
              <Button
                title="Gửi yêu cầu"
                variant="primary"
                loading={submitting}
                onPress={() => void onSubmit()}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <WarehousePickerModal
        visible={pickerOpen}
        options={sortedWarehouses}
        valueId={warehouseId}
        onSelect={handleWarehouseSelect}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
