import React, { useCallback } from 'react';
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
  CreateProductImageField,
  PersonalInfoField,
  ProductUnitSelectField,
  ProfileStackHeader,
} from '@/src/components/profile';
import { useEditProduct } from '@/src/hooks/profile';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { ProfileStackScreenProps } from '@/src/navigation/types';
import { DismissKeyboardView } from '@/src/shared/components/ui/DismissKeyboardView';
import { FormKeyboardAvoidingView } from '@/src/shared/components/ui/FormKeyboardAvoidingView';
import { DetailScreenSkeleton } from '@/src/shared/components/ui/skeleton';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

type EditProductScreenProps = ProfileStackScreenProps<'EditProduct'>;

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

export function EditProductScreen({ navigation, route }: EditProductScreenProps) {
  const { productId } = route.params;
  const {
    values,
    existingImageUrl,
    pickedImage,
    errors,
    isLoading,
    isSubmitting,
    loadError,
    submitError,
    onChangeField,
    onPickFromLibrary,
    onPickFromCamera,
    onRemoveImage,
    onSubmit,
    reload,
  } = useEditProduct(productId);

  const handleBack = useStackGoBack(navigation, 'ProductList');

  const handleSubmit = useCallback(async () => {
    const updated = await onSubmit();
    if (!updated) {
      return;
    }

    Alert.alert(productsCopy.editSuccess, updated.name, [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [navigation, onSubmit]);

  const showForm = !isLoading && loadError == null;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <ProfileStackHeader
          title={productsCopy.editScreenTitle}
          onPressBack={handleBack}
        />

        <View style={styles.body}>
          {isLoading ? (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}>
              <DetailScreenSkeleton style={styles.skeletonContent} />
            </ScrollView>
          ) : null}

          {!isLoading && loadError ? (
            <Center className="flex-1 px-6">
              <VStack className="items-center" space="md">
                <Text size="md" className="text-center text-typography-500">
                  {loadError}
                </Text>
                <Pressable
                  onPress={() => void reload()}
                  accessibilityRole="button">
                  <Text size="sm" className="font-semibold text-tertiary-600">
                    {productsCopy.retry}
                  </Text>
                </Pressable>
              </VStack>
            </Center>
          ) : null}

          {showForm ? (
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
                      {values.isCombo ? (
                        <Box style={styles.infoBanner}>
                          <Text size="xs" className="text-typography-600">
                            {productsCopy.editComboReadOnlyHint}
                          </Text>
                        </Box>
                      ) : null}

                      <FormSection title={productsCopy.basicSection}>
                        <PersonalInfoField
                          label={`${productsCopy.skuLabel} *`}
                          placeholder={productsCopy.skuPlaceholder}
                          value={values.sku}
                          onChangeText={value => onChangeField('sku', value)}
                          error={errors.sku}
                        />

                        <PersonalInfoField
                          label={`${productsCopy.nameLabel} *`}
                          placeholder={productsCopy.namePlaceholder}
                          value={values.name}
                          onChangeText={value => onChangeField('name', value)}
                          error={errors.name}
                        />

                        <PersonalInfoField
                          label={`${productsCopy.priceLabel} *`}
                          placeholder="0"
                          value={values.price}
                          onChangeText={value => onChangeField('price', value)}
                          error={errors.price}
                          keyboardType="numeric"
                        />

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
                          existingImageUrl={existingImageUrl}
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
                        accessibilityLabel={productsCopy.editSave}
                        style={[
                          buttonPrimaryCta,
                          styles.saveButton,
                          isSubmitting ? styles.submitDisabled : undefined,
                        ]}>
                        <Text
                          size="md"
                          className="font-semibold text-typography-0"
                          style={buttonLabelStyle}>
                          {isSubmitting
                            ? productsCopy.editSaving
                            : productsCopy.editSave}
                        </Text>
                      </Pressable>
                    </VStack>
                  </DismissKeyboardView>
                </ScrollView>
              </View>
            </FormKeyboardAvoidingView>
          ) : null}
        </View>
      </SafeAreaView>
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
  skeletonContent: {
    paddingHorizontal: 0,
  },
  sectionCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  infoBanner: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: lightTokens.tertiary50,
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
