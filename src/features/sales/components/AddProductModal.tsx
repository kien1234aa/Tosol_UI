import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import type { SystemIconName } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { TextField } from '@shared/components/ui/TextField';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import type { ShopProductRow } from '@services/sales/saleProductApiTypes';
import {
  clearProductSuggestions,
  fetchProductSuggestionsThunk,
} from '@services/sales/saleProductSlice';
import { SALES_ORDER_PRODUCT_DROPDOWN_KEY } from '../../dropdownFrequency/dropdownFrequencyKeys';
import { recordRecentSelection, type DropdownRecentSelection } from '@services/system/dropdownFrequencySlice';
import { useFrequencyDropdown } from '../../dropdownFrequency/useFrequencyDropdown';

export type { ShopProductRow } from '@services/sales/saleProductApiTypes';

export type AddProductLinePayload = {
  productId: number;
  productName: string;
  thumbnailUrl?: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
};

export type AddProductModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Cửa hàng đang chọn — gửi kèm request gợi ý (nếu backend hỗ trợ). */
  shopId: number | null;
  onSubmit: (line: AddProductLinePayload) => void;
};

const REQ = 'Trường này là bắt buộc';
const EMPTY_RECENT_PRODUCT_SELECTIONS: DropdownRecentSelection[] = [];

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Nút ▲/▼ dọc bên phải ô số (giống spin control). */
function VerticalSpinButtons({
  onUp,
  onDown,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
}) {
  const palette = useAppColors();
  const bx = useThemeStyleSheet(createAddProductBxStyles);
  return (
    <View style={bx.spinCol} accessibilityRole="adjustable">
      <Pressable
        onPress={onUp}
        disabled={disableUp}
        style={({ pressed }) => [
          bx.spinCell,
          pressed && !disableUp ? bx.spinCellPressed : null,
          disableUp ? bx.spinCellDisabled : null,
        ]}
        accessibilityLabel="Tăng"
        hitSlop={6}
      >
        <SystemIcon
          name="chevronUp"
          size={12}
          color={disableUp ? palette.textMuted : palette.textSecondary}
        />
      </Pressable>
      <View style={bx.spinDivider} />
      <Pressable
        onPress={onDown}
        disabled={disableDown}
        style={({ pressed }) => [
          bx.spinCell,
          pressed && !disableDown ? bx.spinCellPressed : null,
          disableDown ? bx.spinCellDisabled : null,
        ]}
        accessibilityLabel="Giảm"
        hitSlop={6}
      >
        <SystemIcon
          name="chevronDown"
          size={12}
          color={disableDown ? palette.textMuted : palette.textSecondary}
        />
      </Pressable>
    </View>
  );
}

function StepperBox({
  label,
  icon,
  value,
  onChange,
  min,
  max,
  step,
  format,
  suffix,
  errorOutline,
}: {
  label: string;
  icon: SystemIconName | '%';
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  suffix?: string;
  errorOutline?: boolean;
}) {
  const palette = useAppColors();
  const bx = useThemeStyleSheet(createAddProductBxStyles);
  const down = useCallback(() => {
    onChange(clamp(value - step, min, max));
  }, [value, step, min, max, onChange]);
  const up = useCallback(() => {
    onChange(clamp(value + step, min, max));
  }, [value, step, min, max, onChange]);

  return (
    <View style={bx.wrap}>
      <View style={[bx.outline, errorOutline ? bx.outlineErr : null]}>
        <View style={[bx.labCut, { backgroundColor: palette.bgCard }]}>
          <Text style={bx.labTxt}>{label}</Text>
        </View>
        <View style={bx.row}>
          {icon === '%' ? (
            <Text style={bx.ico}>%</Text>
          ) : (
            <View style={bx.icoSlot}>
              <SystemIcon name={icon} size={16} color={palette.textSecondary} />
            </View>
          )}
          <Text
            style={bx.val}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {format(value)}
            {suffix ?? ''}
          </Text>
          <VerticalSpinButtons
            onUp={up}
            onDown={down}
            disableUp={value >= max}
            disableDown={value <= min}
          />
        </View>
      </View>
    </View>
  );
}

function PriceStepBox({
  label,
  value,
  onChangeValue,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChangeValue: (n: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const palette = useAppColors();
  const bx = useThemeStyleSheet(createAddProductBxStyles);
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const applyNum = useCallback(
    (raw: string) => {
      const n = Math.floor(Number(String(raw).replace(/\D/g, '')) || 0);
      onChangeValue(clamp(n, min, max));
    },
    [min, max, onChangeValue],
  );

  const down = useCallback(() => {
    onChangeValue(clamp(value - step, min, max));
  }, [value, step, min, max, onChangeValue]);
  const up = useCallback(() => {
    onChangeValue(clamp(value + step, min, max));
  }, [value, step, min, max, onChangeValue]);

  return (
    <View style={bx.wrap}>
      <View style={bx.outline}>
        <View style={[bx.labCut, { backgroundColor: palette.bgCard }]}>
          <Text style={bx.labTxt}>{label}</Text>
        </View>
        <View style={bx.row}>
          <Text style={bx.ico}>$</Text>
          <TextInput
            style={bx.inputPrice}
            value={text}
            onChangeText={t => {
              setText(t);
              applyNum(t);
            }}
            onBlur={() => setText(String(value))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={palette.textMuted}
          />
          <VerticalSpinButtons
            onUp={up}
            onDown={down}
            disableUp={value >= max}
            disableDown={value <= min}
          />
        </View>
      </View>
    </View>
  );
}

function createAddProductBxStyles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: { width: '100%', alignSelf: 'stretch' },
    outline: {
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.borderMid,
      backgroundColor: c.bgInput,
      paddingHorizontal: 10,
      paddingTop: 12,
      paddingBottom: 8,
      minHeight: 56,
    },
    labCut: {
      position: 'absolute',
      left: 10,
      top: -10,
      paddingHorizontal: 5,
      zIndex: 2,
    },
    labTxt: { fontSize: 12, fontWeight: '800', color: c.tealLight },
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 6,
      minHeight: 40,
    },
    ico: {
      fontSize: 15,
      color: c.textSecondary,
      width: 22,
      textAlign: 'center',
      alignSelf: 'center',
    },
    icoSlot: {
      width: 22,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    val: {
      flex: 1,
      minWidth: 72,
      textAlign: 'right',
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
      alignSelf: 'center',
      paddingRight: 4,
    },
    inputPrice: {
      flex: 1,
      minWidth: 96,
      textAlign: 'right',
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
      paddingVertical: 6,
      paddingRight: 4,
    },
    spinCol: {
      width: 32,
      minHeight: 38,
      alignSelf: 'stretch',
      borderRadius: 8,
      backgroundColor: c.bgModal,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.borderLight,
    },
    spinCell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 18,
    },
    spinCellPressed: { backgroundColor: 'rgba(61,200,200,0.12)' },
    spinCellDisabled: { opacity: 0.38 },
    spinDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
    },
    outlineErr: {
      borderColor: c.red,
    },
  });
}

function formatStockQty(n: number): string {
  return n.toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** >100 xanh, 10–100 vàng, 0<…<10 cam, hết (≤0) đỏ. */
type StockBand = 'green' | 'yellow' | 'orange' | 'red';

const STOCK_BAND_ACCENT: Record<StockBand, string> = {
  green: 'rgba(167,243,208,0.95)',
  yellow: 'rgba(253,224,71,0.9)',
  orange: 'rgba(254,215,170,0.95)',
  red: 'rgba(254,202,202,0.95)',
};

function stockBandFromAvailable(n: number): StockBand {
  if (n > 100) {
    return 'green';
  }
  if (n >= 10) {
    return 'yellow';
  }
  if (n > 0) {
    return 'orange';
  }
  return 'red';
}

function isShopProductRow(value: unknown): value is ShopProductRow {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const row = value as Partial<ShopProductRow>;
  return (
    typeof row.id === 'number' &&
    typeof row.name === 'string' &&
    typeof row.price === 'number'
  );
}

function productMatchesQuery(row: ShopProductRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return [row.name, row.sku]
    .filter(Boolean)
    .some(part => String(part).toLowerCase().includes(q));
}

export function AddProductModal({
  visible,
  onClose,
  shopId,
  onSubmit,
}: AddProductModalProps) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const st = useThemeStyleSheet(createAddProductModalStyles);
  const { width: winW, height: winH } = useWindowDimensions();
  /** Màn hẹp / điện thoại dọc: xếp ô số dọc, tránh hai cột quá chật. */
  const isCompact = winW < 440;
  const sheet = useMemo(() => {
    const SHEET_WIDTH = Math.min(winW - 16, 560);
    const SHEET_MAX_H = Math.min(winH * 0.92, 720);
    const SHEET_MIN_PICKER = Math.min(winH * 0.5, 420);
    const chrome = 188;
    const formScrollMaxH = Math.max(
      140,
      Math.min(winH * 0.56, SHEET_MAX_H - chrome),
    );
    return {
      SHEET_WIDTH,
      SHEET_MAX_H,
      SHEET_MIN_PICKER,
      formScrollMaxH,
      winH,
    };
  }, [winW, winH]);
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const suggestions = useAppSelector(s => s.product.suggestions);
  const suggLoading = useAppSelector(s => s.product.suggestionsLoading);
  const suggError = useAppSelector(s => s.product.suggestionsError);
  const dropdownAccountKey = useMemo(
    () => user?.uuid ?? user?.email ?? null,
    [user?.email, user?.uuid],
  );
  const productDropdownKey = `${SALES_ORDER_PRODUCT_DROPDOWN_KEY}.shop.${shopId ?? 'none'}`;
  const recentProductSelections = useAppSelector(state => {
    const accountKey = dropdownAccountKey?.toString().trim();
    return accountKey && accountKey.length > 0
      ? state.dropdownFrequency.recentSelectionsByAccount?.[accountKey]?.[
          productDropdownKey
        ] ?? EMPTY_RECENT_PRODUCT_SELECTIONS
      : state.dropdownFrequency.recentSelectionsByDropdown?.[
          productDropdownKey
        ] ?? EMPTY_RECENT_PRODUCT_SELECTIONS;
  });
  const recentProducts = useMemo(
    () =>
      recentProductSelections.flatMap(item =>
        isShopProductRow(item.data) ? [item.data] : [],
      ),
    [recentProductSelections],
  );
  const suggestionFrequencyOptions = useMemo(
    () => suggestions.map(item => ({ ...item, value: item.id })),
    [suggestions],
  );
  const {
    sortedOptions: sortedSuggestions,
    handleSelect: recordProductSelect,
  } = useFrequencyDropdown(
    productDropdownKey,
    suggestionFrequencyOptions,
    dropdownAccountKey,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ShopProductRow | null>(
    null,
  );
  const [productErr, setProductErr] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const displaySuggestions = useMemo(() => {
    const seen = new Set<number>();
    const matchingRecent =
      shopId == null
        ? []
        : recentProducts.filter(product =>
            productMatchesQuery(product, searchQuery),
          );
    return [...matchingRecent, ...sortedSuggestions].filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }, [recentProducts, searchQuery, shopId, sortedSuggestions]);

  useEffect(() => {
    if (!visible) {
      dispatch(clearProductSuggestions());
      return;
    }
    dispatch(clearProductSuggestions());
    setPickerOpen(false);
    setSearchQuery('');
    setSelectedProduct(null);
    setProductErr(undefined);
    setQty(1);
    setUnitPrice(0);
    setDiscount(0);
    setTax(0);
  }, [visible, dispatch]);

  useEffect(() => {
    if (!pickerOpen || shopId == null) {
      return;
    }
    const q = searchQuery.trim();
    const delay = q ? 320 : 0;
    const t = setTimeout(() => {
      void dispatch(fetchProductSuggestionsThunk({ shopId, search: q }));
    }, delay);
    return () => clearTimeout(t);
  }, [pickerOpen, shopId, searchQuery, dispatch]);

  useEffect(() => {
    if (selectedProduct) {
      setUnitPrice(selectedProduct.price);
    }
  }, [selectedProduct]);

  const handleProductSelect = useCallback(
    (item: ShopProductRow) => {
      setSelectedProduct(item);
      setUnitPrice(item.price);
      setProductErr(undefined);
      recordProductSelect(item.id);
      dispatch(
        recordRecentSelection(
          productDropdownKey,
          {
            value: item.id,
            label: item.name,
            subtitle: item.sku
              ? `${item.sku} · ${item.price.toLocaleString('vi-VN')}\u0111`
              : `${item.price.toLocaleString('vi-VN')}\u0111`,
            data: item,
          },
          dropdownAccountKey,
        ),
      );
      setPickerOpen(false);
    },
    [dispatch, dropdownAccountKey, productDropdownKey, recordProductSelect],
  );

  const handleAdd = useCallback(() => {
    if (selectedProduct == null) {
      setProductErr(REQ);
      return;
    }
    const cap =
      selectedProduct.availableStock != null &&
      Number.isFinite(selectedProduct.availableStock)
        ? Number(selectedProduct.availableStock)
        : null;
    if (cap != null && qty > cap + 1e-9) {
      return;
    }
    setProductErr(undefined);
    onSubmit({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      thumbnailUrl: selectedProduct.thumbUri ?? null,
      quantity: qty,
      unitPrice,
      discountPercent: discount,
      taxPercent: tax,
    });
    onClose();
  }, [selectedProduct, qty, unitPrice, discount, tax, onClose, onSubmit]);

  const displayProduct = selectedProduct?.name ?? 'Chọn sản phẩm';

  const stockNum =
    selectedProduct != null &&
    selectedProduct.availableStock != null &&
    Number.isFinite(selectedProduct.availableStock)
      ? Number(selectedProduct.availableStock)
      : NaN;
  const hasStockInfo = Number.isFinite(stockNum);
  const remaining = hasStockInfo ? stockNum - qty : NaN;
  const qtyExceedsStock = hasStockInfo && qty > stockNum + 1e-9;
  const flooredStock = hasStockInfo ? Math.floor(stockNum + 1e-9) : 0;
  const qtyMaxForStepper = hasStockInfo
    ? flooredStock >= 1
      ? flooredStock
      : 999_999
    : 999_999;

  const stockBand: StockBand | null = hasStockInfo
    ? stockBandFromAvailable(stockNum)
    : null;

  const renderProductItem = useCallback(
    ({ item }: { item: ShopProductRow }) => {
      const uri = item.thumbUri?.trim() ?? '';
      return (
        <Pressable
          style={st.pickerRow}
          onPress={() => handleProductSelect(item)}
        >
          <View style={st.pickerThumbWrap}>
            {uri ? (
              <Image
                source={{ uri }}
                style={st.pickerThumbImg}
                resizeMode="cover"
              />
            ) : (
              <View style={st.pickerThumbPh}>
                <SystemIcon name="package" size={22} color={palette.textMuted} />
              </View>
            )}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={st.pickerName}>{item.name}</Text>
            <Text style={st.pickerSub} numberOfLines={1}>
              {item.sku ? `${item.sku} · ` : ''}
              {`${item.price.toLocaleString('vi-VN')}\u0111`}
              {item.availableStock != null
                ? ` · Tồn: ${item.availableStock}`
                : ''}
            </Text>
          </View>
          {selectedProduct?.id === item.id ? (
            <View style={st.checkSlot}>
              <SystemIcon name="check" size={18} color={palette.teal} />
            </View>
          ) : null}
        </Pressable>
      );
    },
    [
      handleProductSelect,
      selectedProduct?.id,
      st.pickerRow,
      st.pickerThumbWrap,
      st.pickerThumbImg,
      st.pickerThumbPh,
      st.pickerName,
      st.pickerSub,
      st.checkSlot,
      palette.textMuted,
      palette.teal,
    ],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={st.backdrop}>
        <Pressable
          style={st.backdropFill}
          onPress={pickerOpen ? () => setPickerOpen(false) : onClose}
          accessibilityLabel={pickerOpen ? 'Đóng tìm kiếm' : 'Đóng'}
        />
        <KeyboardAvoidingView behavior="padding" style={st.kav}>
          <View
            style={[
              st.sheet,
              {
                width: sheet.SHEET_WIDTH,
                maxHeight: sheet.SHEET_MAX_H,
                minHeight: pickerOpen
                  ? Math.min(sheet.winH * 0.88, Math.max(sheet.SHEET_MIN_PICKER, 300))
                  : undefined,
                paddingBottom: insets.bottom + (pickerOpen ? 12 : 8),
              },
            ]}
          >
            {pickerOpen ? (
              <View style={st.pickerWrap}>
                <View style={st.pickerHeader}>
                  <Pressable
                    onPress={() => setPickerOpen(false)}
                    hitSlop={10}
                    style={st.backPick}
                    accessibilityLabel="Đóng tìm kiếm"
                  >
                    <SystemIcon
                      name="close"
                      size={22}
                      color={palette.textSecondary}
                    />
                  </Pressable>
                  <Text style={st.pickerTitleInline}>Tìm sản phẩm</Text>
                  <View style={{ width: 44 }} />
                </View>
                <TextField
                  ref={searchInputRef}
                  variant="dark"
                  size="md"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Tìm theo tên, SKU…"
                  autoCapitalize="none"
                  autoCorrect={false}
                  showSoftInputOnFocus
                  containerStyle={st.pickerSearchField}
                  inputStyle={st.pickerSearchInput}
                  startIcon={
                    <SystemIcon
                      name="search"
                      size={18}
                      color={palette.textMuted}
                    />
                  }
                  onFocus={() => {
                    if (Platform.OS === 'android') {
                      requestAnimationFrame(() => {
                        searchInputRef.current?.focus();
                      });
                    }
                  }}
                />
                {suggError ? <Text style={st.suggErr}>{suggError}</Text> : null}
                {suggLoading && displaySuggestions.length === 0 ? (
                  <View style={st.suggLoading}>
                    <ActivityIndicator color={palette.tealLight} />
                    <Text style={st.suggLoadingTxt}>Đang tải…</Text>
                  </View>
                ) : null}
                <FlatList
                  data={displaySuggestions}
                  keyExtractor={item => String(item.id)}
                  style={st.pickerList}
                  contentContainerStyle={st.pickerListContent}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    suggLoading ? null : (
                      <Text style={st.emptyPicker}>
                        {shopId == null
                          ? 'Chọn cửa hàng trước.'
                          : 'Không có sản phẩm phù hợp.'}
                      </Text>
                    )
                  }
                  renderItem={renderProductItem}
                />
              </View>
            ) : (
              <>
                <View style={st.header}>
                  <View style={st.headerLeft}>
                    <View style={st.hdrIcoSlot}>
                      <SystemIcon
                        name="package"
                        size={22}
                        color={palette.textSecondary}
                      />
                    </View>
                    <Text style={st.title} numberOfLines={1}>
                      Thêm sản phẩm
                    </Text>
                  </View>
                  <Pressable
                    onPress={onClose}
                    hitSlop={12}
                    accessibilityLabel="Đóng"
                  >
                    <SystemIcon
                      name="close"
                      size={22}
                      color={palette.textMuted}
                    />
                  </Pressable>
                </View>

                <ScrollView
                  style={[st.formScroll, { maxHeight: sheet.formScrollMaxH }]}
                  contentContainerStyle={st.formScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  <View style={st.form}>
                    <Pressable
                      onPress={() => {
                        setSearchQuery('');
                        setPickerOpen(true);
                      }}
                      style={[
                        st.prodOutline,
                        productErr ? st.prodOutlineErr : null,
                      ]}
                    >
                      <View
                        style={[st.labCut, { backgroundColor: palette.bgCard }]}
                      >
                        <Text style={st.labTxt}>Chọn sản phẩm *</Text>
                      </View>
                      <View style={st.prodRow}>
                        <View style={st.prodIcoSlot}>
                          <SystemIcon
                            name="package"
                            size={18}
                            color={palette.textSecondary}
                          />
                        </View>
                        <Text
                          style={[st.prodTxt, !selectedProduct && st.prodPh]}
                          numberOfLines={1}
                        >
                          {displayProduct}
                        </Text>
                        <View style={st.chevSlot}>
                          <SystemIcon
                            name="chevronDown"
                            size={16}
                            color={palette.textMuted}
                          />
                        </View>
                      </View>
                    </Pressable>
                    {productErr ? (
                      <Text style={st.fieldErr}>{productErr}</Text>
                    ) : null}

                    {selectedProduct != null &&
                    hasStockInfo &&
                    stockBand != null ? (
                      <View style={[st.sbRow, st[`sbBox_${stockBand}`]]}>
                        <View style={st.stockBarLeft}>
                          <View style={st.stockInfoIcoSlot}>
                            <SystemIcon
                              name="info"
                              size={14}
                              color={STOCK_BAND_ACCENT[stockBand]}
                            />
                          </View>
                          <Text
                            style={[st.stockBarTxt, st[`sbTxt_${stockBand}`]]}
                          >
                            Tồn khả dụng:{' '}
                            <Text
                              style={[st.stockBarEm, st[`sbEm_${stockBand}`]]}
                            >
                              {formatStockQty(stockNum)}
                            </Text>
                          </Text>
                        </View>
                        <View style={st.stockBarRight}>
                          <View style={st.stockChevSlot}>
                            <SystemIcon
                              name="chevronForward"
                              size={14}
                              color={STOCK_BAND_ACCENT[stockBand]}
                            />
                          </View>
                          <Text
                            style={[st.stockBarTxt, st[`sbTxt_${stockBand}`]]}
                          >
                            Còn lại:{' '}
                            <Text
                              style={[
                                st.stockBarEm,
                                st[`sbEm_${stockBand}`],
                                Number.isFinite(remaining) && remaining < 0
                                  ? st.stockRemainNeg
                                  : null,
                              ]}
                            >
                              {Number.isFinite(remaining)
                                ? formatStockQty(remaining)
                                : '—'}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    ) : selectedProduct != null ? (
                      <View style={st.stockBarMuted}>
                        <Text style={st.stockBarMutedTxt}>
                          Chưa có dữ liệu tồn kho từ server cho sản phẩm này.
                        </Text>
                      </View>
                    ) : null}

                    <Text style={st.sectionLab}>Số lượng & đơn giá</Text>
                    <View
                      style={[st.gridRow, isCompact ? st.gridRowStack : null]}
                    >
                      <View
                        style={[
                          st.gridCell,
                          isCompact ? st.gridCellFull : null,
                        ]}
                      >
                        <StepperBox
                          label="Số lượng"
                          icon="grid"
                          value={qty}
                          onChange={setQty}
                          min={1}
                          max={qtyMaxForStepper}
                          step={1}
                          format={n => String(n)}
                          errorOutline={qtyExceedsStock}
                        />
                        {qtyExceedsStock ? (
                          <Text style={st.qtyFieldErr}>
                            Số lượng vượt tồn kho khả dụng (
                            {formatStockQty(stockNum)})
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          st.gridCell,
                          isCompact ? st.gridCellFull : null,
                        ]}
                      >
                        <PriceStepBox
                          key={
                            selectedProduct
                              ? `price-${selectedProduct.id}`
                              : 'price-none'
                          }
                          label="Đơn giá"
                          value={unitPrice}
                          onChangeValue={setUnitPrice}
                          min={0}
                          max={9_999_999_999}
                          step={1000}
                        />
                      </View>
                    </View>
                    <Text style={st.sectionLab}>Giảm giá & thuế</Text>
                    <View
                      style={[st.gridRow, isCompact ? st.gridRowStack : null]}
                    >
                      <View
                        style={[
                          st.gridCell,
                          isCompact ? st.gridCellFull : null,
                        ]}
                      >
                        <StepperBox
                          label="Giảm giá (%)"
                          icon="%"
                          value={discount}
                          onChange={setDiscount}
                          min={0}
                          max={100}
                          step={1}
                          format={n => String(n)}
                          suffix="%"
                        />
                      </View>
                      <View
                        style={[
                          st.gridCell,
                          isCompact ? st.gridCellFull : null,
                        ]}
                      >
                        <StepperBox
                          label="Thuế suất (%)"
                          icon="document"
                          value={tax}
                          onChange={setTax}
                          min={0}
                          max={100}
                          step={1}
                          format={n => String(n)}
                          suffix="%"
                        />
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <View style={st.footer}>
                  <Pressable onPress={onClose} style={st.cancelTxtWrap}>
                    <Text style={st.cancelTxt}>Huỷ</Text>
                  </Pressable>
                  <Button
                    title="Thêm"
                    variant="primary"
                    size="lg"
                    onPress={handleAdd}
                    disabled={selectedProduct == null || qtyExceedsStock}
                    style={
                      selectedProduct == null || qtyExceedsStock
                        ? st.addDis
                        : undefined
                    }
                  />
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function createAddProductModalStyles(c: AppColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    backdropFill: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.bgOverlay,
      zIndex: 0,
    },
    kav: { width: '100%', alignItems: 'center' },
    sheet: {
      backgroundColor: c.bgCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.borderMid,
      overflow: 'hidden',
      flexDirection: 'column',
      zIndex: 2,
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    },
    formScroll: {
      width: '100%',
      flexShrink: 1,
    },
    formScrollContent: {
      flexGrow: 1,
    },
    pickerWrap: {
      flex: 1,
      width: '100%',
      minHeight: 320,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 10,
    },
    hdrIcoSlot: { width: 34, alignItems: 'center', justifyContent: 'center' },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
    },
    form: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8 },
    prodOutline: {
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.bgInput,
      paddingHorizontal: 12,
      paddingTop: 14,
      paddingBottom: 10,
      minHeight: 52,
    },
    prodOutlineErr: { borderColor: c.red },
    labCut: {
      position: 'absolute',
      left: 10,
      top: -9,
      paddingHorizontal: 6,
      zIndex: 2,
    },
    labTxt: { fontSize: 13, fontWeight: '800', color: c.tealLight },
    prodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    prodIcoSlot: { width: 22, alignItems: 'center', justifyContent: 'center' },
    prodTxt: { flex: 1, fontSize: 17, fontWeight: '700', color: c.textPrimary },
    prodPh: { color: c.textMuted, fontWeight: '600' },
    chevSlot: { justifyContent: 'center' },
    fieldErr: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '600',
      color: c.red,
    },
    sbRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    sbBox_green: {
      backgroundColor: 'rgba(16,185,129,0.22)',
      borderColor: 'rgba(52,211,153,0.55)',
    },
    sbBox_yellow: {
      backgroundColor: 'rgba(234,179,8,0.22)',
      borderColor: 'rgba(250,204,21,0.5)',
    },
    sbBox_orange: {
      backgroundColor: 'rgba(245,158,11,0.22)',
      borderColor: 'rgba(251,191,36,0.5)',
    },
    sbBox_red: {
      backgroundColor: 'rgba(127,29,29,0.38)',
      borderColor: 'rgba(248,113,113,0.48)',
    },
    sbTxt_green: { color: 'rgba(209,250,229,0.95)' },
    sbTxt_yellow: { color: 'rgba(254,249,195,0.96)' },
    sbTxt_orange: { color: 'rgba(255,237,213,0.96)' },
    sbTxt_red: { color: 'rgba(254,226,226,0.92)' },
    sbEm_green: { color: '#ecfdf5' },
    sbEm_yellow: { color: '#fffbeb' },
    sbEm_orange: { color: '#fff7ed' },
    sbEm_red: { color: '#ffffff' },
    sbIco_green: { color: 'rgba(167,243,208,0.95)' },
    sbIco_yellow: { color: 'rgba(253,224,71,0.9)' },
    sbIco_orange: { color: 'rgba(254,215,170,0.95)' },
    sbIco_red: { color: 'rgba(254,202,202,0.95)' },
    stockBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 0,
    },
    stockBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
    },
    stockInfoIcoSlot: { justifyContent: 'center' },
    stockChevSlot: { justifyContent: 'center' },
    stockBarTxt: {
      fontSize: 13,
      fontWeight: '600',
      flexShrink: 1,
    },
    stockBarEm: {
      fontWeight: '800',
    },
    stockRemainNeg: {
      color: '#fecaca',
    },
    stockBarMuted: {
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(148,163,184,0.12)',
      borderWidth: 1,
      borderColor: c.border,
    },
    stockBarMutedTxt: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 17,
    },
    sectionLab: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textMuted,
      letterSpacing: 0.5,
      marginTop: 14,
      marginBottom: 2,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
      alignItems: 'flex-start',
    },
    gridRowStack: {
      flexDirection: 'column',
      gap: 10,
    },
    gridCell: {
      flex: 1,
      minWidth: 0,
    },
    gridCellFull: {
      flex: 0,
      alignSelf: 'stretch',
      width: '100%',
    },
    qtyFieldErr: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: '600',
      color: c.red,
      lineHeight: 17,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    cancelTxtWrap: { paddingVertical: 12, paddingHorizontal: 6 },
    cancelTxt: { fontSize: 16, fontWeight: '700', color: c.textSecondary },
    addDis: { opacity: 0.45 },
    pickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    backPick: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerTitleInline: {
      flex: 1,
      textAlign: 'center',
      fontSize: 19,
      fontWeight: '800',
      color: c.textPrimary,
    },
    pickerSearchField: {
      marginHorizontal: 16,
      marginBottom: 10,
      marginTop: 0,
    },
    pickerSearchInput: {
      fontSize: 15,
      fontWeight: '600',
    },
    suggErr: {
      marginHorizontal: 16,
      marginBottom: 8,
      fontSize: 13,
      color: c.red,
      fontWeight: '600',
    },
    suggLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
    },
    suggLoadingTxt: { fontSize: 14, color: c.textSecondary, fontWeight: '600' },
    pickerList: { flex: 1, minHeight: 280 },
    pickerListContent: { paddingBottom: 12 },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    pickerThumbWrap: {
      width: 48,
      height: 48,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: c.bgInput,
      borderWidth: 1,
      borderColor: c.border,
      flexShrink: 0,
    },
    pickerThumbImg: { width: '100%', height: '100%' },
    pickerThumbPh: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickerName: { fontSize: 17, fontWeight: '700', color: c.textPrimary },
    pickerSub: { fontSize: 13, color: c.textMuted, marginTop: 4 },
    checkSlot: { width: 28, alignItems: 'center', justifyContent: 'center' },
    emptyPicker: {
      textAlign: 'center',
      color: c.textSecondary,
      paddingVertical: 24,
      fontSize: 14,
    },
  });
}
