import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import {
  clearCustomerSearch,
  searchCustomersByQuery,
} from '@services/category/customerSlice';
import { clearProductSuggestions } from '@services/sales/saleProductSlice';
import {
  mapCustomerListRowToSearchItem,
  resolveCustomerLocationLabelsForOrder,
  type CustomerSearchItem,
} from '@services/category/customerApiTypes';
import { getCustomer } from '@services/category/customerAPI';
import {
  getBestExpressDistricts,
  getBestExpressWards,
} from '@services/sales/locationAPI';
import { fetchShipmentsByCustomerId } from '@services/sales/shipmentAPI';
import type { ShipmentsListMeta } from '@services/sales/shipmentApiTypes';
import {
  findBestExpressSellerPartnerRow,
  toWarehouseShippingPartnerSelectOption,
  type SellerShippingPartnerApi,
  type WarehouseShippingPartnerApi,
} from '@services/settings/shipApiTypes';
import { createSaleOrder } from '@services/sales/orderAPI';
import type { SaleOrderCreatedRecord } from '@services/sales/saleOrderApiTypes';
import { fetchSaleOrders } from '@services/sales/orderSlice';
import { fetchSalesMenuShops } from '@services/settings/shopSlice';
import {
  SALES_ORDER_CUSTOMER_DROPDOWN_KEY,
} from '../../../dropdownFrequency/dropdownFrequencyKeys';
import {
  recordRecentSelection,
  type DropdownAccountKey,
  type DropdownRecentSelection,
} from '@services/system/dropdownFrequencySlice';
import {
  bestExpressRowByLabel,
  computeLineTotal,
  startOfDay,
  stripTrailingLocationSegments,
  type OrderLineRow,
  type SelectOption,
  type ShippingMode,
} from './createOrderUtils';
import { useBestExpressLocations } from './useBestExpressLocations';
import type { UseBestExpressLocationsResult } from './useBestExpressLocations';
import { useShippingEstimate } from './useShippingEstimate';
import type { UseShippingEstimateResult } from './useShippingEstimate';
import { buildCreateOrderPayload } from './buildCreateOrderPayload';
import type { AddProductLinePayload } from '../../components/AddProductModal';

const EMPTY_RECENT_SELECTIONS: DropdownRecentSelection[] = [];

function isCustomerSearchItem(value: unknown): value is CustomerSearchItem {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const row = value as Partial<CustomerSearchItem>;
  return typeof row.id === 'number' && typeof row.name === 'string';
}

function recentCustomerSubtitle(customer: CustomerSearchItem): string | null {
  return customer.phone ?? customer.email ?? customer.code ?? null;
}

export type UseCreateOrderFormParams = {
  initialShopId?: number;
  onBack: () => void;
  onOrderCreated?: (record: SaleOrderCreatedRecord) => void;
};

export type UseCreateOrderFormResult = {
  shopId: number | null;
  setShopId: React.Dispatch<React.SetStateAction<number | null>>;
  packingWarehouseId: number | null;
  setPackingWarehouseId: React.Dispatch<React.SetStateAction<number | null>>;
  shippingWarehouseId: number | null;
  setShippingWarehouseId: React.Dispatch<React.SetStateAction<number | null>>;
  shippingWarehouseTouchedRef: React.MutableRefObject<boolean>;
  selectedCustomer: CustomerSearchItem | null;
  customerShipmentsMeta: ShipmentsListMeta | null;
  customerShipmentsLoading: boolean;
  customerShipmentsError: string | null;
  shippingMode: ShippingMode;
  setShippingMode: React.Dispatch<React.SetStateAction<ShippingMode>>;
  shipPayer: string;
  setShipPayer: React.Dispatch<React.SetStateAction<string>>;
  shippingFee: string;
  setShippingFee: React.Dispatch<React.SetStateAction<string>>;
  collectCod: boolean;
  setCollectCod: React.Dispatch<React.SetStateAction<boolean>>;
  recipientName: string;
  setRecipientName: React.Dispatch<React.SetStateAction<string>>;
  recipientPhone: string;
  setRecipientPhone: React.Dispatch<React.SetStateAction<string>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  advancedOpen: boolean;
  setAdvancedOpen: React.Dispatch<React.SetStateAction<boolean>>;
  orderDate: Date;
  setOrderDate: React.Dispatch<React.SetStateAction<Date>>;
  orderDiscountPercent: string;
  setOrderDiscountPercent: React.Dispatch<React.SetStateAction<string>>;
  orderNote: string;
  setOrderNote: React.Dispatch<React.SetStateAction<string>>;
  addProductOpen: boolean;
  setAddProductOpen: React.Dispatch<React.SetStateAction<boolean>>;
  orderLines: OrderLineRow[];
  setOrderLines: React.Dispatch<React.SetStateAction<OrderLineRow[]>>;
  createSubmitting: boolean;
  handleCustomerChange: (customer: CustomerSearchItem | null) => void;
  handleCustomerQueryChange: (raw: string) => void;
  handleAddProductLine: (line: AddProductLinePayload) => void;
  handleCreate: () => Promise<void>;
  // From useBestExpressLocations
  provinces: UseBestExpressLocationsResult['provinces'];
  provincesLoading: boolean;
  provincesError: string | null;
  districts: UseBestExpressLocationsResult['districts'];
  districtsLoading: boolean;
  districtsError: string | null;
  wards: UseBestExpressLocationsResult['wards'];
  wardsLoading: boolean;
  wardsError: string | null;
  provinceId: number | null;
  setProvinceId: React.Dispatch<React.SetStateAction<number | null>>;
  districtId: number | null;
  setDistrictId: React.Dispatch<React.SetStateAction<number | null>>;
  wardId: number | null;
  setWardId: React.Dispatch<React.SetStateAction<number | null>>;
  // From useShippingEstimate
  warehouseShippingPartners: WarehouseShippingPartnerApi[];
  shippingPartnersLoading: boolean;
  shippingPartnersError: string | null;
  sellerShippingPartners: SellerShippingPartnerApi[];
  sellerPartnersLoading: boolean;
  sellerPartnersError: string | null;
  shippingEstimate: UseShippingEstimateResult['shippingEstimate'];
  shippingEstimateLoading: boolean;
  shippingEstimateError: string | null;
  warehousePartnerId: number | null;
  setWarehousePartnerId: React.Dispatch<React.SetStateAction<number | null>>;
  // Redux display state
  menuLoading: boolean;
  customerHits: CustomerSearchItem[];
  customerSearchLoading: boolean;
  customerSearchError: string | null;
  // Derived values
  dropdownAccountKey: DropdownAccountKey | null;
  recentCustomerSuggestions: CustomerSearchItem[];
  shopOptions: SelectOption<number>[];
  warehouseOptions: SelectOption<number>[];
  packingLabel: string;
  shippingExportLabel: string;
  dualShippingWarehouse: boolean;
  pickupWarehouseDisplay: { name: string; detail: string };
  warehousePartnerOptions: SelectOption<number>[];
  sellerBestExpressRow: SellerShippingPartnerApi | null | undefined;
  needSellerBestExpressWarning: boolean;
  needPartnerWarning: boolean;
  shipPayerOptions: SelectOption<string>[];
  MIN_CUSTOMER_SEARCH_LEN: number;
  provinceOptions: SelectOption<number>[];
  districtOptions: SelectOption<number>[];
  wardOptions: SelectOption<number>[];
  subtotal: number;
  feeNum: number;
  orderDiscountVnd: number;
  total: number;
  shopSelected: boolean;
  sellerShippingContextId: number | null;
  packingWarehouseCode: string | null;
};

export function useCreateOrderForm({
  initialShopId,
  onBack,
  onOrderCreated,
}: UseCreateOrderFormParams): UseCreateOrderFormResult {
  const dispatch = useAppDispatch();
  const { user, selectedWarehouseId } = useAppSelector(s => s.auth);
  const { menuShops, menuLoading } = useAppSelector(s => s.shop);
  const {
    searchHits: customerHits,
    searchLoading: customerSearchLoading,
    searchError: customerSearchError,
  } = useAppSelector(s => s.customer);

  const [shopId, setShopId] = useState<number | null>(
    () => initialShopId ?? null,
  );
  const [packingWarehouseId, setPackingWarehouseId] = useState<number | null>(
    selectedWarehouseId ?? user?.warehouses?.[0]?.id ?? null,
  );
  const [shippingWarehouseId, setShippingWarehouseId] = useState<number | null>(
    selectedWarehouseId ?? user?.warehouses?.[0]?.id ?? null,
  );
  const shippingWarehouseTouchedRef = useRef(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSearchItem | null>(null);
  const [customerShipmentsMeta, setCustomerShipmentsMeta] =
    useState<ShipmentsListMeta | null>(null);
  const [customerShipmentsLoading, setCustomerShipmentsLoading] =
    useState(false);
  const [customerShipmentsError, setCustomerShipmentsError] = useState<
    string | null
  >(null);
  const [shippingMode, setShippingMode] = useState<ShippingMode>('warehouse');
  const [shipPayer, setShipPayer] = useState<string>('buyer');
  const [shippingFee, setShippingFee] = useState('0');
  const [collectCod, setCollectCod] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [address, setAddress] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [orderDate, setOrderDate] = useState(() => startOfDay(new Date()));
  const [orderDiscountPercent, setOrderDiscountPercent] = useState('0');
  const [orderNote, setOrderNote] = useState('');
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [orderLines, setOrderLines] = useState<OrderLineRow[]>([]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const customerDetailFetchGenRef = useRef(0);

  const {
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
  } = useBestExpressLocations(shopId);

  const packingWarehouseCode = useMemo(() => {
    const w = user?.warehouses?.find(x => x.id === packingWarehouseId);
    const code = w?.code?.trim();
    return code && code.length > 0 ? code : null;
  }, [user?.warehouses, packingWarehouseId]);

  const sellerShippingContextId = useMemo(() => {
    const id = user?.seller?.id;
    return typeof id === 'number' && Number.isFinite(id) && id >= 1 ? id : null;
  }, [user?.seller?.id]);

  const {
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
  } = useShippingEstimate({
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
  });

  useEffect(() => {
    void dispatch(fetchSalesMenuShops());
  }, [dispatch]);

  useEffect(() => {
    if (!shippingWarehouseTouchedRef.current) {
      setShippingWarehouseId(packingWarehouseId);
    }
  }, [packingWarehouseId]);

  useEffect(() => {
    setOrderLines([]);
    setAddProductOpen(false);
    dispatch(clearProductSuggestions());
  }, [shopId, dispatch]);

  useEffect(() => {
    if (shippingEstimate != null) {
      setShippingFee(String(shippingEstimate.total_fee));
    }
  }, [shippingEstimate]);

  const dropdownAccountKey = useMemo(
    () => user?.uuid ?? user?.email ?? null,
    [user?.email, user?.uuid],
  );

  const recentCustomerSelections = useAppSelector(state => {
    const accountKey = dropdownAccountKey?.toString().trim();
    return accountKey && accountKey.length > 0
      ? state.dropdownFrequency.recentSelectionsByAccount?.[accountKey]?.[
          SALES_ORDER_CUSTOMER_DROPDOWN_KEY
        ] ?? EMPTY_RECENT_SELECTIONS
      : state.dropdownFrequency.recentSelectionsByDropdown?.[
          SALES_ORDER_CUSTOMER_DROPDOWN_KEY
        ] ?? EMPTY_RECENT_SELECTIONS;
  });

  const recentCustomerSuggestions = useMemo(
    () =>
      recentCustomerSelections.flatMap(item =>
        isCustomerSearchItem(item.data) ? [item.data] : [],
      ),
    [recentCustomerSelections],
  );

  const handleCustomerChange = useCallback(
    (customer: CustomerSearchItem | null) => {
      if (customer == null) {
        customerDetailFetchGenRef.current += 1;
        setSelectedCustomer(null);
        return;
      }
      customerDetailFetchGenRef.current += 1;
      const gen = customerDetailFetchGenRef.current;
      setSelectedCustomer(customer);
      dispatch(
        recordRecentSelection(
          SALES_ORDER_CUSTOMER_DROPDOWN_KEY,
          {
            value: customer.id,
            label: customer.name,
            subtitle: recentCustomerSubtitle(customer),
            data: customer,
          },
          dropdownAccountKey,
        ),
      );
      void getCustomer(customer.id, { includeSeller: false })
        .then(row => {
          if (gen !== customerDetailFetchGenRef.current) {
            return;
          }
          setSelectedCustomer(mapCustomerListRowToSearchItem(row));
        })
        .catch(() => {});
    },
    [dispatch, dropdownAccountKey],
  );

  const handleCustomerQueryChange = useCallback(
    (raw: string) => {
      const t = raw.trim();
      if (t.length <= 2) {
        dispatch(clearCustomerSearch());
        return;
      }
      void dispatch(searchCustomersByQuery(raw));
    },
    [dispatch],
  );

  useEffect(() => {
    if (selectedCustomer) {
      dispatch(clearCustomerSearch());
    }
  }, [selectedCustomer, dispatch]);

  useEffect(() => {
    if (selectedCustomer == null) {
      setCustomerShipmentsMeta(null);
      setCustomerShipmentsError(null);
      setCustomerShipmentsLoading(false);
      return;
    }
    const customerId = selectedCustomer.id;
    const ac = new AbortController();
    let cancelled = false;
    setCustomerShipmentsLoading(true);
    setCustomerShipmentsError(null);

    void fetchShipmentsByCustomerId({ customerId, signal: ac.signal })
      .then(({ meta }) => {
        if (cancelled) {
          return;
        }
        setCustomerShipmentsMeta(meta);
      })
      .catch((e: unknown) => {
        if (cancelled || axios.isCancel(e)) {
          return;
        }
        setCustomerShipmentsMeta(null);
        setCustomerShipmentsError(
          e instanceof Error ? e.message : 'Không tải được vận đơn theo khách',
        );
      })
      .finally(() => {
        if (!cancelled) {
          setCustomerShipmentsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [selectedCustomer]);

  /** Chọn khách ở mục 1 → đổ tên / SĐT / địa chỉ xuống phần 3 (Người nhận). */
  useEffect(() => {
    if (selectedCustomer == null || shippingMode === 'pickup') {
      return;
    }
    setRecipientName(selectedCustomer.name?.trim() ?? '');
    setRecipientPhone((selectedCustomer.phone ?? '').trim());
    const street = (selectedCustomer.address ?? '').trim();
    const full = (selectedCustomer.full_address ?? '').trim();
    const { wardLabel: wL, districtLabel: dL, provinceLabel: pL } =
      resolveCustomerLocationLabelsForOrder(selectedCustomer);
    let line = street;
    if (!line && full) {
      if (wL || dL || pL) {
        const stripped = stripTrailingLocationSegments(full, wL, dL, pL).trim();
        line = stripped.length > 0 ? stripped : full;
      } else {
        line = full;
      }
    } else if (!line) {
      line = full;
    }
    setAddress(line);
  }, [selectedCustomer, shippingMode]);

  /**
   * Chọn khách → đồng bộ Tỉnh / Quận / Phường (Best Express) theo province/district/ward từ API khách.
   * Gọi trực tiếp API quận/phường để không phụ thuộc vào thứ tự cập nhật state `districts`/`wards`.
   */
  useEffect(() => {
    if (selectedCustomer == null || shippingMode === 'pickup') {
      return;
    }
    const { provinceLabel: pLabel, districtLabel: dLabel, wardLabel: wLabel } =
      resolveCustomerLocationLabelsForOrder(selectedCustomer);

    if (!pLabel.trim() && !dLabel.trim() && !wLabel.trim()) {
      setProvinceId(null);
      setDistrictId(null);
      setWardId(null);
      return;
    }
    if (provinces.length === 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const provinceRow = bestExpressRowByLabel(provinces, pLabel);
        if (!provinceRow) {
          if (!cancelled) {
            setProvinceId(null);
            setDistrictId(null);
            setWardId(null);
          }
          return;
        }
        if (!cancelled) {
          setProvinceId(provinceRow.id);
        }

        const distList = await getBestExpressDistricts(provinceRow.address_id);
        if (cancelled) {
          return;
        }

        if (!dLabel) {
          setDistrictId(null);
          setWardId(null);
          return;
        }
        const districtRow = bestExpressRowByLabel(distList, dLabel);
        if (!districtRow) {
          setDistrictId(null);
          setWardId(null);
          return;
        }
        if (!cancelled) {
          setDistrictId(districtRow.id);
        }

        const wardList = await getBestExpressWards(districtRow.address_id);
        if (cancelled) {
          return;
        }

        if (!wLabel) {
          setWardId(null);
          return;
        }
        const wardRow = bestExpressRowByLabel(wardList, wLabel);
        if (!cancelled) {
          setWardId(wardRow?.id ?? null);
        }
      } catch {
        if (!cancelled) {
          setProvinceId(null);
          setDistrictId(null);
          setWardId(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCustomer, shippingMode, shopId, provinces, setProvinceId, setDistrictId, setWardId]);

  /** Khách tự đến lấy: xóa người nhận / địa chỉ giao, không tính phí ship. */
  useEffect(() => {
    if (shippingMode !== 'pickup') {
      return;
    }
    setRecipientName('');
    setRecipientPhone('');
    setAddress('');
    setProvinceId(null);
    setDistrictId(null);
    setWardId(null);
    setShippingFee('0');
  }, [shippingMode, setProvinceId, setDistrictId, setWardId]);

  const shopOptions: SelectOption<number>[] = useMemo(
    () => menuShops.map(s => ({ value: s.id, label: s.name })),
    [menuShops],
  );

  const warehouseOptions: SelectOption<number>[] = useMemo(
    () =>
      (user?.warehouses ?? []).map(w => ({
        value: w.id,
        label: w.name,
        subtitle: w.code,
      })),
    [user?.warehouses],
  );

  const packingLabel = useMemo(() => {
    const w = user?.warehouses?.find(x => x.id === packingWarehouseId);
    return w?.name ?? '—';
  }, [user?.warehouses, packingWarehouseId]);

  const shippingExportLabel = useMemo(() => {
    const id = shippingWarehouseId ?? packingWarehouseId;
    const w = user?.warehouses?.find(x => x.id === id);
    return w?.name ?? '—';
  }, [user?.warehouses, shippingWarehouseId, packingWarehouseId]);

  const dualShippingWarehouse =
    shippingWarehouseId != null &&
    packingWarehouseId != null &&
    shippingWarehouseId !== packingWarehouseId;

  const pickupWarehouseDisplay = useMemo(() => {
    const w = user?.warehouses?.find(x => x.id === packingWarehouseId);
    if (!w) {
      return { name: '—', detail: '' as string };
    }
    const addr = (w.address ?? '').trim();
    const tail = [w.ward, w.district, w.province].filter(Boolean).join(', ');
    const detail = addr || tail;
    return { name: w.name, detail };
  }, [user?.warehouses, packingWarehouseId]);

  const warehousePartnerOptions: SelectOption<number>[] = useMemo(
    () => warehouseShippingPartners.map(toWarehouseShippingPartnerSelectOption),
    [warehouseShippingPartners],
  );

  const sellerBestExpressRow = useMemo(
    () => findBestExpressSellerPartnerRow(sellerShippingPartners),
    [sellerShippingPartners],
  );

  const needSellerBestExpressWarning =
    shippingMode === 'seller' &&
    sellerShippingContextId != null &&
    !sellerPartnersLoading &&
    sellerPartnersError == null &&
    sellerBestExpressRow == null;

  const needPartnerWarning =
    (shippingMode === 'warehouse' && warehousePartnerId == null) ||
    needSellerBestExpressWarning;

  const shipPayerOptions: SelectOption<string>[] = [
    { value: 'buyer', label: 'Người mua' },
    { value: 'seller', label: 'Người bán' },
  ];

  const MIN_CUSTOMER_SEARCH_LEN = 3;

  const provinceOptions: SelectOption<number>[] = useMemo(
    () => provinces.map(p => ({ value: p.id, label: p.name })),
    [provinces],
  );

  const districtOptions: SelectOption<number>[] = useMemo(
    () => districts.map(d => ({ value: d.id, label: d.name })),
    [districts],
  );

  const wardOptions: SelectOption<number>[] = useMemo(
    () => wards.map(w => ({ value: w.id, label: w.name })),
    [wards],
  );

  const handleAddProductLine = useCallback((line: AddProductLinePayload) => {
    setOrderLines(prev => [
      ...prev,
      {
        key: `L-${Date.now()}-${prev.length}`,
        ...line,
      },
    ]);
  }, []);

  const subtotal = useMemo(
    () => orderLines.reduce((s, l) => s + computeLineTotal(l), 0),
    [orderLines],
  );
  const feeNum = Number(String(shippingFee).replace(/\D/g, '')) || 0;
  const orderDiscountVnd = useMemo(() => {
    const r = Number(String(orderDiscountPercent).replace(',', '.')) || 0;
    const p = Math.min(100, Math.max(0, r));
    return Math.round(subtotal * (p / 100));
  }, [orderDiscountPercent, subtotal]);
  const total = Math.max(0, subtotal - orderDiscountVnd + feeNum);

  const shopSelected = shopId != null;

  const handleCreate = useCallback(async () => {
    if (createSubmitting) {
      return;
    }
    if (shopId == null) {
      toast.warning('Vui lòng chọn cửa hàng.');
      return;
    }
    const shop = menuShops.find(s => s.id === shopId);
    if (!shop) {
      toast.error('Không tìm thấy cửa hàng đã chọn.');
      return;
    }
    if (packingWarehouseId == null) {
      toast.warning('Vui lòng chọn kho đóng gói.');
      return;
    }
    if (selectedCustomer == null) {
      toast.warning('Vui lòng chọn khách hàng.');
      return;
    }
    if (orderLines.length === 0) {
      toast.warning('Thêm ít nhất một dòng sản phẩm.');
      return;
    }

    if (shippingMode === 'warehouse') {
      const wr = warehouseShippingPartners.find(r => r.id === warehousePartnerId);
      if (wr?.shipping_partner_config_id == null) {
        toast.warning('Vui lòng chọn đối tác vận chuyển.');
        return;
      }
    } else if (shippingMode === 'seller') {
      if (findBestExpressSellerPartnerRow(sellerShippingPartners) == null) {
        toast.warning('Chưa có cấu hình Best Express cho seller.');
        return;
      }
    }

    if (shippingMode !== 'pickup') {
      const toProvinceName =
        provinces.find(p => p.id === provinceId)?.name?.trim() ?? '';
      const toDistrictName =
        districts.find(d => d.id === districtId)?.name?.trim() ?? '';
      const toWardName = wards.find(w => w.id === wardId)?.name?.trim() ?? '';
      if (!toProvinceName || !toDistrictName || !toWardName) {
        toast.warning('Chọn đủ tỉnh / quận / phường giao hàng.');
        return;
      }
      if (!recipientName.trim() || !recipientPhone.trim() || !address.trim()) {
        toast.warning('Điền đủ tên, SĐT và địa chỉ người nhận.');
        return;
      }
    }

    const packingWarehouse =
      user?.warehouses?.find(w => w.id === packingWarehouseId) ?? null;

    setCreateSubmitting(true);
    try {
      const payload = buildCreateOrderPayload({
        shopId,
        shop,
        packingWarehouseId,
        shippingWarehouseId,
        packingWarehouse,
        selectedCustomer,
        orderLines,
        shippingMode,
        warehouseShippingPartners,
        warehousePartnerId,
        sellerShippingPartners,
        provinces,
        provinceId,
        districts,
        districtId,
        wards,
        wardId,
        pickupWarehouseDisplay,
        recipientName,
        recipientPhone,
        address,
        shipPayer,
        collectCod,
        shippingFee,
        orderDate,
        orderDiscountVnd,
      });
      const created = await createSaleOrder(payload);
      void dispatch(fetchSaleOrders({ page: 1 }));
      toast.success(`${created.order_number}\nT\u1ED5ng: ${created.total}\u0111`);
      if (onOrderCreated) {
        onOrderCreated(created);
      } else {
        onBack();
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      setCreateSubmitting(false);
    }
  }, [
    createSubmitting,
    shopId,
    menuShops,
    packingWarehouseId,
    selectedCustomer,
    orderLines,
    shippingMode,
    warehouseShippingPartners,
    warehousePartnerId,
    sellerShippingPartners,
    user?.warehouses,
    provinces,
    provinceId,
    districts,
    districtId,
    wards,
    wardId,
    pickupWarehouseDisplay,
    recipientName,
    recipientPhone,
    address,
    shipPayer,
    collectCod,
    shippingFee,
    dispatch,
    onBack,
    onOrderCreated,
    orderDate,
    shippingWarehouseId,
    orderDiscountVnd,
  ]);

  return {
    shopId,
    setShopId,
    packingWarehouseId,
    setPackingWarehouseId,
    shippingWarehouseId,
    setShippingWarehouseId,
    shippingWarehouseTouchedRef,
    selectedCustomer,
    customerShipmentsMeta,
    customerShipmentsLoading,
    customerShipmentsError,
    shippingMode,
    setShippingMode,
    shipPayer,
    setShipPayer,
    shippingFee,
    setShippingFee,
    collectCod,
    setCollectCod,
    recipientName,
    setRecipientName,
    recipientPhone,
    setRecipientPhone,
    address,
    setAddress,
    advancedOpen,
    setAdvancedOpen,
    orderDate,
    setOrderDate,
    orderDiscountPercent,
    setOrderDiscountPercent,
    orderNote,
    setOrderNote,
    addProductOpen,
    setAddProductOpen,
    orderLines,
    setOrderLines,
    createSubmitting,
    handleCustomerChange,
    handleCustomerQueryChange,
    handleAddProductLine,
    handleCreate,
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
    menuLoading,
    customerHits,
    customerSearchLoading,
    customerSearchError,
    dropdownAccountKey,
    recentCustomerSuggestions,
    shopOptions,
    warehouseOptions,
    packingLabel,
    shippingExportLabel,
    dualShippingWarehouse,
    pickupWarehouseDisplay,
    warehousePartnerOptions,
    sellerBestExpressRow,
    needSellerBestExpressWarning,
    needPartnerWarning,
    shipPayerOptions,
    MIN_CUSTOMER_SEARCH_LEN,
    provinceOptions,
    districtOptions,
    wardOptions,
    subtotal,
    feeNum,
    orderDiscountVnd,
    total,
    shopSelected,
    sellerShippingContextId,
    packingWarehouseCode,
  };
}
