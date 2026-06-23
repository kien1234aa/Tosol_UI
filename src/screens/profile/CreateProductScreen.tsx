import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productsCopy, type ProductUnitValue } from '@/src/configs/products';
import { mainLayout } from '@/src/configs/main';
import { lightTokens } from '@/src/configs/theme';
import {
  buttonLabelStyle,
  buttonPrimaryCta,
} from '@/src/configs/theme/buttonLayout';
import {
  PersonalInfoField,
  CreateProductImageField,
  CreateProductComboField,
  CreateProductComboModal,
  ProductUnitSelectField,
  ProfileStackHeader,
} from '@/src/components/profile';
import { useCreateProduct } from '@/src/hooks/profile';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import {
  selectAuthSellerId,
  selectAuthWarehouses,
  selectCurrentWarehouseId,
} from '@/src/redux/login';
import { isAllWarehouses } from '@/src/configs/warehouse';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import { DismissKeyboardView } from '@/src/shared/components/ui/DismissKeyboardView';
import { FormKeyboardAvoidingView } from '@/src/shared/components/ui/FormKeyboardAvoidingView';
import { Box } from '@/src/uikits/box';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type CreateProductScreenProps = ProfileStackScreenProps<'CreateProduct'>;

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box style={styles.sectionCard}>
      <Text size="sm" className="mb-3 font-semibold text-typography-900">
        {title}
      </Text>
      <VStack space="md">{children}</VStack>
    </Box>
  );
}

export function CreateProductScreen({ navigation }: CreateProductScreenProps) {
  const sellerId = useAppSelector(selectAuthSellerId);
  const currentWarehouseId = useAppSelector(selectCurrentWarehouseId);
  const warehouses = useAppSelector(selectAuthWarehouses);
  const warehouseId = useMemo(() => {
    if (!isAllWarehouses(currentWarehouseId)) {
      return currentWarehouseId;
    }

    return warehouses[0]?.id ?? null;
  }, [currentWarehouseId, warehouses]);

  const {
    values,
    comboRows,
    pickedImage,
    errors,
    isSubmitting,
    submitError,
    onChangeField,
    onAddComboRow,
    onRemoveComboRow,
    onSelectComboRowProduct,
    onChangeComboRowQuantity,
    onPickFromLibrary,
    onPickFromCamera,
    onRemoveImage,
    onSubmit,
  } = useCreateProduct();

  const [isComboModalVisible, setIsComboModalVisible] = useState(false);

  const handleBack = useStackGoBack(navigation, 'ProfileMain');

  const handleIsComboChange = useCallback(
    (value: boolean) => {
      onChangeField('isCombo', value);
      if (value) {
        setIsComboModalVisible(true);
      }
    },
    [onChangeField],
  );

  const openComboModal = useCallback(() => {
    setIsComboModalVisible(true);
  }, []);

  const closeComboModal = useCallback(() => {
    setIsComboModalVisible(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const created = await onSubmit();
    if (!created) {
      return;
    }

    Alert.alert(productsCopy.createSuccess, created.name, [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation, onSubmit]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ProfileStackHeader
          title={productsCopy.createScreenTitle}
          onPressBack={handleBack}
        />

        <View style={styles.body}>
          <FormKeyboardAvoidingView style={styles.flex}>
            <View style={styles.flex}>
              <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={styles.content}>
                <DismissKeyboardView>
                  <VStack className="w-full" space="md">
                    <FormSection title={productsCopy.basicSection}>
                      <PersonalInfoField
                        label={`${productsCopy.skuLabel} *`}
                        placeholder={productsCopy.skuPlaceholder}
                        value={values.sku}
                        onChangeText={value => onChangeField('sku', value)}
                        error={errors.sku}
                      />
                      <Text size="xs" className="-mt-2 text-typography-500">
                        {productsCopy.skuHint}
                      </Text>

                      <PersonalInfoField
                        label={`${productsCopy.nameLabel} *`}
                        placeholder={productsCopy.namePlaceholder}
                        value={values.name}
                        onChangeText={value => onChangeField('name', value)}
                        error={errors.name}
                      />

                      <PersonalInfoField
                        label={productsCopy.barcodeLabel}
                        placeholder={productsCopy.barcodePlaceholder}
                        value={values.barcode}
                        onChangeText={value => onChangeField('barcode', value)}
                        keyboardType="numeric"
                      />
                      <Text size="xs" className="-mt-2 text-typography-500">
                        {productsCopy.barcodeHint}
                      </Text>

                      <PersonalInfoField
                        label={`${productsCopy.priceLabel} *`}
                        placeholder="0"
                        value={values.price}
                        onChangeText={value => onChangeField('price', value)}
                        error={errors.price}
                        keyboardType="numeric"
                      />
                      <Text size="xs" className="-mt-2 text-typography-500">
                        {productsCopy.priceHint}
                      </Text>

                      <ProductUnitSelectField
                        value={values.unit as ProductUnitValue}
                        onChange={value => onChangeField('unit', value)}
                        disabled={isSubmitting}
                      />

                      <PersonalInfoField
                        label={productsCopy.minStockLabel}
                        placeholder="0"
                        value={values.minStock}
                        onChangeText={value =>
                          onChangeField('minStock', value)
                        }
                        keyboardType="numeric"
                      />
                      <Text size="xs" className="-mt-2 text-typography-500">
                        {productsCopy.minStockHint}
                      </Text>

                      <PersonalInfoField
                        label={productsCopy.descriptionLabel}
                        placeholder={productsCopy.descriptionPlaceholder}
                        value={values.description}
                        onChangeText={value =>
                          onChangeField('description', value)
                        }
                        multiline
                      />
                    </FormSection>

                    <FormSection title={productsCopy.dimensionsSection}>
                      <HStack className="gap-3">
                        <Box className="flex-1">
                          <PersonalInfoField
                            label={productsCopy.weightLabel}
                            placeholder="0"
                            value={values.weight}
                            onChangeText={value =>
                              onChangeField('weight', value)
                            }
                            keyboardType="numeric"
                          />
                        </Box>
                        <Box className="flex-1">
                          <PersonalInfoField
                            label={productsCopy.lengthLabel}
                            placeholder="0"
                            value={values.length}
                            onChangeText={value =>
                              onChangeField('length', value)
                            }
                            keyboardType="numeric"
                          />
                        </Box>
                      </HStack>

                      <HStack className="gap-3">
                        <Box className="flex-1">
                          <PersonalInfoField
                            label={productsCopy.widthLabel}
                            placeholder="0"
                            value={values.width}
                            onChangeText={value =>
                              onChangeField('width', value)
                            }
                            keyboardType="numeric"
                          />
                        </Box>
                        <Box className="flex-1">
                          <PersonalInfoField
                            label={productsCopy.heightLabel}
                            placeholder="0"
                            value={values.height}
                            onChangeText={value =>
                              onChangeField('height', value)
                            }
                            keyboardType="numeric"
                          />
                        </Box>
                      </HStack>
                    </FormSection>

                    <FormSection title={productsCopy.statusSection}>
                      <CreateProductImageField
                        image={pickedImage}
                        disabled={isSubmitting}
                        onPickFromLibrary={() => void onPickFromLibrary()}
                        onPickFromCamera={() => void onPickFromCamera()}
                        onRemoveImage={onRemoveImage}
                      />

                      <HStack className="items-center justify-between py-1">
                        <VStack className="flex-1 pr-3" space="xs">
                          <Text
                            size="sm"
                            className="font-medium text-typography-700">
                            {productsCopy.isActiveLabel}
                          </Text>
                          <Text size="xs" className="text-typography-500">
                            {productsCopy.isActiveHint}
                          </Text>
                        </VStack>
                        <Switch
                          value={values.isActive}
                          onValueChange={value =>
                            onChangeField('isActive', value)
                          }
                          trackColor={{
                            false: lightTokens.outline100,
                            true: lightTokens.tertiary500,
                          }}
                          thumbColor={lightTokens.background0}
                          disabled={isSubmitting}
                        />
                      </HStack>

                      <HStack className="items-center justify-between py-1">
                        <VStack className="flex-1 pr-3" space="xs">
                          <Text
                            size="sm"
                            className="font-medium text-typography-700">
                            {productsCopy.isComboLabel}
                          </Text>
                          <Text size="xs" className="text-typography-500">
                            {productsCopy.isComboHint}
                          </Text>
                        </VStack>
                        <Switch
                          value={values.isCombo}
                          onValueChange={handleIsComboChange}
                          trackColor={{
                            false: lightTokens.outline100,
                            true: lightTokens.tertiary500,
                          }}
                          thumbColor={lightTokens.background0}
                          disabled={isSubmitting}
                        />
                      </HStack>

                      {values.isCombo ? (
                        <CreateProductComboField
                          rows={comboRows}
                          disabled={isSubmitting}
                          error={errors.comboItems}
                          onPressConfigure={openComboModal}
                        />
                      ) : null}
                    </FormSection>

                    {submitError ? (
                      <Text size="sm" className="text-center text-error-500">
                        {submitError}
                      </Text>
                    ) : null}

                    <Pressable
                      onPress={() => void handleSubmit()}
                      disabled={isSubmitting}
                      accessibilityRole="button"
                      accessibilityLabel={productsCopy.save}
                      style={[
                        buttonPrimaryCta,
                        styles.saveButton,
                        isSubmitting ? styles.submitDisabled : undefined,
                      ]}>
                      <Text
                        size="md"
                        className="font-semibold text-typography-0"
                        style={buttonLabelStyle}>
                        {isSubmitting ? 'Đang tạo…' : productsCopy.save}
                      </Text>
                    </Pressable>
                  </VStack>
                </DismissKeyboardView>
              </ScrollView>
            </View>
          </FormKeyboardAvoidingView>
        </View>
      </SafeAreaView>

      <CreateProductComboModal
        visible={isComboModalVisible && values.isCombo}
        rows={comboRows}
        sellerId={sellerId}
        warehouseId={warehouseId}
        disabled={isSubmitting}
        onClose={closeComboModal}
        onAddRow={onAddComboRow}
        onRemoveRow={onRemoveComboRow}
        onSelectProduct={onSelectComboRowProduct}
        onChangeQuantity={onChangeComboRowQuantity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightTokens.background50,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: mainLayout.tabStackFooterPaddingBottom,
  },
  sectionCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  saveButton: {
    backgroundColor: lightTokens.tertiary500,
    marginTop: 4,
  },
  submitDisabled: {
    opacity: 0.65,
  },
});
