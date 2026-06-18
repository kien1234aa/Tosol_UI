import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cartCopy } from '@/src/configs/cart';
import { mainLayout } from '@/src/configs/main';
import { useCart } from '@/src/hooks/cart';
import {
  CartGroupCard,
  CartHeader,
  CartSummaryBar,
  CreateCustomerModal,
  CreateOrderModal,
} from '@/src/components/cart';
import { Box } from '@/src/uikits/box';
import { Center } from '@/src/uikits/center';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';

export function CartScreen() {
  const cart = useCart();
  const {
    groups,
    grandTotalVnd,
    isAllSelected,
    hasSelectedItems,
    onToggleSelectAll,
    onToggleGroup,
    onToggleProduct,
    onToggleInsurance,
    onToggleWoodPacking,
    onChangeGroupNote,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveProduct,
    onRemoveGroup,
    onCreateOrders,
    onCreateGroupOrder,
  } = cart;

  return (
    <Box className="flex-1 bg-background-50">
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <CartHeader />

        <CartSummaryBar
          grandTotalVnd={grandTotalVnd}
          isAllSelected={isAllSelected}
          canCreateOrders={hasSelectedItems}
          onToggleSelectAll={onToggleSelectAll}
          onCreateOrders={onCreateOrders}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          {groups.length === 0 ? (
            <Center className="py-16">
              <Text size="md" className="text-center text-typography-500">
                {cartCopy.emptyCart}
              </Text>
            </Center>
          ) : (
            <VStack className="w-full" space="md">
              {groups.map(group => (
                <CartGroupCard
                  key={group.id}
                  group={group}
                  onToggleGroup={onToggleGroup}
                  onToggleProduct={onToggleProduct}
                  onToggleInsurance={onToggleInsurance}
                  onToggleWoodPacking={onToggleWoodPacking}
                  onChangeNote={onChangeGroupNote}
                  onIncreaseQuantity={onIncreaseQuantity}
                  onDecreaseQuantity={onDecreaseQuantity}
                  onRemoveProduct={onRemoveProduct}
                  onRemoveGroup={onRemoveGroup}
                  onCreateGroupOrder={onCreateGroupOrder}
                />
              ))}
            </VStack>
          )}
        </ScrollView>
      </SafeAreaView>

      <CreateOrderModal
        visible={cart.visible}
        form={cart.form}
        shopOptions={cart.shopOptions}
        warehouseOptions={cart.warehouseOptions}
        shippingPartnerOptions={cart.shippingPartnerOptions}
        suggestedShopOptions={cart.suggestedShopOptions}
        suggestedWarehouseOptions={cart.suggestedWarehouseOptions}
        suggestedShippingPartnerOptions={cart.suggestedShippingPartnerOptions}
        recentCustomers={cart.recentCustomers}
        selectedShopLabel={cart.selectedShopLabel}
        selectedWarehouseLabel={cart.selectedWarehouseLabel}
        selectedShippingPartnerLabel={cart.selectedShippingPartnerLabel}
        selectedShopBadge={cart.selectedShopBadge}
        orderTotalVnd={cart.orderTotalVnd}
        shippingFeeVnd={cart.shippingFeeVnd}
        isLoadingShippingFee={cart.isLoadingShippingFee}
        shippingEstimateError={cart.shippingEstimateError}
        isLoadingShops={cart.isLoadingShops}
        isLoadingWarehouses={cart.isLoadingWarehouses}
        isLoadingShippingPartners={cart.isLoadingShippingPartners}
        shippingPartnersError={cart.shippingPartnersError}
        provinceOptions={cart.provinceOptions}
        districtOptions={cart.districtOptions}
        wardOptions={cart.wardOptions}
        selectedProvinceLabel={cart.selectedProvinceLabel}
        selectedDistrictLabel={cart.selectedDistrictLabel}
        selectedWardLabel={cart.selectedWardLabel}
        isLoadingProvinces={cart.isLoadingProvinces}
        isLoadingDistricts={cart.isLoadingDistricts}
        isLoadingWards={cart.isLoadingWards}
        provincesError={cart.provincesError}
        districtsError={cart.districtsError}
        wardsError={cart.wardsError}
        loadError={cart.loadError}
        isSubmitting={cart.isSubmitting}
        closeCreateOrder={cart.closeCreateOrder}
        reloadOptions={cart.reloadOptions}
        onSelectShop={cart.onSelectShop}
        onSelectWarehouse={cart.onSelectWarehouse}
        onSelectShippingPartner={cart.onSelectShippingPartner}
        customerSearchQuery={cart.customerSearchQuery}
        customerSearchResults={cart.customerSearchResults}
        selectedCustomerName={cart.selectedCustomerName}
        isSearchingCustomers={cart.isSearchingCustomers}
        customerSearchError={cart.customerSearchError}
        onChangeCustomerSearchQuery={cart.onChangeCustomerSearchQuery}
        onSelectCustomer={cart.onSelectCustomer}
        onPressCreateCustomer={cart.onPressCreateCustomer}
        onSelectShippingMethod={cart.onSelectShippingMethod}
        onChangeRecipientName={cart.onChangeRecipientName}
        onChangeRecipientPhone={cart.onChangeRecipientPhone}
        onChangeRecipientAddress={cart.onChangeRecipientAddress}
        onSelectProvince={cart.onSelectProvince}
        onSelectDistrict={cart.onSelectDistrict}
        onSelectWard={cart.onSelectWard}
        onToggleCod={cart.onToggleCod}
        onToggleAdvanced={cart.onToggleAdvanced}
        onSubmit={cart.onSubmit}
      />

      <CreateCustomerModal
        visible={cart.createCustomer.visible}
        form={cart.createCustomer.form}
        isSubmitting={cart.createCustomer.isSubmitting}
        provinceOptions={cart.createCustomer.provinceOptions}
        districtOptions={cart.createCustomer.districtOptions}
        wardOptions={cart.createCustomer.wardOptions}
        selectedProvinceLabel={cart.createCustomer.selectedProvinceLabel}
        selectedDistrictLabel={cart.createCustomer.selectedDistrictLabel}
        selectedWardLabel={cart.createCustomer.selectedWardLabel}
        isLoadingProvinces={cart.createCustomer.isLoadingProvinces}
        isLoadingDistricts={cart.createCustomer.isLoadingDistricts}
        isLoadingWards={cart.createCustomer.isLoadingWards}
        provincesError={cart.createCustomer.provincesError}
        districtsError={cart.createCustomer.districtsError}
        wardsError={cart.createCustomer.wardsError}
        closeCreateCustomer={cart.createCustomer.closeCreateCustomer}
        onChangeName={cart.createCustomer.onChangeName}
        onChangePhone={cart.createCustomer.onChangePhone}
        onChangeEmail={cart.createCustomer.onChangeEmail}
        onChangeAddress={cart.createCustomer.onChangeAddress}
        onSelectProvince={cart.createCustomer.onSelectProvince}
        onSelectDistrict={cart.createCustomer.onSelectDistrict}
        onSelectWard={cart.createCustomer.onSelectWard}
        onSubmit={cart.createCustomer.onSubmit}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: mainLayout.tabContentBottomPadding,
  },
});
