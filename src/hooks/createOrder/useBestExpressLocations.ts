import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bestExpressLocationsService } from '@/src/apis/locations/bestExpressLocations.api';
import { createOrderCopy } from '@/src/configs/createOrder/createOrder.constants';
import {
  bestExpressDistrictByLabel,
  bestExpressRowByLabel,
  isBestExpressWardRequired,
  resolveBestExpressShipmentLocation,
} from '@/src/helpers/createOrder/createOrder.helpers';
import type { CreateOrderSelectOption } from '@/src/types/orders/createOrder.types';
import type {
  BestExpressDistrict,
  BestExpressProvince,
  BestExpressWard,
} from '@/src/types/orders/location.types';

function mapLocationToSelectOption(item: {
  id: number;
  name: string;
}): CreateOrderSelectOption {
  return {
    id: item.id,
    label: item.name,
  };
}

export interface CustomerLocationLabels {
  provinceLabel: string;
  districtLabel: string;
  wardLabel: string;
}

export interface CustomerLocationIds {
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
}

export interface UseBestExpressLocationsResult {
  provinceOptions: CreateOrderSelectOption[];
  districtOptions: CreateOrderSelectOption[];
  wardOptions: CreateOrderSelectOption[];
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
  isWardRequired: boolean;
  selectedProvinceLabel: string;
  selectedDistrictLabel: string;
  selectedWardLabel: string;
  shipmentLocation: {
    province: string;
    district: string;
    ward: string;
  };
  isLoadingProvinces: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;
  provincesError: string | null;
  districtsError: string | null;
  wardsError: string | null;
  onSelectProvince: (provinceId: number) => void;
  onSelectDistrict: (districtId: number) => void;
  onSelectWard: (wardId: number) => void;
  applyCustomerLocationLabels: (
    labels: CustomerLocationLabels,
  ) => Promise<CustomerLocationIds>;
  resetLocations: () => void;
}

export function useBestExpressLocations(
  enabled: boolean,
  shopId: number | null,
): UseBestExpressLocationsResult {
  const [provinces, setProvinces] = useState<BestExpressProvince[]>([]);
  const [districts, setDistricts] = useState<BestExpressDistrict[]>([]);
  const [wards, setWards] = useState<BestExpressWard[]>([]);
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(enabled);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [provincesError, setProvincesError] = useState<string | null>(null);
  const [districtsError, setDistrictsError] = useState<string | null>(null);
  const [wardsError, setWardsError] = useState<string | null>(null);
  const locationSyncRequestId = useRef(0);
  const isApplyingCustomerLocationRef = useRef(false);

  const resetLocations = useCallback(() => {
    setProvinces([]);
    setDistricts([]);
    setWards([]);
    setProvinceId(null);
    setDistrictId(null);
    setWardId(null);
    setIsLoadingProvinces(false);
    setIsLoadingDistricts(false);
    setIsLoadingWards(false);
    setProvincesError(null);
    setDistrictsError(null);
    setWardsError(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      resetLocations();
      return;
    }

    setDistrictId(null);
    setWardId(null);
    setDistricts([]);
    setWards([]);
    setDistrictsError(null);
    setWardsError(null);

    if (shopId != null) {
      setProvinceId(null);
    }

    let cancelled = false;
    setIsLoadingProvinces(true);
    setProvincesError(null);

    void bestExpressLocationsService
      .listProvinces()
      .then(list => {
        if (!cancelled) {
          setProvinces(list);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setProvinces([]);
          setProvincesError(
            error instanceof Error
              ? error.message
              : createOrderCopy.provincesLoadError,
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingProvinces(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, resetLocations, shopId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setDistricts([]);
    setWards([]);
    setDistrictsError(null);
    setWardsError(null);

    if (provinceId == null) {
      setDistrictId(null);
      setWardId(null);
      setIsLoadingDistricts(false);
      return;
    }

    const province = provinces.find(item => item.id === provinceId);
    if (!province) {
      setIsLoadingDistricts(false);
      return;
    }

    if (isApplyingCustomerLocationRef.current) {
      return;
    }

    let cancelled = false;
    setIsLoadingDistricts(true);

    void bestExpressLocationsService
      .listDistricts(province.address_id)
      .then(list => {
        if (!cancelled) {
          setDistricts(list);
          setDistrictId(current =>
            current != null && list.some(item => item.id === current)
              ? current
              : null,
          );
        }
      })
      .catch(error => {
        if (!cancelled) {
          setDistricts([]);
          setDistrictId(null);
          setWardId(null);
          setDistrictsError(
            error instanceof Error
              ? error.message
              : createOrderCopy.districtsLoadError,
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingDistricts(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, provinceId, provinces]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setWards([]);
    setWardsError(null);

    if (districtId == null) {
      setWardId(null);
      setIsLoadingWards(false);
      return;
    }

    const district = districts.find(item => item.id === districtId);
    if (!district) {
      setIsLoadingWards(false);
      return;
    }

    if (!isBestExpressWardRequired(district)) {
      setWardId(null);
      setIsLoadingWards(false);
      return;
    }

    if (isApplyingCustomerLocationRef.current) {
      return;
    }

    let cancelled = false;
    setIsLoadingWards(true);

    void bestExpressLocationsService
      .listWards(district.address_id)
      .then(list => {
        if (!cancelled) {
          setWards(list);
          setWardId(current =>
            current != null && list.some(item => item.id === current)
              ? current
              : null,
          );
        }
      })
      .catch(error => {
        if (!cancelled) {
          setWards([]);
          setWardId(null);
          setWardsError(
            error instanceof Error ? error.message : createOrderCopy.wardsLoadError,
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingWards(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [districtId, districts, enabled]);

  const provinceOptions = useMemo(
    () => provinces.map(mapLocationToSelectOption),
    [provinces],
  );

  const districtOptions = useMemo(
    () => districts.map(mapLocationToSelectOption),
    [districts],
  );

  const wardOptions = useMemo(
    () => wards.map(mapLocationToSelectOption),
    [wards],
  );

  const selectedProvinceLabel = useMemo(() => {
    if (provinceId == null) {
      return createOrderCopy.selectProvince;
    }

    return (
      provinces.find(item => item.id === provinceId)?.name ??
      createOrderCopy.selectProvince
    );
  }, [provinceId, provinces]);

  const selectedDistrictLabel = useMemo(() => {
    if (districtId == null) {
      return createOrderCopy.selectDistrict;
    }

    return (
      districts.find(item => item.id === districtId)?.name ??
      createOrderCopy.selectDistrict
    );
  }, [districtId, districts]);

  const selectedDistrict = useMemo(
    () => districts.find(item => item.id === districtId) ?? null,
    [districtId, districts],
  );

  const isWardRequired = useMemo(
    () => isBestExpressWardRequired(selectedDistrict),
    [selectedDistrict],
  );

  const selectedWardLabel = useMemo(() => {
    if (!isWardRequired && districtId != null) {
      return selectedDistrict?.name ?? createOrderCopy.selectWard;
    }

    if (wardId == null) {
      return createOrderCopy.selectWard;
    }

    return wards.find(item => item.id === wardId)?.name ?? createOrderCopy.selectWard;
  }, [districtId, isWardRequired, selectedDistrict, wardId, wards]);

  const shipmentLocation = useMemo(
    () =>
      resolveBestExpressShipmentLocation({
        provinceLabel: selectedProvinceLabel,
        districtLabel: selectedDistrictLabel,
        wardLabel: selectedWardLabel,
        isWardRequired,
      }),
    [
      isWardRequired,
      selectedDistrictLabel,
      selectedProvinceLabel,
      selectedWardLabel,
    ],
  );

  const onSelectProvince = useCallback((nextProvinceId: number) => {
    setProvinceId(nextProvinceId);
    setDistrictId(null);
    setWardId(null);
    setDistricts([]);
    setWards([]);
    setDistrictsError(null);
    setWardsError(null);
  }, []);

  const onSelectDistrict = useCallback((nextDistrictId: number) => {
    setDistrictId(nextDistrictId);
    setWardId(null);
    setWards([]);
    setWardsError(null);
  }, []);

  const onSelectWard = useCallback((nextWardId: number) => {
    setWardId(nextWardId);
  }, []);

  const applyCustomerLocationLabels = useCallback(
    async (labels: CustomerLocationLabels): Promise<CustomerLocationIds> => {
      const requestId = ++locationSyncRequestId.current;
      const isCancelled = () => requestId !== locationSyncRequestId.current;

      const emptyResult: CustomerLocationIds = {
        provinceId: null,
        districtId: null,
        wardId: null,
      };

      const provinceLabel = labels.provinceLabel.trim();
      const districtLabel = labels.districtLabel.trim();
      const wardLabel = labels.wardLabel.trim();

      if (!provinceLabel && !districtLabel && !wardLabel) {
        isApplyingCustomerLocationRef.current = false;
        setProvinceId(null);
        setDistrictId(null);
        setWardId(null);
        setDistricts([]);
        setWards([]);
        return emptyResult;
      }

      isApplyingCustomerLocationRef.current = true;

      try {
        let provinceList = provinces;
        if (provinceList.length === 0) {
          provinceList = await bestExpressLocationsService.listProvinces();
          if (isCancelled()) {
            return emptyResult;
          }
          setProvinces(provinceList);
        }

        const provinceRow = bestExpressRowByLabel(provinceList, provinceLabel);
        if (!provinceRow) {
          if (!isCancelled()) {
            setProvinceId(null);
            setDistrictId(null);
            setWardId(null);
            setDistricts([]);
            setWards([]);
          }
          return emptyResult;
        }

        let nextDistrictId: number | null = null;
        let nextWardId: number | null = null;
        let nextDistrictList: BestExpressDistrict[] = [];
        let nextWardList: BestExpressWard[] = [];

        if (districtLabel || wardLabel) {
          nextDistrictList = await bestExpressLocationsService.listDistricts(
            provinceRow.address_id,
          );
          if (isCancelled()) {
            return emptyResult;
          }

          const districtRow = bestExpressDistrictByLabel(
            nextDistrictList,
            districtLabel,
            wardLabel,
          );

          if (districtRow) {
            nextDistrictId = districtRow.id;

            if (isBestExpressWardRequired(districtRow) && wardLabel) {
              nextWardList = await bestExpressLocationsService.listWards(
                districtRow.address_id,
              );
              if (isCancelled()) {
                return emptyResult;
              }

              const wardRow = bestExpressRowByLabel(nextWardList, wardLabel);
              nextWardId = wardRow?.id ?? null;
            }
          }
        }

        const result: CustomerLocationIds = {
          provinceId: provinceRow.id,
          districtId: nextDistrictId,
          wardId: nextWardId,
        };

        if (!isCancelled()) {
          setProvinceId(provinceRow.id);
          setDistricts(nextDistrictList);
          setDistrictId(nextDistrictId);
          setWards(nextWardList);
          setWardId(nextWardId);
          setDistrictsError(null);
          setWardsError(null);
          setIsLoadingDistricts(false);
          setIsLoadingWards(false);
        }

        return result;
      } catch {
        if (!isCancelled()) {
          setProvinceId(null);
          setDistrictId(null);
          setWardId(null);
          setDistricts([]);
          setWards([]);
        }
        return emptyResult;
      } finally {
        if (requestId === locationSyncRequestId.current) {
          isApplyingCustomerLocationRef.current = false;
        }
      }
    },
    [provinces],
  );

  return {
    provinceOptions,
    districtOptions,
    wardOptions,
    provinceId,
    districtId,
    wardId,
    isWardRequired,
    selectedProvinceLabel,
    selectedDistrictLabel,
    selectedWardLabel,
    shipmentLocation,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
    provincesError,
    districtsError,
    wardsError,
    onSelectProvince,
    onSelectDistrict,
    onSelectWard,
    applyCustomerLocationLabels,
    resetLocations,
  };
}
