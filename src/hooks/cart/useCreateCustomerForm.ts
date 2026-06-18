import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { customersService } from '@/src/apis/customers/customers.api';
import { createOrderCopy, mapCustomerToSearchResult } from '@/src/configs/cart/createOrder.constants';
import {
  createCustomerCopy,
  defaultCreateCustomerFormState,
} from '@/src/configs/cart/createCustomer.constants';
import type { CreateCustomerFormState } from '@/src/types/customers/customer.types';
import type { CreateOrderSelectOption } from '@/src/types/orders/createOrder.types';
import type { CustomerSearchResult } from '@/src/types/orders/createOrder.types';

import { useBestExpressLocations } from './useBestExpressLocations';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildCreateCustomerPayload(
  form: CreateCustomerFormState,
  provinceLabel: string,
  districtLabel: string,
  wardLabel: string,
) {
  const province =
    provinceLabel !== createOrderCopy.selectProvince ? provinceLabel.trim() : null;
  const district =
    districtLabel !== createOrderCopy.selectDistrict ? districtLabel.trim() : null;
  const ward = wardLabel !== createOrderCopy.selectWard ? wardLabel.trim() : null;

  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim() || null,
    address: form.address.trim() || null,
    province,
    district,
    ward,
  };
}

export interface UseCreateCustomerFormResult {
  visible: boolean;
  form: CreateCustomerFormState;
  isSubmitting: boolean;
  provinceOptions: CreateOrderSelectOption[];
  districtOptions: CreateOrderSelectOption[];
  wardOptions: CreateOrderSelectOption[];
  selectedProvinceLabel: string;
  selectedDistrictLabel: string;
  selectedWardLabel: string;
  isLoadingProvinces: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;
  provincesError: string | null;
  districtsError: string | null;
  wardsError: string | null;
  openCreateCustomer: () => void;
  closeCreateCustomer: () => void;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onSelectProvince: (provinceId: number) => void;
  onSelectDistrict: (districtId: number) => void;
  onSelectWard: (wardId: number) => void;
  onSubmit: () => void;
}

export function useCreateCustomerForm(
  shopId: number | null,
  onCreated: (customer: CustomerSearchResult) => void,
): UseCreateCustomerFormResult {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<CreateCustomerFormState>(
    defaultCreateCustomerFormState,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locations = useBestExpressLocations(visible, shopId);

  const resetForm = useCallback(() => {
    setForm(defaultCreateCustomerFormState);
    locations.resetLocations();
  }, [locations.resetLocations]);

  const openCreateCustomer = useCallback(() => {
    resetForm();
    setVisible(true);
  }, [resetForm]);

  const closeCreateCustomer = useCallback(() => {
    setVisible(false);
    setForm(defaultCreateCustomerFormState);
    locations.resetLocations();
  }, [locations.resetLocations]);

  const onChangeName = useCallback((value: string) => {
    setForm(current => ({ ...current, name: value }));
  }, []);

  const onChangePhone = useCallback((value: string) => {
    setForm(current => ({ ...current, phone: value }));
  }, []);

  const onChangeEmail = useCallback((value: string) => {
    setForm(current => ({ ...current, email: value }));
  }, []);

  const onChangeAddress = useCallback((value: string) => {
    setForm(current => ({ ...current, address: value }));
  }, []);

  const onSelectProvince = useCallback(
    (provinceId: number) => {
      locations.onSelectProvince(provinceId);
      setForm(current => ({
        ...current,
        provinceId,
        districtId: null,
        wardId: null,
      }));
    },
    [locations],
  );

  const onSelectDistrict = useCallback(
    (districtId: number) => {
      locations.onSelectDistrict(districtId);
      setForm(current => ({
        ...current,
        districtId,
        wardId: null,
      }));
    },
    [locations],
  );

  const onSelectWard = useCallback(
    (wardId: number) => {
      locations.onSelectWard(wardId);
      setForm(current => ({ ...current, wardId }));
    },
    [locations],
  );

  const onSubmit = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) {
      Alert.alert(createCustomerCopy.title, createCustomerCopy.nameRequired);
      return;
    }

    if (!trimmedPhone) {
      Alert.alert(createCustomerCopy.title, createCustomerCopy.phoneRequired);
      return;
    }

    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
      Alert.alert(createCustomerCopy.title, createCustomerCopy.emailInvalid);
      return;
    }

    const payload = buildCreateCustomerPayload(
      form,
      locations.selectedProvinceLabel,
      locations.selectedDistrictLabel,
      locations.selectedWardLabel,
    );

    setIsSubmitting(true);

    void customersService
      .create(payload)
      .then(customer => {
        const result = mapCustomerToSearchResult(customer);
        onCreated(result);
        closeCreateCustomer();
        Alert.alert(createCustomerCopy.submitSuccessTitle, result.name);
      })
      .catch(error => {
        Alert.alert(
          createCustomerCopy.title,
          error instanceof Error ? error.message : createCustomerCopy.submitError,
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [
    closeCreateCustomer,
    form,
    isSubmitting,
    locations.selectedDistrictLabel,
    locations.selectedProvinceLabel,
    locations.selectedWardLabel,
    onCreated,
  ]);

  return {
    visible,
    form,
    isSubmitting,
    provinceOptions: locations.provinceOptions,
    districtOptions: locations.districtOptions,
    wardOptions: locations.wardOptions,
    selectedProvinceLabel: locations.selectedProvinceLabel,
    selectedDistrictLabel: locations.selectedDistrictLabel,
    selectedWardLabel: locations.selectedWardLabel,
    isLoadingProvinces: locations.isLoadingProvinces,
    isLoadingDistricts: locations.isLoadingDistricts,
    isLoadingWards: locations.isLoadingWards,
    provincesError: locations.provincesError,
    districtsError: locations.districtsError,
    wardsError: locations.wardsError,
    openCreateCustomer,
    closeCreateCustomer,
    onChangeName,
    onChangePhone,
    onChangeEmail,
    onChangeAddress,
    onSelectProvince,
    onSelectDistrict,
    onSelectWard,
    onSubmit,
  };
}
