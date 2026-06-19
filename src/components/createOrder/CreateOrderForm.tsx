import React, { memo } from 'react';
import { StyleSheet, Switch } from 'react-native';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Home,
  Package,
  Phone,
  Settings,
  Store,
  Truck,
  User,
} from 'lucide-react-native';
import {
  createOrderCopy,
  createOrderShippingMethods,
  formatWarehouseOptionLabel,
} from '@/src/configs/createOrder/createOrder.constants';
import { lightTokens } from '@/src/configs/theme';
import { formatVndPrice } from '@/src/helpers/createOrder';
import type { UseCreateOrderFormResult } from '@/src/hooks/createOrder/useCreateOrderForm';
import { Box } from '@/src/uikits/box';
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

type CreateOrderFormProps = Pick<
  UseCreateOrderFormResult,
  | 'form'
  | 'shopOptions'
  | 'warehouseOptions'
  | 'shippingPartnerOptions'
  | 'suggestedShopOptions'
  | 'suggestedWarehouseOptions'
  | 'suggestedShippingPartnerOptions'
  | 'recentCustomers'
  | 'customerSearchQuery'
  | 'customerSearchResults'
  | 'selectedCustomerName'
  | 'isSearchingCustomers'
  | 'customerSearchError'
  | 'selectedShopLabel'
  | 'selectedWarehouseLabel'
  | 'selectedShippingPartnerLabel'
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
  | 'isWardRequired'
  | 'isLoadingProvinces'
  | 'isLoadingDistricts'
  | 'isLoadingWards'
  | 'provincesError'
  | 'districtsError'
  | 'wardsError'
  | 'loadError'
  | 'reloadOptions'
  | 'onSelectShop'
  | 'onSelectWarehouse'
  | 'onSelectShippingPartner'
  | 'onChangeCustomerSearchQuery'
  | 'onSelectCustomer'
  | 'onPressCreateCustomer'
  | 'onSelectShippingMethod'
  | 'onChangeRecipientName'
  | 'onChangeRecipientPhone'
  | 'onChangeRecipientAddress'
  | 'onSelectProvince'
  | 'onSelectDistrict'
  | 'onSelectWard'
  | 'onToggleCod'
  | 'onToggleAdvanced'
> & {
  part?: 'setup' | 'shipping' | 'all';
  setupSectionNumber?: number;
  shippingSectionNumber?: number;
};

function CreateOrderFormComponent({
  part = 'all',
  setupSectionNumber = 1,
  shippingSectionNumber = 3,
  form,
  shopOptions,
  warehouseOptions,
  shippingPartnerOptions,
  suggestedShopOptions,
  suggestedWarehouseOptions,
  suggestedShippingPartnerOptions,
  recentCustomers,
  customerSearchQuery,
  customerSearchResults,
  selectedCustomerName,
  isSearchingCustomers,
  customerSearchError,
  selectedShopLabel,
  selectedWarehouseLabel,
  selectedShippingPartnerLabel,
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
  isWardRequired,
  isLoadingProvinces,
  isLoadingDistricts,
  isLoadingWards,
  provincesError,
  districtsError,
  wardsError,
  loadError,
  reloadOptions,
  onSelectShop,
  onSelectWarehouse,
  onSelectShippingPartner,
  onChangeCustomerSearchQuery,
  onSelectCustomer,
  onPressCreateCustomer,
  onSelectShippingMethod,
  onChangeRecipientName,
  onChangeRecipientPhone,
  onChangeRecipientAddress,
  onSelectProvince,
  onSelectDistrict,
  onSelectWard,
  onToggleCod,
  onToggleAdvanced,
}: CreateOrderFormProps) {
  const showShippingPartner =
    form.shippingMethod === 'warehouse_partner' ||
    form.shippingMethod === 'seller_partner';
  const isSellerShippingPartner = form.shippingMethod === 'seller_partner';
  const shippingPartnerLabel = isSellerShippingPartner
    ? createOrderCopy.sellerPartnerLabel
    : createOrderCopy.warehousePartnerLabel;

  const showSetup = part === 'all' || part === 'setup';
  const showShipping = part === 'all' || part === 'shipping';

  return (
    <VStack space="md" style={styles.container}>
      {loadError && showSetup ? (
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

      {showSetup ? (
      <Box className={createOrderSectionCardClass}>
        <CreateOrderSectionHeader
          number={setupSectionNumber}
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
            leadingIcon={<Store color={lightTokens.tertiary600} size={18} />}
            suggestedOptions={suggestedShopOptions}
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
            leadingIcon={<Package color={lightTokens.tertiary600} size={18} />}
            suggestedOptions={suggestedWarehouseOptions}
            onSelect={onSelectWarehouse}
          />

          <CreateOrderCustomerSearch
            query={customerSearchQuery}
            selectedCustomerName={selectedCustomerName}
            results={customerSearchResults}
            isSearching={isSearchingCustomers}
            searchError={customerSearchError}
            recentCustomers={recentCustomers}
            onChangeQuery={onChangeCustomerSearchQuery}
            onSelectCustomer={onSelectCustomer}
            onPressCreateCustomer={onPressCreateCustomer}
          />
        </VStack>
      </Box>
      ) : null}

      {showShipping ? (
      <Box className={createOrderSectionCardClass}>
        <CreateOrderSectionHeader
          number={shippingSectionNumber}
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
              suggestedOptions={suggestedShippingPartnerOptions}
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
            leadingIcon={<User color={lightTokens.tertiary600} size={18} />}
          />

          <CreateOrderTextField
            label={createOrderCopy.recipientPhoneLabel}
            required
            value={form.recipientPhone}
            onChangeText={onChangeRecipientPhone}
            keyboardType="phone-pad"
            leadingIcon={<Phone color={lightTokens.tertiary600} size={18} />}
          />

          <CreateOrderTextField
            label={createOrderCopy.recipientAddressLabel}
            required
            value={form.recipientAddress}
            onChangeText={onChangeRecipientAddress}
            leadingIcon={<Home color={lightTokens.tertiary600} size={18} />}
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
            {isWardRequired ? (
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
            ) : null}
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
            leadingIcon={<Truck color={lightTokens.tertiary600} size={18} />}
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
      ) : null}

      {showShipping ? (
        <>
          <Pressable
            onPress={onToggleAdvanced}
            accessibilityRole="button"
            className="flex-row items-center justify-between rounded-xl border border-outline-100 bg-background-0 px-3.5 py-3.5">
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
        </>
      ) : null}
    </VStack>
  );
}

export const CreateOrderForm = memo(CreateOrderFormComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
