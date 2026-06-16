import React, { useCallback, useEffect, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import type {
  ProductApi,
  UpdateProductPayload,
} from '@services/category/productApiTypes';
import { updateProduct } from '@services/category/productAPI';
import {
  fetchCategoryProductsList,
  fetchCategoryProductStats,
} from '@services/category/categoryProductSlice';
import { NumericStepperField } from './components/NumericStepperField';
import { ProductUnitSelect } from './components/ProductUnitSelect';
import {
  PRODUCT_UNIT_OPTIONS,
  type ProductUnitValue,
} from './constants/productUnits';

export type EditProductScreenProps = {
  product: ProductApi;
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Gọi sau khi lưu API thành công (vd. để màn chi tiết tải lại). */
  onSaved?: () => void;
};

export function EditProductScreen({
  product,
  onOpenDrawer,
  onBack,
  onSaved,
}: EditProductScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_EditProductScreen_styles);
  function parseUnit(raw: string): ProductUnitValue {
    const allowed = PRODUCT_UNIT_OPTIONS.map(o => o.value);
    return allowed.includes(raw as ProductUnitValue)
      ? (raw as ProductUnitValue)
      : 'piece';
  }

  function parseIntish(s: string | null | undefined): number {
    const n = Number.parseFloat(String(s ?? '0').replace(',', '.'));
    if (!Number.isFinite(n)) {
      return 0;
    }
    return Math.round(n);
  }

  function parsePrice(s: string | null | undefined): number {
    const n = Number.parseFloat(String(s ?? '0').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);

  const [sku, setSku] = useState(product.sku);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(() => parsePrice(product.price));
  const [unit, setUnit] = useState<ProductUnitValue>(() =>
    parseUnit(product.unit),
  );
  const [minStock, setMinStock] = useState(() =>
    product.min_stock != null && String(product.min_stock).trim() !== ''
      ? parseIntish(product.min_stock)
      : 0,
  );
  const [description, setDescription] = useState(product.description ?? '');
  const [weight, setWeight] = useState(() => parseIntish(product.weight));
  const [length, setLength] = useState(() => parseIntish(product.length));
  const [width, setWidth] = useState(() => parseIntish(product.width));
  const [height, setHeight] = useState(() => parseIntish(product.height));
  const [isActive, setIsActive] = useState(product.is_active);

  useEffect(() => {
    setSku(product.sku);
    setName(product.name);
    setPrice(parsePrice(product.price));
    setUnit(parseUnit(product.unit));
    setMinStock(
      product.min_stock != null && String(product.min_stock).trim() !== ''
        ? parseIntish(product.min_stock)
        : 0,
    );
    setDescription(product.description ?? '');
    setWeight(parseIntish(product.weight));
    setLength(parseIntish(product.length));
    setWidth(parseIntish(product.width));
    setHeight(parseIntish(product.height));
    setIsActive(product.is_active);
  }, [product]);

  const handleSubmit = useCallback(async () => {
    if (!sku.trim() || !name.trim()) {
      toast.warning('Vui lòng nhập Mã SKU và Tên sản phẩm.');
      return;
    }

    const payload: UpdateProductPayload = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim(),
      unit,
      price,
      weight,
      length,
      width,
      height,
      min_stock: minStock > 0 ? minStock : null,
      is_active: isActive,
    };

    setSubmitting(true);
    try {
      await updateProduct(product.id, payload);
      void dispatch(fetchCategoryProductsList({}));
      void dispatch(fetchCategoryProductStats());
      toast.success('Sản phẩm đã được cập nhật.');
      onSaved?.();
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [
    product.id,
    sku,
    name,
    price,
    unit,
    minStock,
    description,
    weight,
    length,
    width,
    height,
    isActive,
    dispatch,
    onBack,
    onSaved,
  ]);

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[ canvasListScrollContent(),
          { paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Sửa sản phẩm</Text>

        <Text style={styles.sectionTitle}>{'Thông tin cơ bản'}</Text>
        <View style={styles.dimRow}>
          <View style={styles.dimHalf}>
            <TextField
              label="Mã SKU"
              variant="dark"
              value={sku}
              onChangeText={setSku}
              placeholder="VD: 4513574014152"
              autoCapitalize="none"
            />
            <Text style={styles.fieldHint}>{'Mã sản phẩm duy nhất'}</Text>
          </View>
          <View style={styles.dimHalf}>
            <TextField
              label="Tên sản phẩm"
              variant="dark"
              value={name}
              onChangeText={setName}
              placeholder="Tên hiển thị"
            />
          </View>
        </View>

        <TextField
          label="Mô tả"
          variant="dark"
          value={description}
          onChangeText={setDescription}
          placeholder="Tùy chọn"
          multiline
        />

        <View style={styles.threeColRow}>
          <View style={styles.colThird}>
            <ProductUnitSelect
              label="Đơn vị"
              hint="Đơn vị tính được sử dụng cho tồn kho, đơn hàng và billing"
              value={unit}
              onChange={setUnit}
            />
          </View>
          <View style={styles.colThird}>
            <NumericStepperField
              label="Giá cơ bản"
              required
              hint="Giá cơ bản để tính toán"
              value={price}
              onChange={setPrice}
              min={0}
              step={1}
            />
          </View>
          <View style={styles.colThird}>
            <NumericStepperField
              label="Tồn tối thiểu"
              hint="Cảnh báo khi tồn kho dưới mức này"
              value={minStock}
              onChange={setMinStock}
              min={0}
              step={1}
            />
          </View>
        </View>

        <View style={styles.sectionSpacer} />
        <Text style={styles.sectionTitle}>{'Kích thước và trọng lượng'}</Text>

        <View style={styles.dimRow}>
          <View style={styles.dimHalf}>
            <NumericStepperField
              label="Trọng lượng"
              unitSuffix="(g)"
              value={weight}
              onChange={setWeight}
              min={0}
              step={1}
            />
          </View>
          <View style={styles.dimHalf}>
            <NumericStepperField
              label="Chiều dài"
              unitSuffix="(cm)"
              value={length}
              onChange={setLength}
              min={0}
              step={1}
            />
          </View>
        </View>
        <View style={styles.dimRow}>
          <View style={styles.dimHalf}>
            <NumericStepperField
              label="Chiều rộng"
              unitSuffix="(cm)"
              value={width}
              onChange={setWidth}
              min={0}
              step={1}
            />
          </View>
          <View style={styles.dimHalf}>
            <NumericStepperField
              label="Chiều cao"
              unitSuffix="(cm)"
              value={height}
              onChange={setHeight}
              min={0}
              step={1}
            />
          </View>
        </View>

        <View style={styles.sectionSpacer} />
        <Text style={styles.sectionTitle}>{'Trạng thái'}</Text>

        <View style={styles.switchRow}>
          <View style={styles.switchLabels}>
            <Text style={styles.switchTitle}>Đang hoạt động</Text>
            <Text style={styles.switchHint}>Hiển thị và bán sản phẩm này</Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: palette.border, true: palette.teal }}
            thumbColor={palette.textPrimary}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Button
              title="Hủy"
              variant="outline"
              disabled={submitting}
              onPress={onBack}
              style={styles.footerHalf}
            />
            <Button
              title="Lưu"
              variant="primary"
              loading={submitting}
              onPress={() => void handleSubmit()}
              style={styles.footerHalf}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function create_EditProductScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    backArrow: {
      fontSize: 20,
      color: c.cyan,
      fontWeight: '700',
    },
    backTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textSecondary,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 12,
      marginTop: 4,
    },
    sectionSpacer: {
      height: 8,
    },
    fieldHint: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 4,
      marginBottom: 10,
      lineHeight: 15,
    },
    dimRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    dimHalf: {
      flex: 1,
      minWidth: 148,
    },
    threeColRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 4,
    },
    colThird: {
      flex: 1,
      minWidth: 140,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      marginBottom: 20,
      paddingVertical: 12,
      paddingHorizontal: 4,
    },
    switchLabels: {
      flex: 1,
      marginRight: 12,
    },
    switchTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },
    switchHint: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 4,
    },
    footer: {
      marginTop: 8,
    },
    footerRow: {
      flexDirection: 'row',
      gap: 12,
    },
    footerHalf: {
      flex: 1,
    },
  });
}
