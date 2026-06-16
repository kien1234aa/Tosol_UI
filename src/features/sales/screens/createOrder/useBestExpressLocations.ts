import { useEffect, useState } from 'react';
import {
  getBestExpressDistricts,
  getBestExpressProvinces,
  getBestExpressWards,
} from '@services/sales/locationAPI';
import type {
  BestExpressDistrict,
  BestExpressProvince,
  BestExpressWard,
} from '@services/sales/locationApiTypes';

export type UseBestExpressLocationsResult = {
  provinces: BestExpressProvince[];
  provincesLoading: boolean;
  provincesError: string | null;
  districts: BestExpressDistrict[];
  districtsLoading: boolean;
  districtsError: string | null;
  wards: BestExpressWard[];
  wardsLoading: boolean;
  wardsError: string | null;
  provinceId: number | null;
  setProvinceId: React.Dispatch<React.SetStateAction<number | null>>;
  districtId: number | null;
  setDistrictId: React.Dispatch<React.SetStateAction<number | null>>;
  wardId: number | null;
  setWardId: React.Dispatch<React.SetStateAction<number | null>>;
};

/**
 * Quản lý danh sách Tỉnh / Quận / Phường từ Best Express.
 * - Tải lại tỉnh khi `shopId` thay đổi (đổi cửa hàng → reset ngữ cảnh địa chỉ).
 * - Tự động tải quận/phường khi `provinceId` / `districtId` thay đổi.
 * - Expose các setters để component cha có thể đồng bộ địa chỉ từ dữ liệu khách.
 */
export function useBestExpressLocations(
  shopId: number | null,
): UseBestExpressLocationsResult {
  const [provinces, setProvinces] = useState<BestExpressProvince[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [provincesError, setProvincesError] = useState<string | null>(null);
  const [provinceId, setProvinceId] = useState<number | null>(null);

  const [districts, setDistricts] = useState<BestExpressDistrict[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  const [wards, setWards] = useState<BestExpressWard[]>([]);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [wardsError, setWardsError] = useState<string | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);

  useEffect(() => {
    setDistrictId(null);
    setWardId(null);
    setDistricts([]);
    setWards([]);
    setDistrictsError(null);
    setWardsError(null);
    /** Đổi cửa hàng → reset tỉnh (ngữ cảnh đơn). Chưa chọn shop vẫn tải tỉnh để đồng bộ địa chỉ từ khách. */
    if (shopId != null) {
      setProvinceId(null);
    }

    let cancelled = false;
    setProvincesLoading(true);
    setProvincesError(null);

    void getBestExpressProvinces()
      .then(list => {
        if (!cancelled) {
          setProvinces(list);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setProvinces([]);
          setProvincesError(
            e instanceof Error ? e.message : 'Không tải được tỉnh/thành',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProvincesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  useEffect(() => {
    // Xóa danh sách cũ ngay lập tức (stale), nhưng KHÔNG reset ID ngay —
    // auto-fill có thể đang set district/ward đồng thời với province.
    // ID sẽ được validate sau khi danh sách mới load xong.
    setDistricts([]);
    setWards([]);
    setDistrictsError(null);
    setWardsError(null);

    if (provinceId == null) {
      setDistrictId(null);
      setWardId(null);
      setDistrictsLoading(false);
      return;
    }

    const province = provinces.find(p => p.id === provinceId);
    if (!province) {
      setDistrictId(null);
      setWardId(null);
      setDistrictsLoading(false);
      return;
    }

    let cancelled = false;
    setDistrictsLoading(true);
    void getBestExpressDistricts(province.address_id)
      .then(list => {
        if (!cancelled) {
          setDistricts(list);
          // Giữ districtId hiện tại nếu còn hợp lệ trong danh sách tỉnh mới.
          // Điều này tránh race condition khi auto-fill set province+district cùng lúc.
          setDistrictId(prev =>
            prev != null && list.some(d => d.id === prev) ? prev : null,
          );
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setDistricts([]);
          setDistrictId(null);
          setWardId(null);
          setDistrictsError(
            e instanceof Error ? e.message : 'Không tải được quận/huyện',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDistrictsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [provinceId, provinces]);

  useEffect(() => {
    // Xóa danh sách phường cũ, nhưng KHÔNG reset wardId ngay —
    // để tránh race condition tương tự với district (auto-fill set ward sau await).
    setWards([]);
    setWardsError(null);

    if (districtId == null) {
      setWardId(null);
      setWardsLoading(false);
      return;
    }

    const district = districts.find(d => d.id === districtId);
    if (!district) {
      // Danh sách quận có thể đang tải (province vừa đổi) — không reset wardId,
      // effect sẽ chạy lại khi `districts` cập nhật.
      setWardsLoading(false);
      return;
    }

    let cancelled = false;
    setWardsLoading(true);
    void getBestExpressWards(district.address_id)
      .then(list => {
        if (!cancelled) {
          setWards(list);
          // Giữ wardId nếu còn hợp lệ, nếu không thì reset về null.
          setWardId(prev =>
            prev != null && list.some(w => w.id === prev) ? prev : null,
          );
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setWards([]);
          setWardId(null);
          setWardsError(
            e instanceof Error ? e.message : 'Không tải được phường/xã',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setWardsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [districtId, districts]);

  return {
    provinces,
    provincesLoading,
    provincesError,
    districts,
    districtsLoading,
    districtsError,
    wards,
    wardsLoading,
    wardsError,
    provinceId,
    setProvinceId,
    districtId,
    setDistrictId,
    wardId,
    setWardId,
  };
}
