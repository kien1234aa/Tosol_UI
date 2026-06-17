import React, { memo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Home,
  Package,
  Phone,
  Settings,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react-native';
import {
  createOrderCopy,
  createOrderShippingMethods,
  formatWarehouseOptionLabel,
} from '@/src/configs/cart/createOrder.constants';
import { lightTokens } from '@/src/configs/theme';
import { formatVndPrice } from '@/src/helpers/cart';
import type { UseCreateOrderFormResult } from '@/src/hooks/cart/useCreateOrderForm';
import { Box } from '@/src/uikits/box';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import {
  CreateOrderDisplayField,
  CreateOrderSectionHeader,
  CreateOrderShippingRadio,
  CreateOrderTextField,
  createOrderSectionCardClass,
} from './createOrderFormFields';
import { CreateOrderSelectField } from './CreateOrderSelectField';
import { CreateOrderCustomerSearch } from './CreateOrderCustomerSearch';

type CreateOrderModalProps = Pick<
  UseCreateOrderFormResult,
  | 'visible'
  | 'form'
  | 'shopOptions'
  | 'warehouseOptions'
  | 'shippingPartnerOptions'
  | 'customerSearchQuery'
  | 'customerSearchResults'
  | 'selectedCustomerName'
  | 'isSearchingCustomers'
  | 'customerSearchError'
  | 'selectedShopLabel'
  | 'selectedWarehouseLabel'
  | 'selectedShippingPartnerLabel'
  | 'selectedShopBadge'
  | 'orderTotalVnd'
  | 'shippingFeeVnd'
  | 'isLoadingShippingFee'
  | 'shippingEstimateError'
  | 'isLoadingShops'
  | 'isLoadingWarehouses'
  | 'isLoadingShippingPartners'
  | 'shippingPartnersError'
  | 'provinceOptions'
  | 'districtOptions'
  | 'wardOptions'
  | 'selectedProvinceLabel'
  | 'selectedDistrictLabel'
  | 'selectedWardLabel'
  | 'isLoadingProvinces'
  | 'isLoadingDistricts'
  | 'isLoadingWards'
  | 'provincesError'
  | 'districtsError'
  | 'wardsError'
  | 'loadError'
  | 'isSubmitting'
  | 'closeCreateOrder'
  | 'reloadOptions'
  | 'onSelectShop'
  | 'onSelectWarehouse'
  | 'onSelectShippingPartner'
  | 'onChangeCustomerSearchQuery'
  | 'onSelectCustomer'
  | 'onSelectShippingMethod'
  | 'onChangeRecipientName'
  | 'onChangeRecipientPhone'
  | 'onChangeRecipientAddress'
  | 'onSelectProvince'
  | 'onSelectDistrict'
  | 'onSelectWard'
  | 'onToggleCod'
  | 'onToggleAdvanced'
  | 'onSubmit'
>;

function CreateOrderModalComponent({
  visible,
  form,
  shopOptions,
  warehouseOptions,
  shippingPartnerOptions,
  customerSearchQuery,
  customerSearchResults,
  selectedCustomerName,
  isSearchingCustomers,
  customerSearchError,
  selectedShopLabel,
  selectedWarehouseLabel,
  selectedShippingPartnerLabel,
  selectedShopBadge,
  orderTotalVnd,
  shippingFeeVnd,
  isLoadingShippingFee,
  shippingEstimateError,
  isLoadingShops,
  isLoadingWarehouses,
  isLoadingShippingPartners,
  shippingPartnersError,
  provinceOptions,
  districtOptions,
  wardOptions,
  selectedProvinceLabel,
  selectedDistrictLabel,
  selectedWardLabel,
  isLoadingProvinces,
  isLoadingDistricts,
  isLoadingWards,
  provincesError,
  districtsError,
  wardsError,
  loadError,
  isSubmitting,
  closeCreateOrder,
  reloadOptions,
  onSelectShop,
  onSelectWarehouse,
  onSelectShippingPartner,
  onChangeCustomerSearchQuery,
  onSelectCustomer,
  onSelectShippingMethod,
  onChangeRecipientName,
  onChangeRecipientPhone,
  onChangeRecipientAddress,
  onSelectProvince,
  onSelectDistrict,
  onSelectWard,
  onToggleCod,
  onToggleAdvanced,
  onSubmit,
}: CreateOrderModalProps) {
  const showShippingPartner =
    form.shippingMethod === 'warehouse_partner' ||
    form.shippingMethod === 'seller_partner';
  const isSellerShippingPartner = form.shippingMethod === 'seller_partner';
  const shippingPartnerLabel = isSellerShippingPartner
    ? createOrderCopy.sellerPartnerLabel
    : createOrderCopy.warehousePartnerLabel;
  const isSubmitDisabled =
    isSubmitting || isLoadingShops || isLoadingWarehouses;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeCreateOrder}>
      <Box className="flex-1 bg-background-50">
        <Box className="border-b border-outline-100 bg-background-0 px-4 pb-3 pt-4">
          <HStack className="items-center justify-between">
            <Text size="lg" className="font-bold text-typography-900">
              {createOrderCopy.title}
            </Text>
            <Pressable
              onPress={closeCreateOrder}
              accessibilityRole="button"
              accessibilityLabel={createOrderCopy.cancel}
              className="h-9 w-9 items-center justify-center rounded-full bg-background-50">
              <X color={lightTokens.typography500} size={20} />
            </Pressable>
          </HStack>
        </Box>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {loadError ? (
              <HStack
                className={`${createOrderSectionCardClass} items-center gap-3 border-error-500`}>
                <Text size="sm" className="flex-1 text-error-500">
                  {loadError}
                </Text>
                <Pressable onPress={reloadOptions} accessibilityRole="button">
                  <Text size="sm" className="font-semibold text-tertiary-600">
                    {createOrderCopy.retry}
                  </Text>
                </Pressable>
              </HStack>
            ) : null}

            <Box className={createOrderSectionCardClass}>
              <CreateOrderSectionHeader
                number={1}
                title={createOrderCopy.sectionSetup}
              />

              <VStack space="lg">
                <CreateOrderSelectField
                  label={createOrderCopy.shopLabel}
                  required
                  value={selectedShopLabel}
                  options={shopOptions}
                  selectedId={form.shopId}
                  placeholder={createOrderCopy.selectShop}
                  pickerTitle={createOrderCopy.shopPickerTitle}
                  isLoading={isLoadingShops}
                  leadingIcon={
                    <Store color={lightTokens.tertiary600} size={18} />
                  }
                  onSelect={onSelectShop}
                />

                <CreateOrderSelectField
                  label={createOrderCopy.packagingWarehouseLabel}
                  required
                  value={selectedWarehouseLabel}
                  options={warehouseOptions}
                  selectedId={form.packagingWarehouseId}
                  placeholder={createOrderCopy.selectWarehouse}
                  pickerTitle={createOrderCopy.warehousePickerTitle}
                  isLoading={isLoadingWarehouses}
                  formatOptionLabel={formatWarehouseOptionLabel}
                  leadingIcon={
                    <Package color={lightTokens.tertiary600} size={18} />
                  }
                  onSelect={onSelectWarehouse}
                />

                <CreateOrderCustomerSearch
                  query={customerSearchQuery}
                  selectedCustomerName={selectedCustomerName}
                  results={customerSearchResults}
                  isSearching={isSearchingCustomers}
                  searchError={customerSearchError}
                  onChangeQuery={onChangeCustomerSearchQuery}
                  onSelectCustomer={onSelectCustomer}
                />
              </VStack>
            </Box>

            <Box className={createOrderSectionCardClass}>
              <CreateOrderSectionHeader
                number={2}
                title={createOrderCopy.sectionShipping}
              />

              <Text
                size="xs"
                className="mb-3 font-semibold tracking-wide text-typography-500">
                {createOrderCopy.shippingMethodTitle}
              </Text>

              <VStack space="md" className="mb-5">
                {createOrderShippingMethods.map(method => (
                  <CreateOrderShippingRadio
                    key={method.value}
                    label={method.label}
                    selected={form.shippingMethod === method.value}
                    onPress={() => onSelectShippingMethod(method.value)}
                  />
                ))}
              </VStack>

              {showShippingPartner ? (
                <Box className="mb-5">
                  <CreateOrderSelectField
                    label={shippingPartnerLabel}
                    required
                    value={selectedShippingPartnerLabel}
                    options={shippingPartnerOptions}
                    selectedId={form.warehousePartnerId}
                    placeholder={createOrderCopy.selectPartner}
                    pickerTitle={createOrderCopy.partnerPickerTitle}
                    isLoading={isLoadingShippingPartners}
                    disabled={isSellerShippingPartner}
                    leadingIcon={
                      <Building2 color={lightTokens.tertiary600} size={18} />
                    }
                    onSelect={onSelectShippingPartner}
                  />
                  {shippingPartnersError && !isSellerShippingPartner ? (
                    <Text size="xs" className="mt-1.5 text-error-500">
                      {shippingPartnersError}
                    </Text>
                  ) : null}
                </Box>
              ) : null}

              <Text
                size="xs"
                className="mb-3 font-semibold tracking-wide text-typography-500">
                {createOrderCopy.recipientSectionTitle}
              </Text>

              <VStack space="lg">
                <CreateOrderTextField
                  label={createOrderCopy.recipientNameLabel}
                  required
                  value={form.recipientName}
                  onChangeText={onChangeRecipientName}
                  leadingIcon={
                    <User color={lightTokens.tertiary600} size={18} />
                  }
                />

                <CreateOrderTextField
                  label={createOrderCopy.recipientPhoneLabel}
                  required
                  value={form.recipientPhone}
                  onChangeText={onChangeRecipientPhone}
                  keyboardType="phone-pad"
                  leadingIcon={
                    <Phone color={lightTokens.tertiary600} size={18} />
                  }
                />

                <CreateOrderTextField
                  label={createOrderCopy.recipientAddressLabel}
                  required
                  value={form.recipientAddress}
                  onChangeText={onChangeRecipientAddress}
                  leadingIcon={
                    <Home color={lightTokens.tertiary600} size={18} />
                  }
                />

                <HStack className="items-start gap-2">
                  <CreateOrderSelectField
                    label={createOrderCopy.provinceLabel}
                    value={selectedProvinceLabel}
                    options={provinceOptions}
                    selectedId={form.provinceId}
                    placeholder={createOrderCopy.selectProvince}
                    pickerTitle={createOrderCopy.provincePickerTitle}
                    isLoading={isLoadingProvinces}
                    style={{ flex: 1, minWidth: 0 }}
                    onSelect={onSelectProvince}
                  />
                  <CreateOrderSelectField
                    label={createOrderCopy.districtLabel}
                    value={selectedDistrictLabel}
                    options={districtOptions}
                    selectedId={form.districtId}
                    placeholder={createOrderCopy.selectDistrict}
                    pickerTitle={createOrderCopy.districtPickerTitle}
                    isLoading={isLoadingDistricts}
                    disabled={form.provinceId == null}
                    style={{ flex: 1, minWidth: 0 }}
                    onSelect={onSelectDistrict}
                  />
                  <CreateOrderSelectField
                    label={createOrderCopy.wardLabel}
                    value={selectedWardLabel}
                    options={wardOptions}
                    selectedId={form.wardId}
                    placeholder={createOrderCopy.selectWard}
                    pickerTitle={createOrderCopy.wardPickerTitle}
                    isLoading={isLoadingWards}
                    disabled={form.districtId == null}
                    style={{ flex: 1, minWidth: 0 }}
                    onSelect={onSelectWard}
                  />
                </HStack>

                {provincesError ? (
                  <Text size="xs" className="text-error-500">
                    {provincesError}
                  </Text>
                ) : null}
                {districtsError ? (
                  <Text size="xs" className="text-error-500">
                    {districtsError}
                  </Text>
                ) : null}
                {wardsError ? (
                  <Text size="xs" className="text-error-500">
                    {wardsError}
                  </Text>
                ) : null}

                <CreateOrderDisplayField
                  label={createOrderCopy.shippingFeeLabel}
                  value={formatVndPrice(shippingFeeVnd)}
                  isLoading={isLoadingShippingFee}
                  leadingIcon={
                    <Truck color={lightTokens.tertiary600} size={18} />
                  }
                />
                {shippingEstimateError ? (
                  <Text size="xs" className="text-error-500">
                    {shippingEstimateError}
                  </Text>
                ) : null}

                <HStack className="items-center justify-between py-1">
                  <Text size="sm" className="text-typography-900">
                    {createOrderCopy.codLabel}
                  </Text>
                  <Switch
                    value={form.isCodEnabled}
                    onValueChange={onToggleCod}
                    trackColor={{
                      false: lightTokens.outline200,
                      true: lightTokens.tertiary500,
                    }}
                    thumbColor={lightTokens.background0}
                  />
                </HStack>
              </VStack>
            </Box>

            <Pressable
              onPress={onToggleAdvanced}
              accessibilityRole="button"
              className="mb-3 flex-row items-center justify-between rounded-xl border border-outline-100 bg-background-0 px-3.5 py-3.5">
              <HStack className="items-center gap-2">
                <Settings color={lightTokens.typography500} size={18} />
                <Text size="sm" className="font-medium text-typography-700">
                  {createOrderCopy.sectionAdvanced}
                </Text>
              </HStack>
              {form.isAdvancedOpen ? (
                <ChevronUp color={lightTokens.typography500} size={18} />
              ) : (
                <ChevronDown color={lightTokens.typography500} size={18} />
              )}
            </Pressable>

            {form.isAdvancedOpen ? (
              <Box className={createOrderSectionCardClass}>
                <Text size="sm" className="text-typography-500">
                  {createOrderCopy.advancedComingSoon}
                </Text>
              </Box>
            ) : null}
          </ScrollView>

          <Box className="border-t border-outline-100 bg-background-0 px-4 pb-6 pt-3">
            <HStack className="mb-3 items-center justify-between">
              {selectedShopBadge ? (
                <Box className="rounded-full bg-tertiary-50 px-2.5 py-1">
                  <Text size="xs" className="font-semibold text-tertiary-700">
                    {selectedShopBadge}
                  </Text>
                </Box>
              ) : (
                <Box />
              )}
              <VStack className="items-end">
                <Text size="xs" className="text-typography-500">
                  {createOrderCopy.totalLabel}
                </Text>
                <Text size="lg" className="font-bold text-tertiary-600">
                  {formatVndPrice(orderTotalVnd)}
                </Text>
              </VStack>
            </HStack>

            <Button
              size="lg"
              action="default"
              variant="solid"
              className="h-12 w-full rounded-xl border-0 bg-tertiary-500"
              isDisabled={isSubmitDisabled}
              onPress={onSubmit}>
              {isSubmitDisabled ? (
                <ButtonSpinner color={lightTokens.typography0} />
              ) : (
                <>
                  <Check color={lightTokens.typography0} size={18} />
                  <ButtonText className="text-base font-semibold text-typography-0">
                    {createOrderCopy.submit}
                  </ButtonText>
                </>
              )}
            </Button>

            <Button
              size="lg"
              action="default"
              variant="outline"
              className="mt-2.5 h-11 w-full rounded-xl border-outline-200 bg-background-0"
              onPress={closeCreateOrder}>
              <ButtonText className="font-semibold text-typography-700">
                {createOrderCopy.cancel}
              </ButtonText>
            </Button>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </Modal>
  );
}

export const CreateOrderModal = memo(CreateOrderModalComponent);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
});
