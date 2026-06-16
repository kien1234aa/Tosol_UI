import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
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
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { SystemIcon, type SystemIconName } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { TextField } from '@shared/components/ui/TextField';
import { BRAND_HEX, RADIUS } from '@shared/theme/designTokens';
import { fetchProductSuggestions } from '@services/sales/saleProductAPI';
import type { ShopProductRow } from '@services/sales/saleProductApiTypes';
import { createOutboundOrder } from '@services/warehouse/outboundOrderAPI';
import type { OutboundOrderApi } from '@services/warehouse/outboundOrderApiTypes';
import { OUTBOUND_ORDER_DESTINATION_WAREHOUSE_DROPDOWN_KEY, OUTBOUND_ORDER_SOURCE_WAREHOUSE_DROPDOWN_KEY } from '../../dropdownFrequency/dropdownFrequencyKeys';
import { useFrequencyDropdown } from '../../dropdownFrequency/useFrequencyDropdown';

type WarehouseOpt = { id: number; name: string };

type Line = {
  key: string;
  productId: number;
  name: string;
  sku: string;
  quantity: string;
  thumbUri?: string | null;
};

type TypeOption = {
  apiType: string;
  labelKey: string;
  icon: SystemIconName;
  enabled: boolean;
};

const TYPE_OPTIONS: TypeOption[] = [
  {
    apiType: 'balance_transfer',
    labelKey: 'warehouseOutbound.create.typeBalanceTransfer',
    icon: 'refresh',
    enabled: true,
  },
  {
    apiType: 'disposal',
    labelKey: 'warehouseOutbound.create.typeDisposal',
    icon: 'trash',
    enabled: true,
  },
  {
    apiType: 'return_supplier',
    labelKey: 'warehouseOutbound.create.typeReturnSupplier',
    icon: 'business',
    enabled: false,
  },
  {
    apiType: 'return_seller',
    labelKey: 'warehouseOutbound.create.typeReturnSeller',
    icon: 'store',
    enabled: false,
  },
  {
    apiType: 'sale',
    labelKey: 'warehouseOutbound.create.typeSale',
    icon: 'cart',
    enabled: false,
  },
  {
    apiType: 'transfer_sale',
    labelKey: 'warehouseOutbound.create.typeTransferSale',
    icon: 'truck',
    enabled: false,
  },
];

function newLine(p: ShopProductRow): Line {
  return {
    key: `${Date.now()}-${p.id}-${Math.random().toString(36).slice(2, 7)}`,
    productId: p.id,
    name: p.name,
    sku: p.sku ?? '',
    quantity: '1',
    thumbUri: p.thumbUri ?? null,
  };
}

function parseQty(s: string): number {
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export type CreateOutboundOrderModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated?: (order: OutboundOrderApi) => void;
};

export function CreateOutboundOrderModal({
  visible,
  onClose,
  onCreated,
}: CreateOutboundOrderModalProps) {
  const { t } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createStyles);
  const insets = useSafeAreaInsets();
  const { user, selectedWarehouseId } = useAppSelector(s => s.auth);
  const dropdownAccountKey = useMemo(
    () => user?.uuid ?? user?.email ?? null,
    [user?.email, user?.uuid],
  );

  const warehouses: WarehouseOpt[] = useMemo(
    () => (user?.warehouses ?? []).map(w => ({ id: w.id, name: w.name })),
    [user?.warehouses],
  );
  const sourceWarehouseFrequencyOptions = useMemo(
    () => warehouses.map(w => ({ ...w, value: w.id })),
    [warehouses],
  );
  const {
    sortedOptions: sortedSourceWarehouses,
    handleSelect: recordSourceWarehouseSelect,
  } = useFrequencyDropdown(
    OUTBOUND_ORDER_SOURCE_WAREHOUSE_DROPDOWN_KEY,
    sourceWarehouseFrequencyOptions,
    dropdownAccountKey,
  );

  const [outboundType, setOutboundType] = useState<string>('balance_transfer');
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<
    number | null
  >(null);
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productHits, setProductHits] = useState<ShopProductRow[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [whPickerOpen, setWhPickerOpen] = useState(false);
  const [destPickerOpen, setDestPickerOpen] = useState(false);

  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const wh =
      warehouses.find(w => w.id === selectedWarehouseId) ??
      warehouses[0] ??
      null;
    setWarehouseId(wh?.id ?? null);
    setDestinationWarehouseId(null);
    setOutboundType('balance_transfer');
    setNote('');
    setLines([]);
    setProductSearch('');
    setProductHits([]);
  }, [visible, warehouses, selectedWarehouseId]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (warehouseId == null) {
      setProductHits([]);
      setProductLoading(false);
      return;
    }
    const q = productSearch.trim();
    let cancelled = false;
    setProductLoading(true);
    const timer = setTimeout(() => {
      fetchProductSuggestions({
        warehouseId,
        search: q || undefined,
      })
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
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [visible, productSearch, warehouseId]);

  const addProduct = useCallback((p: ShopProductRow) => {
    setLines(prev => [...prev, newLine(p)]);
    setProductSearch('');
    setProductHits([]);
    searchInputRef.current?.blur();
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines(prev => prev.filter(l => l.key !== key));
  }, []);

  const updateQty = useCallback((key: string, quantity: string) => {
    setLines(prev => prev.map(l => (l.key === key ? { ...l, quantity } : l)));
  }, []);

  const selectedWh = warehouses.find(w => w.id === warehouseId);
  const selectedDest = warehouses.find(w => w.id === destinationWarehouseId);
  const showDestination = outboundType === 'balance_transfer';

  const destOptions = useMemo(
    () => warehouses.filter(w => w.id !== warehouseId),
    [warehouses, warehouseId],
  );
  const destWarehouseFrequencyOptions = useMemo(
    () => destOptions.map(w => ({ ...w, value: w.id })),
    [destOptions],
  );
  const {
    sortedOptions: sortedDestOptions,
    handleSelect: recordDestWarehouseSelect,
  } = useFrequencyDropdown(
    OUTBOUND_ORDER_DESTINATION_WAREHOUSE_DROPDOWN_KEY,
    destWarehouseFrequencyOptions,
    dropdownAccountKey,
  );

  const canSubmit = useMemo(() => {
    if (warehouseId == null) {
      return false;
    }
    if (showDestination) {
      if (
        destinationWarehouseId == null ||
        destinationWarehouseId === warehouseId
      ) {
        return false;
      }
    }
    if (lines.length === 0) {
      return false;
    }
    return lines.every(l => parseQty(l.quantity) > 0);
  }, [warehouseId, showDestination, destinationWarehouseId, lines]);

  const submit = useCallback(async () => {
    if (warehouseId == null) {
      toast.error(t('warehouseOutbound.create.needWarehouse'));
      return;
    }
    if (showDestination) {
      if (
        destinationWarehouseId == null ||
        destinationWarehouseId === warehouseId
      ) {
        toast.error(t('warehouseOutbound.create.needDestination'));
        return;
      }
    }
    const items = lines.flatMap(l => {
      const quantity = parseQty(l.quantity);
      return quantity > 0 ? [{ product_id: l.productId, quantity }] : [];
    });
    if (items.length === 0) {
      toast.error(t('warehouseOutbound.create.needItems'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        warehouse_id: warehouseId,
        type: outboundType,
        items,
        note: note.trim() || null,
        ...(showDestination && destinationWarehouseId != null
          ? { destination_warehouse_id: destinationWarehouseId }
          : {}),
      };
      const created = await createOutboundOrder(payload);
      onCreated?.(created);
      onClose();
      toast.success(t('warehouseOutbound.create.successBody'));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('common.genericFailure'));
    } finally {
      setSubmitting(false);
    }
  }, [
    warehouseId,
    showDestination,
    destinationWarehouseId,
    lines,
    note,
    outboundType,
    onCreated,
    onClose,
    t,
  ]);

  const sheetMaxH = Math.min(640, Math.round(insets.top + insets.bottom + 520));

  const renderSourceWarehouseItem = useCallback(
    ({ item }: { item: WarehouseOpt }) => (
      <Pressable
        style={styles.pickerRow}
        onPress={() => {
          setWarehouseId(item.id);
          recordSourceWarehouseSelect(item.id);
          setWhPickerOpen(false);
          if (destinationWarehouseId === item.id) {
            setDestinationWarehouseId(null);
          }
        }}
      >
        <Text style={styles.pickerRowLabel}>{item.name}</Text>
        {warehouseId === item.id ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [
      warehouseId,
      destinationWarehouseId,
      recordSourceWarehouseSelect,
      styles.pickerRow,
      styles.pickerRowLabel,
      palette.teal,
    ],
  );

  const renderDestWarehouseItem = useCallback(
    ({ item }: { item: WarehouseOpt }) => (
      <Pressable
        style={styles.pickerRow}
        onPress={() => {
          setDestinationWarehouseId(item.id);
          recordDestWarehouseSelect(item.id);
          setDestPickerOpen(false);
        }}
      >
        <Text style={styles.pickerRowLabel}>{item.name}</Text>
        {destinationWarehouseId === item.id ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [
      destinationWarehouseId,
      recordDestWarehouseSelect,
      styles.pickerRow,
      styles.pickerRowLabel,
      palette.teal,
    ],
  );

  const renderProductHitItem = useCallback(
    ({ item }: { item: ShopProductRow }) => {
      const uri = item.thumbUri?.trim() ?? '';
      return (
        <Pressable
          style={({ pressed }) => [
            styles.hitRow,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => addProduct(item)}
        >
          <View
            style={[
              styles.hitThumbWrap,
              {
                borderColor: palette.border,
                backgroundColor: palette.bgInput,
              },
            ]}
          >
            {uri ? (
              <Image
                source={{ uri }}
                style={styles.hitThumbImg}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.hitThumbPh}>
                <SystemIcon
                  name="package"
                  size={18}
                  color={palette.textMuted}
                />
              </View>
            )}
          </View>
          <View style={styles.hitTextCol}>
            <Text
              style={[styles.hitTitle, { color: palette.textPrimary }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {item.sku ? (
              <Text style={[styles.hitSku, { color: palette.textMuted }]}>
                {item.sku}
              </Text>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [addProduct, styles, palette],
  );

  const productHitKeyExtractor = useCallback(
    (item: ShopProductRow) => String(item.id),
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdropPress}
          onPress={onClose}
          accessibilityLabel={t('header.close')}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardShim}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: palette.bgCard,
                borderColor: palette.border,
                paddingBottom: Math.max(insets.bottom, 12),
                maxHeight: sheetMaxH,
              },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}
            >
              <View style={styles.heroRow}>
                <View
                  style={[styles.heroIcon, { backgroundColor: palette.cyanBg }]}
                >
                  <SystemIcon name="arrowUp" size={22} color={BRAND_HEX} />
                </View>
                <View style={styles.heroText}>
                  <Text
                    style={[styles.heroTitle, { color: palette.textPrimary }]}
                  >
                    {t('warehouseOutbound.create.modalTitle')}
                  </Text>
                  <Text style={[styles.heroSub, { color: palette.textMuted }]}>
                    {t('warehouseOutbound.create.modalSubtitle')}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.sectionLab, { color: palette.textSecondary }]}
              >
                {t('warehouseOutbound.create.selectType')}
              </Text>
              <View style={styles.chipWrap}>
                {TYPE_OPTIONS.map(opt => {
                  const active = outboundType === opt.apiType;
                  const onPress = () => {
                    if (!opt.enabled) {
                      return;
                    }
                    setOutboundType(opt.apiType);
                    if (opt.apiType !== 'balance_transfer') {
                      setDestinationWarehouseId(null);
                    }
                  };
                  return (
                    <Pressable
                      key={opt.apiType}
                      onPress={onPress}
                      disabled={!opt.enabled}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          borderColor: active ? BRAND_HEX : palette.border,
                          backgroundColor: active
                            ? palette.bgRow
                            : palette.bgCard,
                          opacity: opt.enabled ? 1 : 0.45,
                        },
                        pressed && opt.enabled && styles.chipPressed,
                      ]}
                    >
                      <SystemIcon
                        name={opt.icon}
                        size={16}
                        color={active ? BRAND_HEX : palette.textMuted}
                      />
                      <Text
                        style={[
                          styles.chipTxt,
                          {
                            color: active
                              ? palette.textPrimary
                              : palette.textSecondary,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {t(opt.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.fieldRow}>
                <Pressable
                  style={[
                    styles.selectField,
                    {
                      borderColor: palette.border,
                      backgroundColor: palette.bgButton,
                    },
                  ]}
                  onPress={() => setWhPickerOpen(true)}
                >
                  <SystemIcon
                    name="business"
                    size={18}
                    color={palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.selectFieldTxt,
                      {
                        color: selectedWh
                          ? palette.textPrimary
                          : palette.textMuted,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedWh?.name ??
                      t('warehouseOutbound.create.warehouse')}
                  </Text>
                  <SystemIcon
                    name="chevronDown"
                    size={16}
                    color={palette.textMuted}
                  />
                </Pressable>
              </View>

              {showDestination ? (
                <View style={styles.fieldRow}>
                  <Pressable
                    style={[
                      styles.selectField,
                      {
                        borderColor: palette.border,
                        backgroundColor: palette.bgButton,
                      },
                    ]}
                    onPress={() => setDestPickerOpen(true)}
                  >
                    <SystemIcon
                      name="location"
                      size={18}
                      color={palette.textSecondary}
                    />
                    <Text
                      style={[
                        styles.selectFieldTxt,
                        {
                          color: selectedDest
                            ? palette.textPrimary
                            : palette.textMuted,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {selectedDest?.name ??
                        t('warehouseOutbound.create.destinationWarehouse')}
                    </Text>
                    <SystemIcon
                      name="chevronDown"
                      size={16}
                      color={palette.textMuted}
                    />
                  </Pressable>
                </View>
              ) : null}

              <TextField
                label={t('warehouseOutbound.create.note')}
                value={note}
                onChangeText={setNote}
                placeholder=""
                multiline
              />

              <Text
                style={[
                  styles.sectionLab,
                  styles.sectionLabSpaced,
                  { color: palette.textSecondary },
                ]}
              >
                {t('warehouseOutbound.create.addProduct')}
              </Text>
              <View style={[styles.searchBox, { borderColor: palette.border }]}>
                <SystemIcon name="cube" size={18} color={palette.textMuted} />
                <TextInput
                  ref={searchInputRef}
                  style={[styles.searchInput, { color: palette.textPrimary }]}
                  placeholder={t('warehouseOutbound.create.searchPlaceholder')}
                  placeholderTextColor={palette.textMuted}
                  value={productSearch}
                  onChangeText={setProductSearch}
                />
                {productLoading ? (
                  <ActivityIndicator size="small" color={palette.teal} />
                ) : null}
              </View>

              {productHits.length > 0 ? (
                <View style={[styles.hitsBox, { borderColor: palette.border }]}>
                  <FlatList
                    style={styles.hitsList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator
                    data={productHits}
                    renderItem={renderProductHitItem}
                    keyExtractor={productHitKeyExtractor}
                  />
                </View>
              ) : null}

              {lines.length === 0 ? (
                <View
                  style={[
                    styles.infoBanner,
                    {
                      backgroundColor: palette.cyanBg,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <SystemIcon name="info" size={18} color={palette.cyan} />
                  <Text
                    style={[
                      styles.infoBannerTxt,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {t('warehouseOutbound.create.emptyLines')}
                  </Text>
                </View>
              ) : (
                <View style={styles.linesBox}>
                  {lines.map(ln => (
                    <View
                      key={ln.key}
                      style={[
                        styles.lineRow,
                        {
                          borderColor: palette.border,
                          backgroundColor: palette.bgButton,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.lineThumbWrap,
                          {
                            borderColor: palette.border,
                            backgroundColor: palette.bgInput,
                          },
                        ]}
                      >
                        {ln.thumbUri?.trim() ? (
                          <Image
                            source={{ uri: ln.thumbUri.trim() }}
                            style={styles.lineThumbImg}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.lineThumbPh}>
                            <SystemIcon
                              name="package"
                              size={16}
                              color={palette.textMuted}
                            />
                          </View>
                        )}
                      </View>
                      <View style={styles.lineMain}>
                        <Text
                          style={[
                            styles.lineName,
                            { color: palette.textPrimary },
                          ]}
                          numberOfLines={2}
                        >
                          {ln.name}
                        </Text>
                        {ln.sku ? (
                          <Text
                            style={[
                              styles.lineSku,
                              { color: palette.textMuted },
                            ]}
                          >
                            {ln.sku}
                          </Text>
                        ) : null}
                      </View>
                      <TextInput
                        style={[
                          styles.qtyInput,
                          {
                            borderColor: palette.border,
                            color: palette.textPrimary,
                          },
                        ]}
                        keyboardType="decimal-pad"
                        value={ln.quantity}
                        onChangeText={q => updateQty(ln.key, q)}
                      />
                      <Pressable
                        onPress={() => removeLine(ln.key)}
                        hitSlop={8}
                        style={styles.lineRemove}
                      >
                        <SystemIcon
                          name="close"
                          size={18}
                          color={palette.red}
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: palette.border }]}>
              <Button
                title={t('warehouseOutbound.create.cancel')}
                variant="outline"
                onPress={onClose}
                disabled={submitting}
                style={styles.footerBtn}
              />
              <Button
                title={t('warehouseOutbound.create.submit')}
                variant="primary"
                onPress={() => {
                  submit().catch(() => {});
                }}
                loading={submitting}
                disabled={!canSubmit || submitting}
                style={styles.footerBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Modal
        visible={whPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWhPickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setWhPickerOpen(false)}
        >
          <View
            style={[styles.pickerSheet, { backgroundColor: palette.bgCard }]}
          >
            <Text style={[styles.pickerTitle, { color: palette.textPrimary }]}>
              {t('warehouseOutbound.create.warehouse')}
            </Text>
            <FlatList
              data={sortedSourceWarehouses}
              keyExtractor={w => String(w.id)}
              renderItem={renderSourceWarehouseItem}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={destPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDestPickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setDestPickerOpen(false)}
        >
          <View
            style={[styles.pickerSheet, { backgroundColor: palette.bgCard }]}
          >
            <Text style={[styles.pickerTitle, { color: palette.textPrimary }]}>
              {t('warehouseOutbound.create.destinationWarehouse')}
            </Text>
            <FlatList
              data={sortedDestOptions}
              keyExtractor={w => String(w.id)}
              ListEmptyComponent={
                <Text
                  style={[styles.pickerEmpty, { color: palette.textMuted }]}
                >
                  -
                </Text>
              }
              renderItem={renderDestWarehouseItem}
            />
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

function createStyles(c: AppColorPalette) {
  return StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: c.bgOverlay,
    },
    backdropPress: {
      ...StyleSheet.absoluteFillObject,
    },
    keyboardShim: {
      width: '100%',
    },
    sheet: {
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: 1,
      borderBottomWidth: 0,
    },
    sheetScroll: {
      paddingHorizontal: 16,
      paddingTop: 16,
      gap: 10,
    },
    heroRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 8,
    },
    heroIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroText: { flex: 1, minWidth: 0 },
    heroTitle: {
      fontSize: 18,
      fontWeight: '800',
      lineHeight: 24,
    },
    heroSub: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
    },
    sectionLab: {
      fontSize: 13,
      fontWeight: '700',
      marginTop: 4,
    },
    sectionLabSpaced: {
      marginTop: 8,
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      maxWidth: '48%',
    },
    chipPressed: { opacity: 0.88 },
    chipTxt: { fontSize: 12, fontWeight: '600', flex: 1 },
    fieldRow: { marginTop: 4 },
    selectField: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: RADIUS.control,
      borderWidth: 1,
    },
    selectFieldTxt: { flex: 1, fontSize: 14, fontWeight: '600' },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderRadius: RADIUS.control,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 0,
      minHeight: 22,
    },
    hitsBox: {
      maxHeight: 160,
      borderWidth: 1,
      borderRadius: RADIUS.control,
      overflow: 'hidden',
    },
    hitsList: { maxHeight: 160 },
    hitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    hitThumbWrap: {
      width: 40,
      height: 40,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      flexShrink: 0,
    },
    hitThumbImg: { width: '100%', height: '100%' },
    hitThumbPh: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    hitTextCol: { flex: 1, minWidth: 0 },
    hitTitle: { fontSize: 14, fontWeight: '600' },
    hitSku: { fontSize: 12, marginTop: 2 },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 12,
      borderRadius: RADIUS.control,
      borderWidth: 1,
    },
    infoBannerTxt: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
    linesBox: { gap: 8 },
    lineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 10,
      borderRadius: RADIUS.control,
      borderWidth: 1,
    },
    lineThumbWrap: {
      width: 40,
      height: 40,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      flexShrink: 0,
    },
    lineThumbImg: { width: '100%', height: '100%' },
    lineThumbPh: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    lineMain: { flex: 1, minWidth: 0 },
    lineName: { fontSize: 14, fontWeight: '600' },
    lineSku: { fontSize: 12, marginTop: 2 },
    qtyInput: {
      width: 56,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      textAlign: 'center',
      fontWeight: '700',
    },
    lineRemove: { padding: 4 },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: 1,
    },
    footerBtn: { flex: 1 },
    pickerBackdrop: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'center',
      padding: 24,
    },
    pickerSheet: {
      borderRadius: 14,
      maxHeight: 360,
      overflow: 'hidden',
    },
    pickerTitle: {
      fontSize: 16,
      fontWeight: '800',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    pickerRowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    pickerEmpty: {
      padding: 16,
    },
  });
}
