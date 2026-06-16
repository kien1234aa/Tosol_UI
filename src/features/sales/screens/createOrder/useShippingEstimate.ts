import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  estimateShippingCost,
  fetchSellerShippingPartners,
  fetchWarehouseShippingPartners,
} from '@services/settings/shipPartnerAPI';
import type {
  SellerShippingPartnerApi,
  ShippingEstimateData,
  WarehouseShippingPartnerApi,
} from '@services/settings/shipApiTypes';
import { findBestExpressSellerPartnerRow } from '@services/settings/shipApiTypes';
import type {
  BestExpressDistrict,
  BestExpressProvince,
  BestExpressWard,
} from '@services/sales/locationApiTypes';
import type { ShippingMode, OrderLineRow } from './createOrderUtils';

export type UseShippingEstimateParams = {
  packingWarehouseCode: string | null;
  sellerShippingContextId: number | null;
  shippingMode: ShippingMode;
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
  provinces: BestExpressProvince[];
  districts: BestExpressDistrict[];
  wards: BestExpressWard[];
  orderLines: OrderLineRow[];
  packingWarehouseId: number | null;
};

export type UseShippingEstimateResult = {
  warehouseShippingPartners: WarehouseShippingPartnerApi[];
  shippingPartnersLoading: boolean;
  shippingPartnersError: string | null;
  sellerShippingPartners: SellerShippingPartnerApi[];
  sellerPartnersLoading: boolean;
  sellerPartnersError: string | null;
  shippingEstimate: ShippingEstimateData | null;
  shippingEstimateLoading: boolean;
  shippingEstimateError: string | null;
  warehousePartnerId: number | null;
  setWarehousePartnerId: React.Dispatch<React.SetStateAction<number | null>>;
};

/**
 * Quản lý đối tác vận chuyển (warehouse + seller) và ước tính phí giao hàng.
 * - Tải danh sách đối tác kho khi `packingWarehouseCode` / `shippingMode` thay đổi.
 * - Tải đối tác seller (Best Express) khi `sellerShippingContextId` / `shippingMode` thay đổi.
 * - Tự động ước tính phí sau 550 ms khi đủ điều kiện (tỉnh/quận/phường + dòng hàng + đối tác).
 */
export function useShippingEstimate({
  packingWarehouseCode,
  sellerShippingContextId,
  shippingMode,
  provinceId,
  districtId,
  wardId,
  provinces,
  districts,
  wards,
  orderLines,
  packingWarehouseId,
}: UseShippingEstimateParams): UseShippingEstimateResult {
  const [warehousePartnerId, setWarehousePartnerId] = useState<number | null>(
    null,
  );
  const [warehouseShippingPartners, setWarehouseShippingPartners] = useState<
    WarehouseShippingPartnerApi[]
  >([]);
  const [shippingPartnersLoading, setShippingPartnersLoading] = useState(false);
  const [shippingPartnersError, setShippingPartnersError] = useState<
    string | null
  >(null);

  const [sellerShippingPartners, setSellerShippingPartners] = useState<
    SellerShippingPartnerApi[]
  >([]);
  const [sellerPartnersLoading, setSellerPartnersLoading] = useState(false);
  const [sellerPartnersError, setSellerPartnersError] = useState<string | null>(
    null,
  );

  const [shippingEstimate, setShippingEstimate] =
    useState<ShippingEstimateData | null>(null);
  const [shippingEstimateLoading, setShippingEstimateLoading] = useState(false);
  const [shippingEstimateError, setShippingEstimateError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (packingWarehouseCode == null || shippingMode !== 'warehouse') {
      setWarehouseShippingPartners([]);
      if (packingWarehouseCode == null) {
        setWarehousePartnerId(null);
      }
      setShippingPartnersError(null);
      setShippingPartnersLoading(false);
      return;
    }

    const ac = new AbortController();
    let cancelled = false;
    setShippingPartnersLoading(true);
    setShippingPartnersError(null);

    void fetchWarehouseShippingPartners(packingWarehouseCode, {
      signal: ac.signal,
    })
      .then(list => {
        if (cancelled) {
          return;
        }
        setWarehouseShippingPartners(list);
        setWarehousePartnerId(prev =>
          prev != null && list.some(r => r.id === prev) ? prev : null,
        );
      })
      .catch((e: unknown) => {
        if (cancelled) {
          return;
        }
        setWarehouseShippingPartners([]);
        setWarehousePartnerId(null);
        setShippingPartnersError(
          e instanceof Error ? e.message : 'Không tải được đối tác vận chuyển',
        );
      })
      .finally(() => {
        if (!cancelled) {
          setShippingPartnersLoading(false);
        }
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [packingWarehouseCode, shippingMode]);

  useEffect(() => {
    if (sellerShippingContextId == null || shippingMode !== 'seller') {
      setSellerShippingPartners([]);
      setSellerPartnersError(null);
      setSellerPartnersLoading(false);
      return;
    }

    const ac = new AbortController();
    let cancelled = false;
    setSellerPartnersLoading(true);
    setSellerPartnersError(null);

    void fetchSellerShippingPartners({ signal: ac.signal })
      .then(list => {
        if (cancelled) {
          return;
        }
        setSellerShippingPartners(list);
      })
      .catch((e: unknown) => {
        if (cancelled) {
          return;
        }
        setSellerShippingPartners([]);
        setSellerPartnersError(
          e instanceof Error
            ? e.message
            : 'Không tải được đối tác vận chuyển (seller)',
        );
      })
      .finally(() => {
        if (!cancelled) {
          setSellerPartnersLoading(false);
        }
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [sellerShippingContextId, shippingMode]);

  useEffect(() => {
    if (shippingMode !== 'warehouse' && shippingMode !== 'seller') {
      setShippingEstimate(null);
      setShippingEstimateError(null);
      setShippingEstimateLoading(false);
      return;
    }

    const sellerBestRow = findBestExpressSellerPartnerRow(sellerShippingPartners);
    const warehousePartnerRow = warehouseShippingPartners.find(
      r => r.id === warehousePartnerId,
    );

    if (
      packingWarehouseId == null ||
      provinceId == null ||
      districtId == null ||
      wardId == null ||
      orderLines.length === 0
    ) {
      setShippingEstimate(null);
      setShippingEstimateError(null);
      setShippingEstimateLoading(false);
      return;
    }

    const toProvince =
      provinces.find(p => p.id === provinceId)?.name?.trim() ?? '';
    const toDistrict =
      districts.find(d => d.id === districtId)?.name?.trim() ?? '';
    const toWard = wards.find(w => w.id === wardId)?.name?.trim() ?? '';

    if (!toProvince || !toDistrict || !toWard) {
      setShippingEstimate(null);
      setShippingEstimateError(null);
      setShippingEstimateLoading(false);
      return;
    }

    const shipping_partner_seller_id =
      shippingMode === 'seller'
        ? sellerBestRow?.id
        : warehousePartnerRow?.shipping_partner_config_id;

    if (shipping_partner_seller_id == null) {
      setShippingEstimate(null);
      setShippingEstimateError(null);
      setShippingEstimateLoading(false);
      return;
    }

    const payload = {
      to_province: toProvince,
      to_district: toDistrict,
      to_ward: toWard,
      items: orderLines.map(l => ({
        product_id: l.productId,
        quantity: l.quantity,
      })),
      shipping_partner_seller_id,
      warehouse_id: packingWarehouseId,
    };

    let cancelled = false;
    const ac = new AbortController();

    const t = setTimeout(() => {
      if (cancelled) {
        return;
      }
      setShippingEstimateLoading(true);
      setShippingEstimateError(null);
      void estimateShippingCost(payload, { signal: ac.signal })
        .then(data => {
          if (cancelled) {
            return;
          }
          setShippingEstimate(data);
        })
        .catch((e: unknown) => {
          if (cancelled || axios.isCancel(e)) {
            return;
          }
          setShippingEstimate(null);
          setShippingEstimateError(
            e instanceof Error ? e.message : 'Không ước tính được phí ship',
          );
        })
        .finally(() => {
          if (!cancelled) {
            setShippingEstimateLoading(false);
          }
        });
    }, 550);

    return () => {
      cancelled = true;
      clearTimeout(t);
      ac.abort();
    };
  }, [
    shippingMode,
    packingWarehouseId,
    warehousePartnerId,
    warehouseShippingPartners,
    sellerShippingPartners,
    provinceId,
    districtId,
    wardId,
    provinces,
    districts,
    wards,
    orderLines,
  ]);

  return {
    warehouseShippingPartners,
    shippingPartnersLoading,
    shippingPartnersError,
    sellerShippingPartners,
    sellerPartnersLoading,
    sellerPartnersError,
    shippingEstimate,
    shippingEstimateLoading,
    shippingEstimateError,
    warehousePartnerId,
    setWarehousePartnerId,
  };
}
