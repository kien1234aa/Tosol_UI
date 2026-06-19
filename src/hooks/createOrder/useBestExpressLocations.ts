import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bestExpressLocationsService } from '@/src/apis/locations/bestExpressLocations.api';
import { createOrderCopy } from '@/src/configs/createOrder/createOrder.constants';
import {
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

function findLeafDistrictByLabel(
  districtList: BestExpressDistrict[],
  label: string,
): BestExpressDistrict | undefined {
  const target = label.trim();
  if (!target) {
    return undefined;
  }

  return districtList.find(
    district =>
      district.children_count === 0 &&
      bestExpressRowByLabel([district], target) != null,
  );
}

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

  const clearDistrictAndWard = useCallback(() => {
    setDistrictId(null);
    setWardId(null);
    setDistricts([]);
    setWards([]);
    setDistrictsError(null);
    setWardsError(null);
  }, []);

  const clearWard = useCallback(() => {
    setWardId(null);
    setWards([]);
    setWardsError(null);
  }, []);

  const [prevEnabled, setPrevEnabled] = useState(enabled);
  const [prevShopId, setPrevShopId] = useState(shopId);
  const [prevProvinceId, setPrevProvinceId] = useState(provinceId);
  const [prevDistrictId, setPrevDistrictId] = useState(districtId);

  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    if (!enabled) {
      resetLocations();
    } else {
      setPrevShopId(shopId);
      setPrevProvinceId(provinceId);
      setPrevDistrictId(districtId);
      setIsLoadingProvinces(true);
      setProvincesError(null);
    }
  }

  if (enabled && shopId !== prevShopId) {
    setPrevShopId(shopId);
    clearDistrictAndWard();
    if (shopId != null) {
      setProvinceId(null);
      setPrevProvinceId(null);
    }
    setIsLoadingProvinces(true);
    setProvincesError(null);
  }

  if (enabled && provinceId !== prevProvinceId) {
    setPrevProvinceId(provinceId);
    if (provinceId == null) {
      clearDistrictAndWard();
      setIsLoadingDistricts(false);
    } else {
      setIsLoadingDistricts(true);
    }
  }

  if (enabled && districtId !== prevDistrictId) {
    setPrevDistrictId(districtId);
    if (districtId == null) {
      clearWard();
      setIsLoadingWards(false);
    } else {
      setIsLoadingWards(true);
    }
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

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
  }, [enabled, shopId]);

  useEffect(() => {
    if (!enabled || provinceId == null) {
      return;
    }

    const province = provinces.find(item => item.id === provinceId);
    if (!province) {
      return;
    }

    let cancelled = false;

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
    if (!enabled || districtId == null) {
      return;
    }

    const district = districts.find(item => item.id === districtId);
    if (!district) {
      return;
    }

    if (!isBestExpressWardRequired(district)) {
      setWards([]);
      setWardId(null);
      setWardsError(null);
      setIsLoadingWards(false);
      return;
    }

    let cancelled = false;

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
      return (
        selectedDistrict?.name ?? createOrderCopy.selectWard
      );
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

  const onSelectProvince = useCallback(
    (nextProvinceId: number) => {
      setProvinceId(nextProvinceId);
      clearDistrictAndWard();
    },
    [clearDistrictAndWard],
  );

  const onSelectDistrict = useCallback(
    (nextDistrictId: number) => {
      setDistrictId(nextDistrictId);
      clearWard();
    },
    [clearWard],
  );

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
        setProvinceId(null);
        clearDistrictAndWard();
        return emptyResult;
      }

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
            clearDistrictAndWard();
          }
          return emptyResult;
        }

        if (!isCancelled()) {
          setProvinceId(provinceRow.id);
          clearDistrictAndWard();
        }

        if (!districtLabel && !wardLabel) {
          return { provinceId: provinceRow.id, districtId: null, wardId: null };
        }

        const districtList = await bestExpressLocationsService.listDistricts(
          provinceRow.address_id,
        );
        if (isCancelled()) {
          return emptyResult;
        }

        if (!districtLabel && wardLabel) {
          const leafDistrict = findLeafDistrictByLabel(districtList, wardLabel);
          if (leafDistrict) {
            if (!isCancelled()) {
              setDistricts(districtList);
              setDistrictId(leafDistrict.id);
              clearWard();
            }
            return {
              provinceId: provinceRow.id,
              districtId: leafDistrict.id,
              wardId: null,
            };
          }
        }

        const districtRow = districtLabel
          ? bestExpressRowByLabel(districtList, districtLabel)
          : undefined;

        if (!districtRow) {
          const leafFromWard = wardLabel
            ? findLeafDistrictByLabel(districtList, wardLabel)
            : undefined;

          if (leafFromWard) {
            if (!isCancelled()) {
              setDistricts(districtList);
              setDistrictId(leafFromWard.id);
              clearWard();
            }
            return {
              provinceId: provinceRow.id,
              districtId: leafFromWard.id,
              wardId: null,
            };
          }

          if (!isCancelled()) {
            clearWard();
            setDistrictId(null);
          }
          return { provinceId: provinceRow.id, districtId: null, wardId: null };
        }

        if (!isCancelled()) {
          setDistricts(districtList);
          setDistrictId(districtRow.id);
          clearWard();
        }

        if (!isBestExpressWardRequired(districtRow)) {
          return {
            provinceId: provinceRow.id,
            districtId: districtRow.id,
            wardId: null,
          };
        }

        if (!wardLabel) {
          return {
            provinceId: provinceRow.id,
            districtId: districtRow.id,
            wardId: null,
          };
        }

        const wardList = await bestExpressLocationsService.listWards(
          districtRow.address_id,
        );
        if (isCancelled()) {
          return emptyResult;
        }

        const wardRow = bestExpressRowByLabel(wardList, wardLabel);
        if (!isCancelled()) {
          setWards(wardList);
          setWardId(wardRow?.id ?? null);
        }

        return {
          provinceId: provinceRow.id,
          districtId: districtRow.id,
          wardId: wardRow?.id ?? null,
        };
      } catch {
        if (!isCancelled()) {
          setProvinceId(null);
          clearDistrictAndWard();
        }
        return emptyResult;
      }
    },
    [clearDistrictAndWard, clearWard, provinces],
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
