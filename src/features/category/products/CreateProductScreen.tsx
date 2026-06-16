import React, { useCallback, useState } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  Image,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { DetailCard } from '../../sales/screens/orderDetail/OrderDetailPrimitives';
import {
  createProduct,
  createProductWithPickedImage,
  type CreateProductImagePart,
} from '@services/category/productAPI';
import type { CreateProductPayload } from '@services/category/productApiTypes';
import {
  fetchCategoryProductsList,
  fetchCategoryProductStats,
} from '@services/category/categoryProductSlice';
import { NumericStepperField } from './components/NumericStepperField';
import { ProductUnitSelect } from './components/ProductUnitSelect';
import type { ProductUnitValue } from './constants/productUnits';

export type CreateProductScreenProps = {
  onOpenDrawer: () => void;
  onBack: () => void;
};

export function CreateProductScreen({
  onOpenDrawer,
  onBack,
}: CreateProductScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_CreateProductScreen_styles);

  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const sellerId = useAppSelector(s => s.auth.user?.seller?.id ?? null);
  const [submitting, setSubmitting] = useState(false);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState<ProductUnitValue>('piece');
  const [minStock, setMinStock] = useState(0);
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState(0);
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [pickedImage, setPickedImage] = useState<CreateProductImagePart | null>(
    null,
  );
  const [isActive, setIsActive] = useState(true);

  const pickFromLibrary = useCallback(async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });
      if (res.didCancel || res.errorMessage) {
        if (res.errorMessage) {
          toast.error(res.errorMessage);
        }
        return;
      }
      const a = res.assets?.[0];
      if (a?.uri == null) {
        return;
      }
      setPickedImage({
        uri: a.uri,
        type: a.type ?? 'image/jpeg',
        name: a.fileName ?? `product_${Date.now()}.jpg`,
      });
      setImageUrl('');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Không mở được thư viện ảnh.',
      );
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          toast.error('Ứng dụng cần quyền truy cập camera');
          return;
        }
      }
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
        cameraType: 'back',
      });
      if (res.didCancel || res.errorMessage) {
        if (res.errorMessage) {
          toast.error(res.errorMessage);
        }
        return;
      }
      const a = res.assets?.[0];
      if (a?.uri == null) {
        return;
      }
      setPickedImage({
        uri: a.uri,
        type: a.type ?? 'image/jpeg',
        name: a.fileName ?? `product_${Date.now()}.jpg`,
      });
      setImageUrl('');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Không mở được camera.',
      );
    }
  }, []);

  const clearPickedImage = useCallback(() => {
    setPickedImage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!sku.trim() || !name.trim()) {
      toast.warning('Vui lòng nhập Mã SKU và Tên sản phẩm.');
      return;
    }
    if (sellerId == null) {
      toast.warning('Tài khoản không gắn seller — không xác định được seller_id.');
      return;
    }

    const payload: CreateProductPayload = {
      seller_id: sellerId,
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim(),
      barcode: barcode.trim(),
      price,
      unit,
      min_stock: minStock,
      weight,
      length,
      width,
      height,
      is_active: isActive,
      image_url: pickedImage != null ? '' : imageUrl.trim(),
    };

    setSubmitting(true);
    try {
      const created =
        pickedImage != null
          ? await createProductWithPickedImage(payload, pickedImage)
          : await createProduct(payload);
      void dispatch(fetchCategoryProductsList({ page: 1 }));
      void dispatch(fetchCategoryProductStats());
      toast.success(`Đã tạo sản phẩm ${created.name}`);
      onBack();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  }, [
    sku,
    name,
    barcode,
    price,
    unit,
    minStock,
    description,
    weight,
    length,
    width,
    height,
    imageUrl,
    isActive,
    sellerId,
    dispatch,
    onBack,
    pickedImage,
  ]);

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
          <FormScreenHeading sectionLabel="Sản phẩm" title="Tạo sản phẩm" />
          <DetailCard title="Thông tin cơ bản" icon="package">
            <TextField
              label="Mã SKU *"
              variant="dark"
              value={sku}
              onChangeText={setSku}
              placeholder="VD: 4513574014152"
              autoCapitalize="none"
            />
            <Text style={styles.fieldHint}>{'Mã sản phẩm duy nhất'}</Text>

            <TextField
              label="Tên sản phẩm *"
              variant="dark"
              value={name}
              onChangeText={setName}
              placeholder="Tên hiển thị"
            />

            <TextField
              label="Mã vạch"
              variant="dark"
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Tùy chọn"
              keyboardType="numeric"
            />
            <Text style={styles.fieldHint}>{'Định dạng EAN-8, EAN-13, hoặc UPC (8–13 chữ số)'}</Text>

            <NumericStepperField
              label="Giá"
              required
              hint="Giá cơ bản để tính toán"
              value={price}
              onChange={setPrice}
              min={0}
              step={1}
            />

            <ProductUnitSelect
              label="Đơn vị"
              hint="Đơn vị dùng cho tồn kho, đơn hàng và thanh toán"
              value={unit}
              onChange={setUnit}
            />

            <NumericStepperField
              label="Tồn tối thiểu"
              hint="Cảnh báo khi tồn kho dưới mức này"
              value={minStock}
              onChange={setMinStock}
              min={0}
              step={1}
            />

            <TextField
              label="Mô tả"
              variant="dark"
              value={description}
              onChangeText={setDescription}
              placeholder="Tùy chọn"
              multiline
            />
          </DetailCard>

          <DetailCard title="Kích thước và trọng lượng" icon="ruler">
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
          </DetailCard>

          <DetailCard title="Hình ảnh & trạng thái" icon="image">
            <Text style={styles.imageBlockTitle}>Ảnh sản phẩm</Text>
            <View style={styles.imagePickRow}>
              <Button
                title="Thư viện ảnh"
                variant="outline"
                size="sm"
                disabled={submitting}
                onPress={() => void pickFromLibrary()}
                style={styles.imagePickBtn}
              />
              <Button
                title="Chụp ảnh"
                variant="outline"
                size="sm"
                disabled={submitting}
                onPress={() => void pickFromCamera()}
                style={styles.imagePickBtn}
              />
            </View>
            {pickedImage != null ? (
              <View style={styles.imagePreviewBlock}>
                <Image
                  source={{ uri: pickedImage.uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={clearPickedImage}
                  disabled={submitting}
                  style={({ pressed }) => [
                    styles.removeImageBtn,
                    { borderColor: palette.borderMid },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={[styles.removeImageTxt, { color: palette.red }]}>
                    Gỡ ảnh
                  </Text>
                </Pressable>
              </View>
            ) : null}
            <TextField
              label="Hoặc URL hình ảnh"
              variant="dark"
              value={imageUrl}
              onChangeText={t => {
                setImageUrl(t);
                if (t.trim().length > 0) {
                  setPickedImage(null);
                }
              }}
              placeholder="https://…"
              autoCapitalize="none"
            />
            <Text style={styles.fieldHint}>
              {'Chọn ảnh từ máy (ưu tiên) hoặc dán URL công khai. Khi có ảnh trên máy, URL sẽ không dùng khi tạo.'}
            </Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabels}>
                <Text style={styles.switchTitle}>Đang hoạt động</Text>
                <Text style={styles.switchHint}>
                  Hiển thị và bán sản phẩm này
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
              title="Tạo mới"
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

function create_CreateProductScreen_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    flex: { flex: 1, minHeight: 0 },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 12,
      gap: 4,
    },
    footer: {
      gap: 12,
      marginTop: 8,
    },
    footerPrimary: {
      width: '100%',
    },
    footerCancel: {
      width: '100%',
      backgroundColor: c.bgButton,
      borderColor: c.border,
    },
    footerCancelText: {
      color: c.textPrimary,
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
      minWidth: 0,
      flexBasis: '47%',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingVertical: 8,
      paddingHorizontal: 2,
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
      marginTop: 4,
    },
    imageBlockTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textSecondary,
      marginBottom: 8,
    },
    imagePickRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 10,
    },
    imagePickBtn: {
      flex: 1,
      minWidth: 120,
    },
    imagePreviewBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    imagePreview: {
      width: 112,
      height: 112,
      borderRadius: 10,
      backgroundColor: c.bgInput,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    removeImageBtn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
    },
    removeImageTxt: {
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
