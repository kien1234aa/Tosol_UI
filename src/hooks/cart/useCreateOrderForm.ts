import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { saleOrdersService } from '@/src/apis/orders/saleOrders.api';
import { customersService } from '@/src/apis/customers/customers.api';
import { shippingRatesService } from '@/src/apis/shipping/shippingRates.api';
import { sellerShippingPartnersService } from '@/src/apis/shipping/sellerShippingPartners.api';
import { sellerWarehousesService } from '@/src/apis/sellers/sellerWarehouses.api';
import { shopsService } from '@/src/apis/shops/shops.api';
import { warehouseShippingPartnersService } from '@/src/apis/warehouses/warehouseShippingPartners.api';
import { customerSearchMinLength } from '@/src/configs/api';
import {
  createOrderCopy,
  createOrderShippingMethods,
  defaultCreateOrderFormState,
  findSelectOptionLabel,
  findShopOptionLabel,
  getWarehouseCodeFromOptions,
  mapCustomerToSearchResult,
  mapShippingPartnerToSelectOption,
  mapShopToSelectOption,
  mapWarehouseToSelectOption,
} from '@/src/configs/cart/createOrder.constants';
import {
  buildShopContextKey,
  buildShippingMethodContextKey,
  buildWarehouseContextKey,
  preferenceKeys,
} from '@/src/configs/preferences/preferences.constants';
import { useAppDispatch } from '@/src/hooks/common/useAppDispatch';
import { useAppSelector } from '@/src/hooks/common/useAppSelector';
import { formatVndPrice } from '@/src/helpers/cart';
import {
  buildCreateOrderPreferenceRecords,
  findSelectOptionById,
} from '@/src/helpers/preferences/createOrderPreferences.helpers';
import {
  customerSearchResultToPreferenceMeta,
  getTopPreferenceId,
  pickSuggestedSelectOptions,
} from '@/src/helpers/preferences/preferences.helpers';
import {
  buildCreateOrderItems,
  buildCreateOrderPayload,
  buildEstimateCartItems,
  buildShippingRateEstimatePayload,
  computeCreateOrderGoodsTotalVnd,
  findBestExpressSellerPartner,
  getOrderedCartProductKeys,
  getWarehouseCodeFromRecords,
  isCreateOrderLocationComplete,
  resolveCreateOrderWarehouseId,
  resolveCustomerLocationLabelsForOrder,
  resolveCustomerRecipientAddress,
} from '@/src/helpers/cart/createOrder.helpers';
import { removeCartProduct, selectCartGroups } from '@/src/redux/cart';
import {
  recordPreference,
  recordPreferencesBatch,
  selectRecentCustomerSuggestions,
  selectPackagingWarehousePreferences,
  selectShippingPartnerPreferences,
  selectShopPreferences,
} from '@/src/redux/preferences';
import {
  selectAuthSeller,
  selectAuthUser,
  selectCurrentWarehouseId,
} from '@/src/redux/login/authSelectors';
import type { CartGroup } from '@/src/types/cart/cart.types';
import type {
  CreateOrderFormState,
  CreateOrderModalContext,
  CreateOrderSelectOption,
  CreateOrderShippingMethod,
  CustomerSearchResult,
  SellerWarehouseApiItem,
  ShopApiItem,
} from '@/src/types/orders/createOrder.types';

import { useBestExpressLocations } from './useBestExpressLocations';
import {
  useCreateCustomerForm,
  type UseCreateCustomerFormResult,
} from './useCreateCustomerForm';

const customerSearchDebounceMs = 350;
const shippingEstimateDebounceMs = 550;

export interface UseCreateOrderFormResult {
  visible: boolean;
  context: CreateOrderModalContext | null;
  form: CreateOrderFormState;
  shopOptions: CreateOrderSelectOption[];
  warehouseOptions: CreateOrderSelectOption[];
  shippingPartnerOptions: CreateOrderSelectOption[];
  suggestedShopOptions: CreateOrderSelectOption[];
  suggestedWarehouseOptions: CreateOrderSelectOption[];
  suggestedShippingPartnerOptions: CreateOrderSelectOption[];
  recentCustomers: CustomerSearchResult[];
  customerSearchQuery: string;
  customerSearchResults: CustomerSearchResult[];
  selectedCustomerName: string | null;
  isSearchingCustomers: boolean;
  customerSearchError: string | null;
  selectedShopLabel: string;
  selectedWarehouseLabel: string;
  selectedShippingPartnerLabel: string;
  selectedShopBadge: string | null;
  orderTotalVnd: number;
  shippingFeeVnd: number;
  isLoadingShippingFee: boolean;
  shippingEstimateError: string | null;
  isLoadingShops: boolean;
  isLoadingWarehouses: boolean;
  isLoadingShippingPartners: boolean;
  shippingPartnersError: string | null;
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
  loadError: string | null;
  isSubmitting: boolean;
  openCreateOrder: (context?: CreateOrderModalContext) => void;
  closeCreateOrder: () => void;
  reloadOptions: () => void;
  onSelectShop: (shopId: number) => void;
  onSelectWarehouse: (warehouseId: number) => void;
  onSelectShippingPartner: (partnerId: number) => void;
  onChangeCustomerSearchQuery: (value: string) => void;
  onSelectCustomer: (customer: CustomerSearchResult) => void;
  onSelectShippingMethod: (method: CreateOrderShippingMethod) => void;
  onChangeRecipientName: (value: string) => void;
  onChangeRecipientPhone: (value: string) => void;
  onChangeRecipientAddress: (value: string) => void;
  onSelectProvince: (provinceId: number) => void;
  onSelectDistrict: (districtId: number) => void;
  onSelectWard: (wardId: number) => void;
  onToggleCod: (value: boolean) => void;
  onToggleAdvanced: () => void;
  onSubmit: () => void;
  createCustomer: UseCreateCustomerFormResult;
  onPressCreateCustomer: () => void;
}

function computeOrderTotalVnd(
  groups: CartGroup[],
  context: CreateOrderModalContext | null,
): number {
  return computeCreateOrderGoodsTotalVnd(groups, context);
}

export function useCreateOrderForm(): UseCreateOrderFormResult {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const seller = useAppSelector(selectAuthSeller);
  const currentWarehouseId = useAppSelector(selectCurrentWarehouseId);
  const groups = useAppSelector(selectCartGroups);
  const shopPreferences = useAppSelector(selectShopPreferences);
  const recentCustomers = useAppSelector(selectRecentCustomerSuggestions);

  const [visible, setVisible] = useState(false);
  const [context, setContext] = useState<CreateOrderModalContext | null>(null);
  const [form, setForm] = useState<CreateOrderFormState>(defaultCreateOrderFormState);
  const [shopRecords, setShopRecords] = useState<ShopApiItem[]>([]);
  const [warehouseRecords, setWarehouseRecords] = useState<SellerWarehouseApiItem[]>([]);
  const [shopOptions, setShopOptions] = useState<CreateOrderSelectOption[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<CreateOrderSelectOption[]>([]);
  const [shippingPartnerOptions, setShippingPartnerOptions] = useState<
    CreateOrderSelectOption[]
  >([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [isLoadingShippingPartners, setIsLoadingShippingPartners] = useState(false);
  const [shippingPartnersError, setShippingPartnersError] = useState<string | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<
    CustomerSearchResult[]
  >([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(
    null,
  );
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(
    null,
  );
  const customerSearchRequestId = useRef(0);
  const shippingPartnersRequestId = useRef(0);
  const shippingEstimateRequestId = useRef(0);
  const [shippingFeeVnd, setShippingFeeVnd] = useState(0);
  const [isLoadingShippingFee, setIsLoadingShippingFee] = useState(false);
  const [shippingEstimateError, setShippingEstimateError] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCustomerRef = useRef<CustomerSearchResult | null>(null);
  const onCustomerCreatedRef = useRef<(customer: CustomerSearchResult) => void>(
    () => {},
  );

  const createCustomer = useCreateCustomerForm(
    form.shopId,
    useCallback((customer: CustomerSearchResult) => {
      onCustomerCreatedRef.current(customer);
    }, []),
  );

  const locations = useBestExpressLocations(visible, form.shopId);

  const selectPackagingWarehousePrefs = useMemo(
    () => selectPackagingWarehousePreferences(form.shopId),
    [form.shopId],
  );
  const selectShippingPartnerPrefs = useMemo(
    () =>
      selectShippingPartnerPreferences(
        form.shippingMethod,
        form.packagingWarehouseId,
      ),
    [form.shippingMethod, form.packagingWarehouseId],
  );

  const packagingWarehousePreferences = useAppSelector(
    selectPackagingWarehousePrefs,
  );
  const shippingPartnerPreferences = useAppSelector(selectShippingPartnerPrefs);

  const suggestedShopOptions = useMemo(
    () => pickSuggestedSelectOptions(shopOptions, shopPreferences),
    [shopOptions, shopPreferences],
  );

  const suggestedWarehouseOptions = useMemo(
    () =>
      pickSuggestedSelectOptions(warehouseOptions, packagingWarehousePreferences),
    [packagingWarehousePreferences, warehouseOptions],
  );

  const suggestedShippingPartnerOptions = useMemo(
    () =>
      pickSuggestedSelectOptions(
        shippingPartnerOptions,
        shippingPartnerPreferences,
      ),
    [shippingPartnerOptions, shippingPartnerPreferences],
  );

  const activeWarehouseId = useMemo(
    () => resolveCreateOrderWarehouseId(currentWarehouseId, form.packagingWarehouseId),
    [currentWarehouseId, form.packagingWarehouseId],
  );

  const resetShippingPartners = useCallback(() => {
    shippingPartnersRequestId.current += 1;
    setShippingPartnerOptions([]);
    setIsLoadingShippingPartners(false);
    setShippingPartnersError(null);
  }, []);

  const resetCustomerSearch = useCallback(() => {
    customerSearchRequestId.current += 1;
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
    setSelectedCustomerName(null);
    setIsSearchingCustomers(false);
    setCustomerSearchError(null);
    selectedCustomerRef.current = null;
  }, []);

  const loadOptions = useCallback(async () => {
    if (!seller?.code) {
      setLoadError(createOrderCopy.loadError);
      return;
    }

    setLoadError(null);
    setIsLoadingShops(true);
    setIsLoadingWarehouses(true);

    try {
      const [shops, warehouses] = await Promise.all([
        shopsService.listActive(),
        sellerWarehousesService.listBySellerCode(seller.code),
      ]);

      setShopRecords(shops);
      setWarehouseRecords(warehouses);
      setShopOptions(shops.map(mapShopToSelectOption));
      setWarehouseOptions(warehouses.map(mapWarehouseToSelectOption));

      setForm(current => {
        const next = { ...current };
        if (next.shopId == null && shops.length > 0) {
          const preferredShopId = getTopPreferenceId(
            shopPreferences,
            shops.map(item => item.id),
          );
          next.shopId = preferredShopId
            ? Number(preferredShopId)
            : shops[0].id;
        }
        if (next.packagingWarehouseId == null) {
          const preferredWarehouseId = getTopPreferenceId(
            packagingWarehousePreferences,
            warehouses.map(item => item.id),
          );
          const fallbackWarehouseId =
            preferredWarehouseId != null
              ? Number(preferredWarehouseId)
              : (warehouses[0]?.id ?? null);
          const resolvedWarehouseId = resolveCreateOrderWarehouseId(
            currentWarehouseId,
            fallbackWarehouseId,
          );
          if (resolvedWarehouseId != null) {
            next.packagingWarehouseId = resolvedWarehouseId;
          }
        }
        if (!next.recipientName && user?.displayName) {
          next.recipientName = user.displayName;
        }
        return next;
      });
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : createOrderCopy.loadError,
      );
    } finally {
      setIsLoadingShops(false);
      setIsLoadingWarehouses(false);
    }
  }, [
    currentWarehouseId,
    packagingWarehousePreferences,
    seller?.code,
    shopPreferences,
    user?.displayName,
  ]);

  useEffect(() => {
    if (visible) {
      void loadOptions();
    }
  }, [visible, loadOptions]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (selectedCustomerName) {
      customerSearchRequestId.current += 1;
      setCustomerSearchResults([]);
      setIsSearchingCustomers(false);
      setCustomerSearchError(null);
      return;
    }

    const trimmed = customerSearchQuery.trim();

    if (trimmed.length < customerSearchMinLength) {
      customerSearchRequestId.current += 1;
      setCustomerSearchResults([]);
      setIsSearchingCustomers(false);
      setCustomerSearchError(null);
      return;
    }

    const requestId = customerSearchRequestId.current + 1;
    customerSearchRequestId.current = requestId;
    setIsSearchingCustomers(true);
    setCustomerSearchError(null);

    const timeoutId = setTimeout(() => {
      void customersService
        .search(trimmed)
        .then(customers => {
          if (customerSearchRequestId.current !== requestId) {
            return;
          }

          setCustomerSearchResults(customers.map(mapCustomerToSearchResult));
        })
        .catch(error => {
          if (customerSearchRequestId.current !== requestId) {
            return;
          }

          setCustomerSearchResults([]);
          setCustomerSearchError(
            error instanceof Error
              ? error.message
              : createOrderCopy.searchCustomerError,
          );
        })
        .finally(() => {
          if (customerSearchRequestId.current === requestId) {
            setIsSearchingCustomers(false);
          }
        });
    }, customerSearchDebounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [customerSearchQuery, selectedCustomerName, visible]);

  useEffect(() => {
    if (!visible || form.shippingMethod === 'customer_pickup') {
      resetShippingPartners();
      return;
    }

    if (form.shippingMethod === 'seller_partner') {
      const requestId = shippingPartnersRequestId.current + 1;
      shippingPartnersRequestId.current = requestId;
      setIsLoadingShippingPartners(true);
      setShippingPartnersError(null);

      void sellerShippingPartnersService
        .listActive()
        .then(partners => {
          if (shippingPartnersRequestId.current !== requestId) {
            return;
          }

          const bestExpress = findBestExpressSellerPartner(partners);
          if (!bestExpress) {
            setShippingPartnerOptions([]);
            setShippingPartnersError(createOrderCopy.shippingPartnersLoadError);
            setForm(current => ({
              ...current,
              warehousePartnerId: null,
            }));
            return;
          }

          const option: CreateOrderSelectOption = {
            id: bestExpress.id,
            label: bestExpress.shipping_partner.name,
            estimatePartnerId: bestExpress.id,
          };

          setShippingPartnerOptions([option]);
          setForm(current => ({
            ...current,
            warehousePartnerId: option.id,
          }));
        })
        .catch(error => {
          if (shippingPartnersRequestId.current !== requestId) {
            return;
          }

          setShippingPartnerOptions([]);
          setShippingPartnersError(
            error instanceof Error
              ? error.message
              : createOrderCopy.shippingPartnersLoadError,
          );
          setForm(current => ({
            ...current,
            warehousePartnerId: null,
          }));
        })
        .finally(() => {
          if (shippingPartnersRequestId.current === requestId) {
            setIsLoadingShippingPartners(false);
          }
        });
      return;
    }

    if (form.packagingWarehouseId == null) {
      resetShippingPartners();
      return;
    }

    const partnerWarehouseId =
      activeWarehouseId ?? form.packagingWarehouseId;

    const warehouseCode =
      getWarehouseCodeFromRecords(warehouseRecords, partnerWarehouseId) ??
      getWarehouseCodeFromOptions(warehouseOptions, partnerWarehouseId);

    if (!warehouseCode) {
      resetShippingPartners();
      return;
    }

    const requestId = shippingPartnersRequestId.current + 1;
    shippingPartnersRequestId.current = requestId;
    setIsLoadingShippingPartners(true);
    setShippingPartnersError(null);

    void warehouseShippingPartnersService
      .listByWarehouseCode(warehouseCode)
      .then(partners => {
        if (shippingPartnersRequestId.current !== requestId) {
          return;
        }

        const options = partners.map(mapShippingPartnerToSelectOption);
        setShippingPartnerOptions(options);

        setForm(current => {
          const hasCurrentSelection = options.some(
            item => item.id === current.warehousePartnerId,
          );

          if (hasCurrentSelection || options.length === 0) {
            return current;
          }

          const preferredPartnerId = getTopPreferenceId(
            shippingPartnerPreferences,
            options.map(item => item.id),
          );

          return {
            ...current,
            warehousePartnerId: preferredPartnerId
              ? Number(preferredPartnerId)
              : options[0].id,
          };
        });
      })
      .catch(error => {
        if (shippingPartnersRequestId.current !== requestId) {
          return;
        }

        setShippingPartnerOptions([]);
        setShippingPartnersError(
          error instanceof Error
            ? error.message
            : createOrderCopy.shippingPartnersLoadError,
        );
        setForm(current => ({
          ...current,
          warehousePartnerId: null,
        }));
      })
      .finally(() => {
        if (shippingPartnersRequestId.current === requestId) {
          setIsLoadingShippingPartners(false);
        }
      });
  }, [
    activeWarehouseId,
    form.packagingWarehouseId,
    form.shippingMethod,
    resetShippingPartners,
    shippingPartnerPreferences,
    visible,
    warehouseOptions,
    warehouseRecords,
  ]);

  const openCreateOrder = useCallback(
    (nextContext?: CreateOrderModalContext) => {
      setContext(nextContext ?? null);
      resetCustomerSearch();
      resetShippingPartners();
      setShippingFeeVnd(0);
      setShippingEstimateError(null);
      setIsLoadingShippingFee(false);
      setForm({
        ...defaultCreateOrderFormState,
        recipientName: user?.displayName ?? '',
        packagingWarehouseId: resolveCreateOrderWarehouseId(currentWarehouseId, null),
      });
      setVisible(true);
    },
    [currentWarehouseId, resetCustomerSearch, resetShippingPartners, user?.displayName],
  );

  const closeCreateOrder = useCallback(() => {
    setVisible(false);
    setContext(null);
    setForm(defaultCreateOrderFormState);
    setLoadError(null);
    resetCustomerSearch();
    resetShippingPartners();
    setShippingFeeVnd(0);
    setShippingEstimateError(null);
    setIsLoadingShippingFee(false);
  }, [resetCustomerSearch, resetShippingPartners]);

  const selectedShopLabel = useMemo(
    () => findShopOptionLabel(shopOptions, form.shopId),
    [form.shopId, shopOptions],
  );

  const selectedWarehouseLabel = useMemo(
    () =>
      findSelectOptionLabel(
        warehouseOptions,
        form.packagingWarehouseId,
        createOrderCopy.selectWarehouse,
      ),
    [form.packagingWarehouseId, warehouseOptions],
  );

  const selectedShippingPartnerLabel = useMemo(
    () =>
      findSelectOptionLabel(
        shippingPartnerOptions,
        form.warehousePartnerId,
        createOrderCopy.selectPartner,
      ),
    [form.warehousePartnerId, shippingPartnerOptions],
  );

  const selectedShopBadge = useMemo(() => {
    if (form.shopId == null) {
      return null;
    }

    return shopOptions.find(item => item.id === form.shopId)?.label ?? null;
  }, [form.shopId, shopOptions]);

  const orderTotalVnd = useMemo(() => {
    const goodsTotalVnd = computeOrderTotalVnd(groups, context);
    return goodsTotalVnd + shippingFeeVnd;
  }, [context, groups, shippingFeeVnd]);

  useEffect(() => {
    if (!visible || form.shippingMethod === 'customer_pickup') {
      shippingEstimateRequestId.current += 1;
      setShippingFeeVnd(0);
      setShippingEstimateError(null);
      setIsLoadingShippingFee(false);
      return;
    }

    const estimateItems = buildEstimateCartItems(groups, context);
    const goodsTotalVnd = computeCreateOrderGoodsTotalVnd(groups, context);

    const toProvince = locations.selectedProvinceLabel;
    const toDistrict = locations.selectedDistrictLabel;
    const toWard = locations.selectedWardLabel;

    const hasLocation =
      form.provinceId != null &&
      form.districtId != null &&
      form.wardId != null &&
      toProvince !== createOrderCopy.selectProvince &&
      toDistrict !== createOrderCopy.selectDistrict &&
      toWard !== createOrderCopy.selectWard;

    const estimatePayload =
      activeWarehouseId != null &&
      hasLocation &&
      estimateItems.length > 0 &&
      form.warehousePartnerId != null
        ? buildShippingRateEstimatePayload({
            form,
            toProvince,
            toDistrict,
            toWard,
            items: estimateItems,
            activeWarehouseId,
            shippingPartnerOptions,
            goodsTotalVnd,
          })
        : null;

    if (estimatePayload == null) {
      shippingEstimateRequestId.current += 1;
      setShippingFeeVnd(0);
      setShippingEstimateError(null);
      setIsLoadingShippingFee(false);
      return;
    }

    const requestId = shippingEstimateRequestId.current + 1;
    shippingEstimateRequestId.current = requestId;

    const timeoutId = setTimeout(() => {
      if (shippingEstimateRequestId.current !== requestId) {
        return;
      }

      setIsLoadingShippingFee(true);
      setShippingEstimateError(null);

      void shippingRatesService
        .estimateCost(estimatePayload)
        .then(result => {
          if (shippingEstimateRequestId.current !== requestId) {
            return;
          }

          setShippingFeeVnd(result.shipping_fee ?? result.total_fee ?? 0);
        })
        .catch(error => {
          if (shippingEstimateRequestId.current !== requestId) {
            return;
          }

          setShippingFeeVnd(0);
          setShippingEstimateError(
            error instanceof Error
              ? error.message
              : createOrderCopy.shippingEstimateError,
          );
        })
        .finally(() => {
          if (shippingEstimateRequestId.current === requestId) {
            setIsLoadingShippingFee(false);
          }
        });
    }, shippingEstimateDebounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    activeWarehouseId,
    context,
    form.districtId,
    form.isCodEnabled,
    form.provinceId,
    form.shippingMethod,
    form.wardId,
    form.warehousePartnerId,
    groups,
    locations.selectedDistrictLabel,
    locations.selectedProvinceLabel,
    locations.selectedWardLabel,
    shippingPartnerOptions,
    visible,
  ]);

  const onSelectShop = useCallback(
    (shopId: number) => {
      setForm(current => ({ ...current, shopId }));
      const option = findSelectOptionById(shopOptions, shopId);
      if (option) {
        dispatch(
          recordPreference({
            key: preferenceKeys.shop,
            id: shopId,
            label: option.label,
          }),
        );
      }
    },
    [dispatch, shopOptions],
  );

  const onSelectWarehouse = useCallback(
    (warehouseId: number) => {
      setForm(current => {
        const option = findSelectOptionById(warehouseOptions, warehouseId);
        if (option) {
          dispatch(
            recordPreference({
              key: preferenceKeys.packagingWarehouse,
              id: warehouseId,
              label: option.label,
              subtitle: option.subtitle,
            }),
          );

          if (current.shopId != null) {
            dispatch(
              recordPreference({
                key: preferenceKeys.packagingWarehouse,
                id: warehouseId,
                label: option.label,
                subtitle: option.subtitle,
                contextKey: buildShopContextKey(current.shopId),
              }),
            );
          }
        }

        return {
          ...current,
          packagingWarehouseId: warehouseId,
          warehousePartnerId: null,
        };
      });
    },
    [dispatch, warehouseOptions],
  );

  const onSelectShippingPartner = useCallback(
    (partnerId: number) => {
      setForm(current => ({ ...current, warehousePartnerId: partnerId }));
      const option = findSelectOptionById(shippingPartnerOptions, partnerId);
      if (option) {
        dispatch(
          recordPreference({
            key: preferenceKeys.shippingPartner,
            id: partnerId,
            label: option.label,
            subtitle: option.subtitle,
            contextKey:
              form.packagingWarehouseId != null
                ? buildWarehouseContextKey(form.packagingWarehouseId)
                : buildShippingMethodContextKey(form.shippingMethod),
          }),
        );
      }
    },
    [
      dispatch,
      form.packagingWarehouseId,
      form.shippingMethod,
      shippingPartnerOptions,
    ],
  );

  const onChangeCustomerSearchQuery = useCallback((value: string) => {
    setCustomerSearchQuery(value);
    setSelectedCustomerName(null);
    setForm(current => ({
      ...current,
      customerId: null,
    }));
  }, []);

  const onSelectCustomer = useCallback(
    (customer: CustomerSearchResult) => {
      customerSearchRequestId.current += 1;
      setSelectedCustomerName(customer.name);
      setCustomerSearchQuery(customer.name);
      setCustomerSearchResults([]);
      setCustomerSearchError(null);
      setIsSearchingCustomers(false);
      selectedCustomerRef.current = customer;

      dispatch(
        recordPreference({
          key: preferenceKeys.customer,
          id: customer.id,
          label: customer.name,
          subtitle: customer.phone,
          meta: customerSearchResultToPreferenceMeta(customer),
        }),
      );

      const recipientAddress = resolveCustomerRecipientAddress(customer);
      let skipLocationSync = false;

      setForm(current => {
        skipLocationSync = current.shippingMethod === 'customer_pickup';
        return {
          ...current,
          customerId: customer.id,
          recipientName: customer.name,
          recipientPhone: customer.phone,
          recipientAddress,
        };
      });

      if (skipLocationSync) {
        return;
      }

      const labels = resolveCustomerLocationLabelsForOrder(customer);
      void locations.applyCustomerLocationLabels(labels).then(locationIds => {
        setForm(current => ({
          ...current,
          provinceId: locationIds.provinceId,
          districtId: locationIds.districtId,
          wardId: locationIds.wardId,
        }));
      });
    },
    [dispatch, locations],
  );

  onCustomerCreatedRef.current = onSelectCustomer;

  const onSelectShippingMethod = useCallback(
    (method: CreateOrderShippingMethod) => {
      setForm(current => ({
        ...current,
        shippingMethod: method,
        warehousePartnerId:
          method === 'customer_pickup' ? null : current.warehousePartnerId,
      }));

      const label =
        createOrderShippingMethods.find(item => item.value === method)?.label ??
        method;

      dispatch(
        recordPreference({
          key: preferenceKeys.shippingMethod,
          id: method,
          label,
        }),
      );
    },
    [dispatch],
  );

  const onChangeRecipientName = useCallback((value: string) => {
    setForm(current => ({ ...current, recipientName: value }));
  }, []);

  const onChangeRecipientPhone = useCallback((value: string) => {
    setForm(current => ({ ...current, recipientPhone: value }));
  }, []);

  const onChangeRecipientAddress = useCallback((value: string) => {
    setForm(current => ({ ...current, recipientAddress: value }));
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

  const onToggleCod = useCallback((value: boolean) => {
    setForm(current => ({ ...current, isCodEnabled: value }));
  }, []);

  const onToggleAdvanced = useCallback(() => {
    setForm(current => ({ ...current, isAdvancedOpen: !current.isAdvancedOpen }));
  }, []);

  const onSubmit = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (form.shopId == null) {
      Alert.alert(createOrderCopy.title, createOrderCopy.shopRequired);
      return;
    }

    if (form.packagingWarehouseId == null) {
      Alert.alert(createOrderCopy.title, createOrderCopy.warehouseRequired);
      return;
    }

    if (form.customerId == null) {
      Alert.alert(createOrderCopy.title, createOrderCopy.customerRequired);
      return;
    }

    const orderItems = buildCreateOrderItems(groups, context);
    if (orderItems.length === 0) {
      Alert.alert(createOrderCopy.title, createOrderCopy.itemsRequired);
      return;
    }

    if (!form.recipientName.trim()) {
      Alert.alert(createOrderCopy.title, createOrderCopy.recipientNameRequired);
      return;
    }

    if (!form.recipientPhone.trim()) {
      Alert.alert(createOrderCopy.title, createOrderCopy.recipientPhoneRequired);
      return;
    }

    if (
      form.shippingMethod !== 'customer_pickup' &&
      !form.recipientAddress.trim()
    ) {
      Alert.alert(createOrderCopy.title, createOrderCopy.recipientAddressRequired);
      return;
    }

    if (
      (form.shippingMethod === 'warehouse_partner' ||
        form.shippingMethod === 'seller_partner') &&
      form.warehousePartnerId == null
    ) {
      Alert.alert(createOrderCopy.title, createOrderCopy.partnerRequired);
      return;
    }

    if (
      !isCreateOrderLocationComplete(
        form,
        locations.selectedProvinceLabel,
        locations.selectedDistrictLabel,
        locations.selectedWardLabel,
      )
    ) {
      Alert.alert(createOrderCopy.title, createOrderCopy.locationRequired);
      return;
    }

    if (activeWarehouseId == null) {
      Alert.alert(createOrderCopy.title, createOrderCopy.searchWarehouseRequired);
      return;
    }

    const shop = shopRecords.find(item => item.id === form.shopId);
    const packingWarehouse = warehouseRecords.find(
      item => item.id === activeWarehouseId,
    );

    if (!shop || !packingWarehouse) {
      Alert.alert(createOrderCopy.title, createOrderCopy.loadError);
      return;
    }

    const payload = buildCreateOrderPayload({
      form,
      shop,
      warehouseId: activeWarehouseId,
      packingWarehouse,
      groups,
      context,
      shippingPartnerOptions,
      provinceLabel: locations.selectedProvinceLabel,
      districtLabel: locations.selectedDistrictLabel,
      wardLabel: locations.selectedWardLabel,
      shippingFeeVnd,
    });

    setIsSubmitting(true);

    void saleOrdersService
      .create(payload)
      .then(created => {
        const orderedProductKeys = getOrderedCartProductKeys(groups, context);
        orderedProductKeys.forEach(item => {
          dispatch(removeCartProduct(item));
        });

        const totalVnd = Math.round(Number(created.total) || orderTotalVnd);

        dispatch(
          recordPreferencesBatch(
            buildCreateOrderPreferenceRecords({
              form,
              shopLabel: selectedShopLabel,
              warehouseLabel: selectedWarehouseLabel,
              shippingPartnerLabel: selectedShippingPartnerLabel,
              customer: selectedCustomerRef.current,
              provinceLabel: locations.selectedProvinceLabel,
              districtLabel: locations.selectedDistrictLabel,
              wardLabel: locations.selectedWardLabel,
            }),
          ),
        );

        Alert.alert(
          createOrderCopy.submitSuccessTitle,
          `${createOrderCopy.submitSuccessPrefix}${created.order_number}\n${createOrderCopy.submitSuccessTotalLabel}${formatVndPrice(totalVnd)}`,
        );
        closeCreateOrder();
      })
      .catch(error => {
        Alert.alert(
          createOrderCopy.title,
          error instanceof Error ? error.message : createOrderCopy.submitError,
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [
    activeWarehouseId,
    closeCreateOrder,
    context,
    dispatch,
    form,
    groups,
    isSubmitting,
    locations.selectedDistrictLabel,
    locations.selectedProvinceLabel,
    locations.selectedWardLabel,
    orderTotalVnd,
    shippingFeeVnd,
    shippingPartnerOptions,
    shopRecords,
    selectedShopLabel,
    selectedWarehouseLabel,
    selectedShippingPartnerLabel,
    warehouseRecords,
  ]);

  return {
    visible,
    context,
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
    selectedShopBadge,
    orderTotalVnd,
    shippingFeeVnd,
    isLoadingShippingFee,
    shippingEstimateError,
    isLoadingShops,
    isLoadingWarehouses,
    isLoadingShippingPartners,
    shippingPartnersError,
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
    loadError,
    isSubmitting,
    openCreateOrder,
    closeCreateOrder,
    reloadOptions: loadOptions,
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
    createCustomer,
    onPressCreateCustomer: createCustomer.openCreateCustomer,
  };
}
