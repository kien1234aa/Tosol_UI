import React, { memo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Check, Home, Mail, Phone, User, UserPlus, X } from 'lucide-react-native';
import { createOrderCopy } from '@/src/configs/cart/createOrder.constants';
import { createCustomerCopy } from '@/src/configs/cart/createCustomer.constants';
import { lightTokens } from '@/src/configs/theme';
import type { UseCreateCustomerFormResult } from '@/src/hooks/cart/useCreateCustomerForm';
import { Box } from '@/src/uikits/box';
import { Button, ButtonSpinner, ButtonText } from '@/src/uikits/button';
import { HStack } from '@/src/uikits/hstack';
import { Pressable } from '@/src/uikits/pressable';
import { Text } from '@/src/uikits/text';
import { VStack } from '@/src/uikits/vstack';
import { CreateOrderTextField } from './createOrderFormFields';
import { CreateOrderSelectField } from './CreateOrderSelectField';

type CreateCustomerModalProps = Pick<
  UseCreateCustomerFormResult,
  | 'visible'
  | 'form'
  | 'isSubmitting'
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
  | 'closeCreateCustomer'
  | 'onChangeName'
  | 'onChangePhone'
  | 'onChangeEmail'
  | 'onChangeAddress'
  | 'onSelectProvince'
  | 'onSelectDistrict'
  | 'onSelectWard'
  | 'onSubmit'
>;

function CreateCustomerModalComponent({
  visible,
  form,
  isSubmitting,
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
  closeCreateCustomer,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  onChangeAddress,
  onSelectProvince,
  onSelectDistrict,
  onSelectWard,
  onSubmit,
}: CreateCustomerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeCreateCustomer}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RNPressable style={styles.overlay} onPress={closeCreateCustomer}>
          <RNPressable style={styles.sheet} onPress={() => {}}>
            <HStack className="mb-4 items-center justify-between">
              <HStack className="items-center gap-2.5">
                <Box className="h-9 w-9 items-center justify-center rounded-full bg-tertiary-50">
                  <UserPlus color={lightTokens.tertiary600} size={18} />
                </Box>
                <Text size="md" className="font-bold text-typography-900">
                  {createCustomerCopy.title}
                </Text>
              </HStack>
              <Pressable
                onPress={closeCreateCustomer}
                accessibilityRole="button"
                accessibilityLabel={createCustomerCopy.cancel}
                className="h-8 w-8 items-center justify-center rounded-full bg-background-50">
                <X color={lightTokens.typography500} size={18} />
              </Pressable>
            </HStack>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}>
              <VStack space="lg">
                <CreateOrderTextField
                  label={createCustomerCopy.nameLabel}
                  required
                  value={form.name}
                  onChangeText={onChangeName}
                  placeholder={createCustomerCopy.namePlaceholder}
                  leadingIcon={
                    <User color={lightTokens.tertiary600} size={18} />
                  }
                />

                <CreateOrderTextField
                  label={createCustomerCopy.phoneLabel}
                  required
                  value={form.phone}
                  onChangeText={onChangePhone}
                  keyboardType="phone-pad"
                  placeholder={createCustomerCopy.phonePlaceholder}
                  leadingIcon={
                    <Phone color={lightTokens.tertiary600} size={18} />
                  }
                />

                <CreateOrderTextField
                  label={createCustomerCopy.emailLabel}
                  value={form.email}
                  onChangeText={onChangeEmail}
                  placeholder={createCustomerCopy.emailPlaceholder}
                  leadingIcon={
                    <Mail color={lightTokens.tertiary600} size={18} />
                  }
                />

                <CreateOrderTextField
                  label={createCustomerCopy.addressLabel}
                  value={form.address}
                  onChangeText={onChangeAddress}
                  placeholder={createCustomerCopy.addressPlaceholder}
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
              </VStack>
            </ScrollView>

            <HStack className="mt-4 justify-end gap-2.5">
              <Button
                size="md"
                action="default"
                variant="outline"
                className="h-10 rounded-xl border-outline-200 bg-background-0 px-4"
                onPress={closeCreateCustomer}
                isDisabled={isSubmitting}>
                <ButtonText className="font-semibold text-typography-700">
                  {createCustomerCopy.cancel}
                </ButtonText>
              </Button>

              <Button
                size="md"
                action="default"
                variant="solid"
                className="h-10 rounded-xl border-0 bg-tertiary-500 px-4"
                isDisabled={isSubmitting}
                onPress={onSubmit}>
                {isSubmitting ? (
                  <ButtonSpinner color={lightTokens.typography0} />
                ) : (
                  <>
                    <Check color={lightTokens.typography0} size={16} />
                    <ButtonText className="font-semibold text-typography-0">
                      {createCustomerCopy.submit}
                    </ButtonText>
                  </>
                )}
              </Button>
            </HStack>
          </RNPressable>
        </RNPressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const CreateCustomerModal = memo(CreateCustomerModalComponent);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    maxHeight: '88%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: lightTokens.background0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightTokens.outline100,
  },
  scroll: {
    maxHeight: 460,
  },
});
