import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { draftCopy } from '@/src/configs/createOrder';
import { lightTokens } from '@/src/configs/theme';
import { mainLayout } from '@/src/configs/main';
import { useCreateOrder } from '@/src/hooks/createOrder';
import { useStackGoBack } from '@/src/navigation/useStackGoBack';
import type { CreateOrderStackScreenProps } from '@/src/navigation/types';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { useResponsiveLayout } from '@/src/hooks/common/useResponsiveLayout';
import {
  makeSelectDraftById,
  removeDraft,
  setActiveDraftId,
} from '@/src/redux/createOrderDraft';
import {
  CreateCustomerModal,
  CreateOrderFooter,
  CreateOrderForm,
  CreateOrderProductsSection,
} from '@/src/components/createOrder';
import { StackHeader } from '@/src/components/main';
import { FormKeyboardAvoidingView } from '@/src/shared/components/ui/FormKeyboardAvoidingView';
import { Box } from '@/src/uikits/box';
import { VStack } from '@/src/uikits/vstack';

type CreateOrderScreenProps = CreateOrderStackScreenProps<'CreateOrderEdit'>;

export function CreateOrderScreen({
  navigation,
  route,
}: CreateOrderScreenProps) {
  const { draftId } = route.params;
  const dispatch = useAppDispatch();
  const selectDraftById = useMemo(() => makeSelectDraftById(draftId), [draftId]);
  const draft = useAppSelector(selectDraftById);
  const handleBack = useStackGoBack(navigation, 'CreateOrderList');
  const handleSubmitSuccess = useCallback(() => {
    navigation.navigate('CreateOrderList');
  }, [navigation]);
  const order = useCreateOrder(draftId, { onSubmitSuccess: handleSubmitSuccess });
  const { horizontalPadding, contentMaxWidth, isTablet } = useResponsiveLayout();
  const {
    groups,
    grandTotalVnd,
    hasProducts,
    onChangeQuantity,
    onChangeUnitPrice,
    onChangeTaxRate,
    onRemoveProduct,
  } = order;

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveDraftId(draftId));
    }, [dispatch, draftId]),
  );

  useEffect(() => {
    if (!draft) {
      navigation.replace('CreateOrderList');
    }
  }, [draft, navigation]);

  const handleAddProduct = useCallback(() => {
    navigation.getParent()?.navigate('Search', { screen: 'SearchMain' });
  }, [navigation]);

  const handleDeleteDraft = useCallback(() => {
    Alert.alert(draftCopy.deleteDraft, draftCopy.deleteDraftConfirm, [
      {
        text: draftCopy.deleteDraftCancel,
        style: 'cancel',
      },
      {
        text: draftCopy.deleteDraftConfirmAction,
        style: 'destructive',
        onPress: () => {
          dispatch(removeDraft(draftId));
          navigation.replace('CreateOrderList');
        },
      },
    ]);
  }, [dispatch, draftId, navigation]);

  const headerRightAction = useMemo(
    () => (
      <Pressable
        onPress={handleDeleteDraft}
        accessibilityRole="button"
        accessibilityLabel={draftCopy.deleteDraft}
        hitSlop={8}
        style={styles.headerDeleteButton}>
        <Trash2 color={lightTokens.error500} size={20} />
      </Pressable>
    ),
    [handleDeleteDraft],
  );

  if (!draft) {
    return null;
  }

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <StackHeader
          title={draftCopy.continueDraft}
          onPressBack={handleBack}
          backAccessibilityLabel={draftCopy.title}
          rightAction={headerRightAction}
          uppercase={false}
        />

        <FormKeyboardAvoidingView>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[
              styles.content,
              {
                paddingHorizontal: horizontalPadding,
                maxWidth: isTablet ? contentMaxWidth.screen : undefined,
                alignSelf: isTablet ? 'center' : undefined,
                width: isTablet ? '100%' : undefined,
              },
            ]}>
            <VStack className="w-full" space="md">
              <CreateOrderForm
                part="setup"
                setupSectionNumber={1}
                form={order.form}
                shopOptions={order.shopOptions}
                warehouseOptions={order.warehouseOptions}
                shippingPartnerOptions={order.shippingPartnerOptions}
                suggestedShopOptions={order.suggestedShopOptions}
                suggestedWarehouseOptions={order.suggestedWarehouseOptions}
                suggestedShippingPartnerOptions={
                  order.suggestedShippingPartnerOptions
                }
                recentCustomers={order.recentCustomers}
                customerSearchQuery={order.customerSearchQuery}
                customerSearchResults={order.customerSearchResults}
                selectedCustomerName={order.selectedCustomerName}
                isSearchingCustomers={order.isSearchingCustomers}
                customerSearchError={order.customerSearchError}
                selectedShopLabel={order.selectedShopLabel}
                selectedWarehouseLabel={order.selectedWarehouseLabel}
                selectedShippingPartnerLabel={order.selectedShippingPartnerLabel}
                shippingFeeVnd={order.shippingFeeVnd}
                isLoadingShippingFee={order.isLoadingShippingFee}
                shippingEstimateError={order.shippingEstimateError}
                isLoadingShops={order.isLoadingShops}
                isLoadingWarehouses={order.isLoadingWarehouses}
                isLoadingShippingPartners={order.isLoadingShippingPartners}
                shippingPartnersError={order.shippingPartnersError}
                provinceOptions={order.provinceOptions}
                districtOptions={order.districtOptions}
                wardOptions={order.wardOptions}
                selectedProvinceLabel={order.selectedProvinceLabel}
                selectedDistrictLabel={order.selectedDistrictLabel}
                selectedWardLabel={order.selectedWardLabel}
                isWardRequired={order.isWardRequired}
                isLoadingProvinces={order.isLoadingProvinces}
                isLoadingDistricts={order.isLoadingDistricts}
                isLoadingWards={order.isLoadingWards}
                provincesError={order.provincesError}
                districtsError={order.districtsError}
                wardsError={order.wardsError}
                loadError={order.loadError}
                reloadOptions={order.reloadOptions}
                onSelectShop={order.onSelectShop}
                onSelectWarehouse={order.onSelectWarehouse}
                onSelectShippingPartner={order.onSelectShippingPartner}
                onChangeCustomerSearchQuery={order.onChangeCustomerSearchQuery}
                onSelectCustomer={order.onSelectCustomer}
                onPressCreateCustomer={order.onPressCreateCustomer}
                onSelectShippingMethod={order.onSelectShippingMethod}
                onChangeRecipientName={order.onChangeRecipientName}
                onChangeRecipientPhone={order.onChangeRecipientPhone}
                onChangeRecipientAddress={order.onChangeRecipientAddress}
                onSelectProvince={order.onSelectProvince}
                onSelectDistrict={order.onSelectDistrict}
                onSelectWard={order.onSelectWard}
                onToggleCod={order.onToggleCod}
                onToggleAdvanced={order.onToggleAdvanced}
              />

              <CreateOrderProductsSection
                sectionNumber={2}
                groups={groups}
                onPressAddProduct={handleAddProduct}
                onChangeQuantity={onChangeQuantity}
                onChangeUnitPrice={onChangeUnitPrice}
                onChangeTaxRate={onChangeTaxRate}
                onRemoveProduct={onRemoveProduct}
              />

              <CreateOrderForm
                part="shipping"
                shippingSectionNumber={3}
                form={order.form}
                shopOptions={order.shopOptions}
                warehouseOptions={order.warehouseOptions}
                shippingPartnerOptions={order.shippingPartnerOptions}
                suggestedShopOptions={order.suggestedShopOptions}
                suggestedWarehouseOptions={order.suggestedWarehouseOptions}
                suggestedShippingPartnerOptions={
                  order.suggestedShippingPartnerOptions
                }
                recentCustomers={order.recentCustomers}
                customerSearchQuery={order.customerSearchQuery}
                customerSearchResults={order.customerSearchResults}
                selectedCustomerName={order.selectedCustomerName}
                isSearchingCustomers={order.isSearchingCustomers}
                customerSearchError={order.customerSearchError}
                selectedShopLabel={order.selectedShopLabel}
                selectedWarehouseLabel={order.selectedWarehouseLabel}
                selectedShippingPartnerLabel={order.selectedShippingPartnerLabel}
                shippingFeeVnd={order.shippingFeeVnd}
                isLoadingShippingFee={order.isLoadingShippingFee}
                shippingEstimateError={order.shippingEstimateError}
                isLoadingShops={order.isLoadingShops}
                isLoadingWarehouses={order.isLoadingWarehouses}
                isLoadingShippingPartners={order.isLoadingShippingPartners}
                shippingPartnersError={order.shippingPartnersError}
                provinceOptions={order.provinceOptions}
                districtOptions={order.districtOptions}
                wardOptions={order.wardOptions}
                selectedProvinceLabel={order.selectedProvinceLabel}
                selectedDistrictLabel={order.selectedDistrictLabel}
                selectedWardLabel={order.selectedWardLabel}
                isWardRequired={order.isWardRequired}
                isLoadingProvinces={order.isLoadingProvinces}
                isLoadingDistricts={order.isLoadingDistricts}
                isLoadingWards={order.isLoadingWards}
                provincesError={order.provincesError}
                districtsError={order.districtsError}
                wardsError={order.wardsError}
                loadError={order.loadError}
                reloadOptions={order.reloadOptions}
                onSelectShop={order.onSelectShop}
                onSelectWarehouse={order.onSelectWarehouse}
                onSelectShippingPartner={order.onSelectShippingPartner}
                onChangeCustomerSearchQuery={order.onChangeCustomerSearchQuery}
                onSelectCustomer={order.onSelectCustomer}
                onPressCreateCustomer={order.onPressCreateCustomer}
                onSelectShippingMethod={order.onSelectShippingMethod}
                onChangeRecipientName={order.onChangeRecipientName}
                onChangeRecipientPhone={order.onChangeRecipientPhone}
                onChangeRecipientAddress={order.onChangeRecipientAddress}
                onSelectProvince={order.onSelectProvince}
                onSelectDistrict={order.onSelectDistrict}
                onSelectWard={order.onSelectWard}
                onToggleCod={order.onToggleCod}
                onToggleAdvanced={order.onToggleAdvanced}
              />

              <CreateOrderFooter
                variant="inline"
                grandTotalVnd={grandTotalVnd}
                orderTotalVnd={order.orderTotalVnd}
                selectedShopBadge={order.selectedShopBadge}
                canSubmit={hasProducts}
                isSubmitting={order.isSubmitting}
                isLoadingOptions={
                  order.isLoadingShops || order.isLoadingWarehouses
                }
                onSubmit={order.onSubmit}
              />
            </VStack>
          </ScrollView>
        </FormKeyboardAvoidingView>
      </SafeAreaView>

      <CreateCustomerModal
        visible={order.createCustomer.visible}
        form={order.createCustomer.form}
        isSubmitting={order.createCustomer.isSubmitting}
        provinceOptions={order.createCustomer.provinceOptions}
        districtOptions={order.createCustomer.districtOptions}
        wardOptions={order.createCustomer.wardOptions}
        selectedProvinceLabel={order.createCustomer.selectedProvinceLabel}
        selectedDistrictLabel={order.createCustomer.selectedDistrictLabel}
        selectedWardLabel={order.createCustomer.selectedWardLabel}
        isWardRequired={order.createCustomer.isWardRequired}
        isLoadingProvinces={order.createCustomer.isLoadingProvinces}
        isLoadingDistricts={order.createCustomer.isLoadingDistricts}
        isLoadingWards={order.createCustomer.isLoadingWards}
        provincesError={order.createCustomer.provincesError}
        districtsError={order.createCustomer.districtsError}
        wardsError={order.createCustomer.wardsError}
        closeCreateCustomer={order.createCustomer.closeCreateCustomer}
        onChangeName={order.createCustomer.onChangeName}
        onChangePhone={order.createCustomer.onChangePhone}
        onChangeEmail={order.createCustomer.onChangeEmail}
        onChangeAddress={order.createCustomer.onChangeAddress}
        onSelectProvince={order.createCustomer.onSelectProvince}
        onSelectDistrict={order.createCustomer.onSelectDistrict}
        onSelectWard={order.createCustomer.onSelectWard}
        onSubmit={order.createCustomer.onSubmit}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerDeleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 12,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
});
