import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { buildSalesNavigationTheme } from '@shared/theme/navigationTheme';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { BackHandler, DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setSelectedWarehouse } from '@services/auth/authSlice';
import { selectNormalizedAppRole } from '@features/auth/store/authSelectors';
import {
  bottomNavChromeForRole,
  bottomTabsForAppRole,
  defaultDrawerIdForRole,
  isDrawerNavAllowedForRole,
} from '@features/auth/utils/roleNavPolicy';
import { fetchBankAccountDirectory } from '@services/settings/bankAccountSlice';
import { fetchShipPartnerDirectory } from '@services/settings/shipPartnerSlice';
import {
  fetchStaffUserCounts,
  fetchStaffUserDirectory,
} from '@services/settings/staffSlice';
import {
  fetchSalesMenuShops,
  switchShopContextWarehouse,
} from '@services/settings/shopSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setNotificationDeepLinkHandlers } from '../../notifications/notificationDeepLink';
import { flushPendingFcmNotificationOpen } from '../../push/fcmNotificationLinking';
import { SalesShellNavProvider } from '../navigation/SalesShellNavContext';
import {
  bottomTabToDrawerIdForRole,
  drawerIdToBottomTab,
  type SalesBottomTabId,
} from '../navigation/salesBottomTabNav';
import {
  navigateSalesStackForBottomTab,
  navigateSalesStackScreen,
  resetSalesStackForDrawerId,
  salesNavigationRef,
  setActiveSalesNavTab,
  jumpToSalesBottomTab,
} from '../navigation/salesNavigationRef';
import { SalesNavTree } from '../navigation/SalesNavTree';
import {
  SalesStackActionsProvider,
  type SalesStackActions,
} from '../navigation/SalesStackActionsContext';
import { SALES_RESUME_CREATE_ORDER_OVERLAY } from '../navigation/CreateCustomerStackScreen';
import { ShellOverlayWithEdgeBack } from '../navigation/ShellOverlayWithEdgeBack';
import { CreatePriceListScreen } from '../../category/priceList/CreatePriceListScreen';
import { CreateServicePricingScreen } from '../../finance/servicePricing/CreateServicePricingScreen';
import { EditPriceListScreen } from '../../category/priceList/EditPriceListScreen';
import { PriceListDetailScreen } from '../../category/priceList/PriceListDetailScreen';
import { CreateSupplierScreen } from '../../category/suppliers/CreateSupplierScreen';
import { EditSupplierScreen } from '../../category/suppliers/EditSupplierScreen';
import { SupplierDetailScreen } from '../../category/suppliers/SupplierDetailScreen';
import { CreateProductScreen } from '../../category/products/CreateProductScreen';
import { EditProductScreen } from '../../category/products/EditProductScreen';
import { ProductDetailScreen } from '../../category/products/ProductDetailScreen';
import type { ProductApi } from '@services/category/productApiTypes';
import { CreateCustomerScreen } from '../../category/customers/CreateCustomerScreen';
import { CustomerDetailScreen } from '../../category/customers/CustomerDetailScreen';
import { EditCustomerScreen } from '../../category/customers/EditCustomerScreen';
import { InventoryProductDetailScreen } from '../../goods/screens/InventoryProductDetailScreen';
import { CreatePurchaseOrderScreen } from '../../goods/screens/CreatePurchaseOrderScreen';
import { PurchaseOrderDetailScreen } from '../../goods/screens/PurchaseOrderDetailScreen';
import { PackingOrderDetailScreen } from '../../pack/screens/PackingOrderDetailScreen';
import { OutboundOrderDetailScreen } from '../../outbound/screens/OutboundOrderDetailScreen';
import { InboundOrderDetailScreen } from '../../inbound/screens/InboundOrderDetailScreen';
import { TransferOrderDetailScreen } from '../../transfer/screens/TransferOrderDetailScreen';
import { ComboAssemblyDetailScreen } from '../../comboAssembly/screens/ComboAssemblyDetailScreen';
import { CreateOrderScreen } from './CreateOrderScreen';
import { OrderDetailScreen } from './OrderDetailScreen';
import { SALES_SHOP_DROPDOWN_KEY } from '../../dropdownFrequency/dropdownFrequencyKeys';
import { useFrequencyDropdown } from '../../dropdownFrequency/useFrequencyDropdown';
import { InvoiceDetailScreen } from '../../finance/bill/InvoiceDetailScreen';
import { PaymentDetailScreen } from '../../finance/payment/PaymentDetailScreen';
import { SettlementDetailScreen } from '../../finance/settlement/SettlementDetailScreen';
import { CreateBankAccountScreen } from '../../settings/bankAccount/CreateBankAccountScreen';
import { EditShipPartnerConnectionScreen } from '../../settings/shipPartners/EditShipPartnerConnectionScreen';
import { CreateStaffScreen } from '../../settings/staff/CreateStaffScreen';
import { StaffDetailScreen } from '../../settings/staff/StaffDetailScreen';
import { CreateShopScreen } from '../../settings/shops/CreateShopScreen';
import { ShopDetailScreen } from '../../settings/shops/ShopDetailScreen';
import { EditShopScreen } from '../../settings/shops/EditShopScreen';

export default function SalesLayout() {
  const styles = useThemeStyleSheet(create_SalesLayout_styles);
  const colors = useAppColors();
  const { mode } = useThemeMode();
  const { t } = useTranslation();
  const salesNavTheme = useMemo(
    () => buildSalesNavigationTheme(mode, colors),
    [mode, colors],
  );

  const dispatch = useAppDispatch();
  const appRole = useAppSelector(selectNormalizedAppRole);
  const authUser = useAppSelector(s => s.auth.user);
  const visibleBottomTabs = useMemo(
    () => bottomTabsForAppRole(appRole),
    [appRole],
  );
  const bottomNavChrome = useMemo(
    () => bottomNavChromeForRole(appRole),
    [appRole],
  );
  const bottomTabLabels = useMemo((): Record<SalesBottomTabId, string> => {
    const keys = bottomNavChrome.labelKeys;
    return {
      orders: t(keys.orders),
      catalog: t(keys.catalog),
      goods: t(keys.goods),
      finance: t(keys.finance),
    };
  }, [bottomNavChrome.labelKeys, t]);
  const menuShopsRaw = useAppSelector(s => s.shop.menuShops);
  const dropdownAccountKey = useMemo(
    () => authUser?.uuid ?? authUser?.email ?? null,
    [authUser?.email, authUser?.uuid],
  );
  const menuShopFrequencyOptions = useMemo(
    () => menuShopsRaw.map(s => ({ ...s, value: s.id })),
    [menuShopsRaw],
  );
  const { sortedOptions: sortedMenuShopOptions, handleSelect: recordShopSelect } =
    useFrequencyDropdown(
      SALES_SHOP_DROPDOWN_KEY,
      menuShopFrequencyOptions,
      dropdownAccountKey,
    );
  const menuShopsForNav = useMemo(
    () =>
      sortedMenuShopOptions.map(s => {
        const n = s.name?.trim();
        return {
          id: s.id,
          name: n && n.length > 0 ? n : t('nav.drawer.shopNamed', { id: s.id }),
        };
      }),
    [sortedMenuShopOptions, t],
  );

  useEffect(() => {
    void dispatch(fetchSalesMenuShops());
  }, [dispatch]);

  const [drawerActiveId, setDrawerActiveId] = useState('sales:orders-all');
  /** Tab bottom đang ghim khi mở `settings:*` (không map tab). */
  const [pinnedBottomTab, setPinnedBottomTab] =
    useState<SalesBottomTabId>('orders');

  useEffect(() => {
    if (isDrawerNavAllowedForRole(drawerActiveId, appRole)) {
      return;
    }
    const next = defaultDrawerIdForRole(appRole);
    setDrawerActiveId(next);
    resetSalesStackForDrawerId(next);
  }, [appRole, drawerActiveId]);

  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  /** Ẩn overlay tạo đơn (giữ state) khi đẩy stack `CreateCustomer` lên trên. */
  const [suppressCreateOrderForStackCustomer, setSuppressCreateOrderForStackCustomer] =
    useState(false);
  const [createOrderInitialShopId, setCreateOrderInitialShopId] = useState<
    number | undefined
  >(undefined);
  const [orderDetailRef, setOrderDetailRef] = useState<string | null>(null);
  const [invoiceDetailId, setInvoiceDetailId] = useState<string | null>(null);
  const [settlementDetailRef, setSettlementDetailRef] = useState<string | null>(
    null,
  );
  const [paymentDetailRef, setPaymentDetailRef] = useState<string | null>(null);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createSupplierOpen, setCreateSupplierOpen] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [supplierDetailId, setSupplierDetailId] = useState<number | null>(null);
  const [supplierDetailReload, setSupplierDetailReload] = useState(0);
  const [editSupplierId, setEditSupplierId] = useState<number | null>(null);
  const [createPriceListOpen, setCreatePriceListOpen] = useState(false);
  const [createServicePricingOpen, setCreateServicePricingOpen] =
    useState(false);
  const [servicePricingReloadSignal, setServicePricingReloadSignal] =
    useState(0);
  const [priceListDetailId, setPriceListDetailId] = useState<number | null>(
    null,
  );
  const [priceListDetailReload, setPriceListDetailReload] = useState(0);
  const [editPriceListId, setEditPriceListId] = useState<number | null>(null);
  const [productDetailId, setProductDetailId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<ProductApi | null>(null);
  const [productDetailReload, setProductDetailReload] = useState(0);
  const [customerDetailId, setCustomerDetailId] = useState<number | null>(null);
  const [customerDetailReload, setCustomerDetailReload] = useState(0);
  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
  const [inventoryProductDetailId, setInventoryProductDetailId] = useState<
    number | null
  >(null);
  const [inventoryProductDetailReload, setInventoryProductDetailReload] =
    useState(0);
  const [createPurchaseOrderOpen, setCreatePurchaseOrderOpen] = useState(false);
  /** Đặt khi mở form sửa — cùng overlay với tạo đơn (`CreatePurchaseOrderScreen`). */
  const [purchaseOrderEditRef, setPurchaseOrderEditRef] = useState<
    string | null
  >(null);
  const [purchaseOrderDetailRef, setPurchaseOrderDetailRef] = useState<
    string | null
  >(null);
  /** Mã lệnh đóng gói (vd. `PK-MCT-2600165`) — mở từ danh sách hoặc deep link. */
  const [packingOrderDetailRef, setPackingOrderDetailRef] = useState<
    string | null
  >(null);
  /** Mã phiếu xuất kho (vd. `OBMCT-2600042`) — mở từ danh sách hoặc deep link. */
  const [outboundOrderDetailRef, setOutboundOrderDetailRef] = useState<
    string | null
  >(null);
  /** Mã phiếu nhập kho (vd. `IBP-MCT-2600030`) — mở từ danh sách hoặc deep link. */
  const [inboundOrderDetailRef, setInboundOrderDetailRef] = useState<
    string | null
  >(null);
  /** Mã lệnh chuyển kho (vd. `TR-MCT-2600006`) — mở từ deep link. */
  const [transferOrderDetailRef, setTransferOrderDetailRef] = useState<
    string | null
  >(null);
  /** Mã lệnh đóng gói combo (vd. `CA-MCT-2600012`). */
  const [comboAssemblyDetailRef, setComboAssemblyDetailRef] = useState<
    string | null
  >(null);
  const [createShopOpen, setCreateShopOpen] = useState(false);
  const [createBankAccountOpen, setCreateBankAccountOpen] = useState(false);
  const [editBankAccountId, setEditBankAccountId] = useState<number | null>(
    null,
  );
  const [editShipPartnerSellerId, setEditShipPartnerSellerId] = useState<
    number | null
  >(null);
  const [shopDetailId, setShopDetailId] = useState<number | null>(null);
  const [shopDetailReload, setShopDetailReload] = useState(0);
  const [editShopId, setEditShopId] = useState<number | null>(null);
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
  const [staffDetailUserId, setStaffDetailUserId] = useState<number | null>(
    null,
  );
  const [staffDetailReload, setStaffDetailReload] = useState(0);

  const fullScreenOverlayRef = useRef(false);
  const fullScreenOverlay =
    createOrderOpen ||
    createProductOpen ||
    createSupplierOpen ||
    createCustomerOpen ||
    supplierDetailId != null ||
    editSupplierId != null ||
    createPriceListOpen ||
    createServicePricingOpen ||
    priceListDetailId != null ||
    editPriceListId != null ||
    productDetailId != null ||
    editProduct != null ||
    customerDetailId != null ||
    editCustomerId != null ||
    inventoryProductDetailId != null ||
    createPurchaseOrderOpen ||
    purchaseOrderDetailRef != null ||
    packingOrderDetailRef != null ||
    outboundOrderDetailRef != null ||
    inboundOrderDetailRef != null ||
    transferOrderDetailRef != null ||
    comboAssemblyDetailRef != null ||
    createShopOpen ||
    createBankAccountOpen ||
    editBankAccountId != null ||
    editShipPartnerSellerId != null ||
    shopDetailId != null ||
    editShopId != null ||
    createStaffOpen ||
    staffDetailUserId != null ||
    orderDetailRef != null ||
    invoiceDetailId != null ||
    settlementDetailRef != null ||
    paymentDetailRef != null;
  fullScreenOverlayRef.current = fullScreenOverlay;

  const activeBottomTab = useMemo((): SalesBottomTabId => {
    const tab = drawerIdToBottomTab(drawerActiveId);
    return tab ?? pinnedBottomTab;
  }, [drawerActiveId, pinnedBottomTab]);

  const dismissShellOverlays = useCallback(() => {
    setOrderDetailRef(null);
    setInvoiceDetailId(null);
    setSettlementDetailRef(null);
    setPaymentDetailRef(null);
    setCreatePurchaseOrderOpen(false);
    setPurchaseOrderEditRef(null);
    setCreateOrderOpen(false);
    setCreateOrderInitialShopId(undefined);
    setCreateProductOpen(false);
    setCreateSupplierOpen(false);
    setCreateCustomerOpen(false);
    setSupplierDetailId(null);
    setSupplierDetailReload(0);
    setEditSupplierId(null);
    setCreatePriceListOpen(false);
    setCreateServicePricingOpen(false);
    setPriceListDetailId(null);
    setEditPriceListId(null);
    setProductDetailId(null);
    setEditProduct(null);
    setCustomerDetailId(null);
    setCustomerDetailReload(0);
    setEditCustomerId(null);
    setInventoryProductDetailId(null);
    setInventoryProductDetailReload(0);
    setPurchaseOrderDetailRef(null);
    setPackingOrderDetailRef(null);
    setOutboundOrderDetailRef(null);
    setInboundOrderDetailRef(null);
    setTransferOrderDetailRef(null);
    setComboAssemblyDetailRef(null);
    setCreateShopOpen(false);
    setCreateBankAccountOpen(false);
    setEditShipPartnerSellerId(null);
    setShopDetailId(null);
    setShopDetailReload(0);
    setEditShopId(null);
    setCreateStaffOpen(false);
    setStaffDetailUserId(null);
    setStaffDetailReload(0);
  }, []);

  const handleDrawerNavigate = useCallback(
    (id: string) => {
      const shopPrefix = 'sales:shop:';
      if (id.startsWith(shopPrefix)) {
        const shopId = Number(id.slice(shopPrefix.length));
        if (Number.isFinite(shopId)) {
          recordShopSelect(shopId);
        }
      }

      const tab = drawerIdToBottomTab(id);
      if (tab) {
        setPinnedBottomTab(tab);
        setActiveSalesNavTab(tab);
      }
      setDrawerActiveId(id);
      if (fullScreenOverlayRef.current) {
        dismissShellOverlays();
      }
      resetSalesStackForDrawerId(id);
    },
    [dismissShellOverlays, recordShopSelect],
  );

  const tabDrawerCacheRef = useRef<Partial<Record<SalesBottomTabId, string>>>(
    {},
  );

  const handleBottomTab = useCallback(
    (tab: SalesBottomTabId) => {
      if (activeBottomTab !== tab) {
        tabDrawerCacheRef.current[activeBottomTab] = drawerActiveId;
      }
      const drawerId =
        tabDrawerCacheRef.current[tab] ??
        bottomTabToDrawerIdForRole(tab, appRole);
      setPinnedBottomTab(tab);
      setActiveSalesNavTab(tab);
      setDrawerActiveId(drawerId);
      jumpToSalesBottomTab(tab);
      navigateSalesStackForBottomTab(tab, drawerId);
      if (fullScreenOverlayRef.current) {
        dismissShellOverlays();
      }
    },
    [activeBottomTab, appRole, dismissShellOverlays, drawerActiveId],
  );

  /** Drawer đã bỏ; giữ callback rỗng cho màn overlay cũ còn khai báo prop. */
  const drawerNoop = useCallback(() => {}, []);

  const stackActions = useMemo((): SalesStackActions => {
    return {
      onOpenDrawer: drawerNoop,
      onOpenOrder: ref => setOrderDetailRef(ref),
      onOpenInvoice: id => {
        const s = id.trim();
        if (s) {
          setInvoiceDetailId(s);
        }
      },
      onOpenSettlement: ref => {
        const s = ref.trim();
        if (s) {
          setSettlementDetailRef(s);
        }
      },
      onOpenPayment: ref => {
        const s = ref.trim();
        if (s) {
          setPaymentDetailRef(s);
        }
      },
      onCreateOrder: preferredShopId => {
        setCreateOrderInitialShopId(preferredShopId);
        setCreateOrderOpen(true);
      },
      onCreateProduct: () => setCreateProductOpen(true),
      onCreateSupplier: () => setCreateSupplierOpen(true),
      onCreateCustomer: () => setCreateCustomerOpen(true),
      onOpenSupplier: id => setSupplierDetailId(id),
      onCreatePriceList: () => setCreatePriceListOpen(true),
      onCreateServicePricing: () => setCreateServicePricingOpen(true),
      servicePricingReloadSignal,
      onOpenPriceList: (id: number) => {
        setCreatePriceListOpen(false);
        setEditPriceListId(null);
        setPriceListDetailId(id);
      },
      onEditPriceList: (id: number) => {
        setCreatePriceListOpen(false);
        setPriceListDetailId(null);
        setEditPriceListId(id);
      },
      onOpenProduct: (id: number) => {
        setCreateProductOpen(false);
        setProductDetailId(id);
      },
      onOpenCustomer: (id: number) => {
        setCreateCustomerOpen(false);
        setCustomerDetailId(id);
      },
      onOpenInventoryProduct: (id: number) => {
        setInventoryProductDetailId(id);
      },
      onCreatePurchaseOrder: () => {
        setPurchaseOrderEditRef(null);
        setCreatePurchaseOrderOpen(true);
      },
      onOpenPurchaseOrder: ref => {
        const r = ref.trim();
        if (r) {
          setPurchaseOrderDetailRef(r);
        }
      },
      onOpenCreateShop: () => setCreateShopOpen(true),
      onOpenShopDetail: id => setShopDetailId(id),
      onOpenEditShop: id => setEditShopId(id),
      onOpenCreateBankAccount: () => {
        setEditBankAccountId(null);
        setCreateBankAccountOpen(true);
      },
      onOpenEditBankAccount: id => {
        setCreateBankAccountOpen(false);
        setEditBankAccountId(id);
      },
      onOpenEditShipPartner: id => setEditShipPartnerSellerId(id),
      onOpenCreateStaff: () => setCreateStaffOpen(true),
      onOpenStaffDetail: id => setStaffDetailUserId(id),
      onOpenPackingOrder: ({ orderNumber }) => {
        const r = orderNumber.trim();
        if (r) {
          setPackingOrderDetailRef(r);
        }
      },
      onOpenOutboundOrder: ({ orderNumber }) => {
        const r = orderNumber.trim();
        if (r) {
          setOutboundOrderDetailRef(r);
        }
      },
      onOpenInboundOrder: ({ orderNumber }) => {
        const r = orderNumber.trim();
        if (r) {
          setInboundOrderDetailRef(r);
        }
      },
      onOpenTransferOrder: ({ orderNumber }) => {
        const r = orderNumber.trim();
        if (r) {
          setTransferOrderDetailRef(r);
        }
      },
      onOpenComboAssembly: ({ assemblyNumber }) => {
        const r = assemblyNumber.trim();
        if (r) {
          setComboAssemblyDetailRef(r);
        }
      },
    };
  }, [drawerNoop, servicePricingReloadSignal]);

  /** Từ tạo đơn — mở màn tạo khách trong stack (trang), ẩn tạm overlay đơn để giữ state. */
  const openCreateCustomerFromOrderFlow = useCallback(() => {
    setSuppressCreateOrderForStackCustomer(true);
    const go = () => {
      if (salesNavigationRef.isReady()) {
        navigateSalesStackScreen('CreateCustomer', {
          fromCreateOrder: true,
        });
      }
    };
    go();
    if (!salesNavigationRef.isReady()) {
      requestAnimationFrame(go);
    }
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      SALES_RESUME_CREATE_ORDER_OVERLAY,
      () => setSuppressCreateOrderForStackCustomer(false),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!createOrderOpen) {
      setSuppressCreateOrderForStackCustomer(false);
    }
  }, [createOrderOpen]);

  /** FCM: tap thông báo (cold start / đã mở app) — cùng `action_url` với API notifications. */
  useEffect(() => {
    setNotificationDeepLinkHandlers({
      onOpenOrder: ref => setOrderDetailRef(ref),
      onOpenInvoice: id => {
        const s = id.trim();
        if (s) {
          setInvoiceDetailId(s);
        }
      },
      onOpenSettlement: ref => {
        const s = ref.trim();
        if (s) {
          setSettlementDetailRef(s);
        }
      },
      onOpenPayment: ref => {
        const s = ref.trim();
        if (s) {
          setPaymentDetailRef(s);
        }
      },
      onOpenPurchaseOrder: ref => {
        const r = ref.trim();
        if (r) {
          setPurchaseOrderDetailRef(r);
        }
      },
      onOpenInboundOrder: ({ orderNumber }) => {
        const r = orderNumber.trim();
        if (r) {
          setInboundOrderDetailRef(r);
        }
      },
      onOpenPackingOrder: ({ orderNumber }) => {
        const r = orderNumber.trim();
        if (r) {
          setPackingOrderDetailRef(r);
        }
      },
      onOpenOutboundOrder: ({ orderNumber }) => {
        const r = orderNumber.trim();
        if (r) {
          setOutboundOrderDetailRef(r);
        }
      },
      onOpenTransferOrder: ({ orderNumber }) => {
        const r = orderNumber.trim();
        if (r) {
          setTransferOrderDetailRef(r);
        }
      },
      onOpenComboAssembly: ({ assemblyNumber }) => {
        const r = assemblyNumber.trim();
        if (r) {
          setComboAssemblyDetailRef(r);
        }
      },
    });
    flushPendingFcmNotificationOpen();
    return () => setNotificationDeepLinkHandlers(null);
  }, []);

  /** Đóng overlay full-screen (LIFO) — dùng cho nút back hệ thống. */
  const handleShellOverlayBackPress = useCallback((): boolean => {
    if (editProduct != null) {
      setEditProduct(null);
      return true;
    }
    if (editPriceListId != null) {
      setEditPriceListId(null);
      return true;
    }
    if (editShopId != null) {
      setEditShopId(null);
      return true;
    }
    if (editCustomerId != null) {
      setEditCustomerId(null);
      return true;
    }
    if (editSupplierId != null) {
      setEditSupplierId(null);
      return true;
    }
    if (editBankAccountId != null || createBankAccountOpen) {
      setCreateBankAccountOpen(false);
      setEditBankAccountId(null);
      return true;
    }
    if (editShipPartnerSellerId != null) {
      setEditShipPartnerSellerId(null);
      return true;
    }
    if (staffDetailUserId != null) {
      setStaffDetailUserId(null);
      return true;
    }
    if (createStaffOpen) {
      setCreateStaffOpen(false);
      return true;
    }
    /** Overlay lồng trên đơn hàng — đóng lớp trên trước. */
    if (invoiceDetailId != null) {
      setInvoiceDetailId(null);
      return true;
    }
    if (paymentDetailRef != null) {
      setPaymentDetailRef(null);
      return true;
    }
    if (settlementDetailRef != null) {
      setSettlementDetailRef(null);
      return true;
    }
    if (orderDetailRef != null) {
      setOrderDetailRef(null);
      return true;
    }
    if (productDetailId != null) {
      setProductDetailId(null);
      setEditProduct(null);
      return true;
    }
    if (priceListDetailId != null) {
      setPriceListDetailId(null);
      return true;
    }
    if (shopDetailId != null) {
      setShopDetailId(null);
      return true;
    }
    if (purchaseOrderDetailRef != null) {
      setPurchaseOrderDetailRef(null);
      return true;
    }
    if (packingOrderDetailRef != null) {
      setPackingOrderDetailRef(null);
      return true;
    }
    if (outboundOrderDetailRef != null) {
      setOutboundOrderDetailRef(null);
      return true;
    }
    if (inboundOrderDetailRef != null) {
      setInboundOrderDetailRef(null);
      return true;
    }
    if (transferOrderDetailRef != null) {
      setTransferOrderDetailRef(null);
      return true;
    }
    if (comboAssemblyDetailRef != null) {
      setComboAssemblyDetailRef(null);
      return true;
    }
    if (supplierDetailId != null) {
      setSupplierDetailId(null);
      return true;
    }
    if (customerDetailId != null) {
      setCustomerDetailId(null);
      return true;
    }
    if (inventoryProductDetailId != null) {
      setInventoryProductDetailId(null);
      return true;
    }
    if (createPurchaseOrderOpen) {
      setCreatePurchaseOrderOpen(false);
      setPurchaseOrderEditRef(null);
      return true;
    }
    if (createPriceListOpen) {
      setCreatePriceListOpen(false);
      return true;
    }
    if (createServicePricingOpen) {
      setCreateServicePricingOpen(false);
      return true;
    }
    if (createShopOpen) {
      setCreateShopOpen(false);
      return true;
    }
    if (createCustomerOpen) {
      setCreateCustomerOpen(false);
      return true;
    }
    if (createSupplierOpen) {
      setCreateSupplierOpen(false);
      return true;
    }
    if (createProductOpen) {
      setCreateProductOpen(false);
      return true;
    }
    if (createOrderOpen) {
      setCreateOrderOpen(false);
      setCreateOrderInitialShopId(undefined);
      return true;
    }
    return false;
  }, [
    createBankAccountOpen,
    createCustomerOpen,
    createOrderOpen,
    createPriceListOpen,
    createServicePricingOpen,
    createProductOpen,
    createPurchaseOrderOpen,
    createShopOpen,
    createStaffOpen,
    createSupplierOpen,
    customerDetailId,
    editBankAccountId,
    editCustomerId,
    editPriceListId,
    editProduct,
    editShipPartnerSellerId,
    editShopId,
    editSupplierId,
    inventoryProductDetailId,
    invoiceDetailId,
    settlementDetailRef,
    paymentDetailRef,
    orderDetailRef,
    priceListDetailId,
    productDetailId,
    purchaseOrderDetailRef,
    packingOrderDetailRef,
    outboundOrderDetailRef,
    inboundOrderDetailRef,
    transferOrderDetailRef,
    comboAssemblyDetailRef,
    shopDetailId,
    staffDetailUserId,
    supplierDetailId,
  ]);

  const handleShellFallbackBackPress = useCallback((): boolean => {
    if (salesNavigationRef.isReady() && salesNavigationRef.canGoBack()) {
      salesNavigationRef.goBack();
      return true;
    }
    if (drawerActiveId !== 'dashboard') {
      handleDrawerNavigate('dashboard');
      return true;
    }
    return false;
  }, [drawerActiveId, handleDrawerNavigate]);

  /**
   * Khi overlay mở, đăng ký BackHandler sau NavigationContainer để ưu tiên đóng overlay
   * thay vì để React Navigation `goBack()` trên stack phía sau (gây “không back được”).
   */
  useLayoutEffect(() => {
    if (!fullScreenOverlay) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!fullScreenOverlayRef.current) {
        return false;
      }
      return handleShellOverlayBackPress();
    });
    return () => sub.remove();
  }, [fullScreenOverlay, handleShellOverlayBackPress]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (fullScreenOverlayRef.current) {
        return handleShellOverlayBackPress();
      }
      return handleShellFallbackBackPress();
    });
    return () => sub.remove();
  }, [handleShellFallbackBackPress, handleShellOverlayBackPress]);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <SalesStackActionsProvider value={stackActions}>
        <SalesShellNavProvider
          activeDrawerId={drawerActiveId}
          navigateByDrawerId={handleDrawerNavigate}
          menuShops={menuShopsForNav}
          appRole={appRole}
        >
          <View style={styles.shell}>
            <View style={styles.mainFill}>
              <SalesNavTree
                theme={salesNavTheme}
                appRole={appRole}
                visibleTabs={visibleBottomTabs}
                initialTab={activeBottomTab}
                onSelectTab={handleBottomTab}
                tabIcons={bottomNavChrome.icons}
                tabAccessibilityLabels={bottomTabLabels}
                tabLabels={bottomTabLabels}
                navVariant={bottomNavChrome.variant}
                tabBarHidden={fullScreenOverlay}
              />
            </View>

          {fullScreenOverlay ? (
            <ShellOverlayWithEdgeBack
              onBack={handleShellOverlayBackPress}
              pointerEvents="box-none"
              edgeBackEnabled={
                !(createOrderOpen && suppressCreateOrderForStackCustomer)
              }
            >
          {createOrderOpen ? (
            <View
              style={[
                styles.overlay,
                suppressCreateOrderForStackCustomer &&
                  styles.overlayPassThrough,
              ]}
              pointerEvents={
                suppressCreateOrderForStackCustomer ? 'none' : 'box-none'
              }
            >
              <CreateOrderScreen
                initialShopId={createOrderInitialShopId}
                onOpenDrawer={drawerNoop}
                onOpenCreateCustomer={openCreateCustomerFromOrderFlow}
                onBack={() => {
                  setCreateOrderOpen(false);
                  setCreateOrderInitialShopId(undefined);
                }}
                onOrderCreated={record => {
                  setCreateOrderOpen(false);
                  setCreateOrderInitialShopId(undefined);
                  const ref =
                    record.order_number?.trim() ||
                    (Number.isFinite(record.id) ? String(record.id) : '');
                  if (ref) {
                    setOrderDetailRef(ref);
                  }
                }}
              />
            </View>
          ) : null}

          {createProductOpen ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <CreateProductScreen
                onOpenDrawer={drawerNoop}
                onBack={() => setCreateProductOpen(false)}
              />
            </View>
          ) : null}

          {createSupplierOpen ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <CreateSupplierScreen
                onOpenDrawer={drawerNoop}
                onBack={() => setCreateSupplierOpen(false)}
              />
            </View>
          ) : null}

          {createCustomerOpen ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <CreateCustomerScreen
                onOpenDrawer={drawerNoop}
                onBack={() => setCreateCustomerOpen(false)}
              />
            </View>
          ) : null}

          {customerDetailId != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <CustomerDetailScreen
                customerId={customerDetailId}
                reloadSignal={customerDetailReload}
                onOpenDrawer={drawerNoop}
                onBack={() => setCustomerDetailId(null)}
                onEditCustomer={id => setEditCustomerId(id)}
                onOpenOrder={ref => setOrderDetailRef(ref)}
              />
            </View>
          ) : null}

          {editCustomerId != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <EditCustomerScreen
                key={editCustomerId}
                customerId={editCustomerId}
                onOpenDrawer={drawerNoop}
                onBack={() => setEditCustomerId(null)}
                onSaved={() => {
                  setCustomerDetailReload(n => n + 1);
                  setEditCustomerId(null);
                }}
              />
            </View>
          ) : null}

          {inventoryProductDetailId != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <InventoryProductDetailScreen
                key={inventoryProductDetailId}
                productId={inventoryProductDetailId}
                reloadSignal={inventoryProductDetailReload}
                onOpenDrawer={drawerNoop}
                onBack={() => setInventoryProductDetailId(null)}
              />
            </View>
          ) : null}

          {createPurchaseOrderOpen ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <CreatePurchaseOrderScreen
                key={purchaseOrderEditRef ?? 'create-po'}
                editOrderRef={purchaseOrderEditRef}
                onOpenDrawer={drawerNoop}
                onBack={() => {
                  setCreatePurchaseOrderOpen(false);
                  setPurchaseOrderEditRef(null);
                }}
                onCreated={order => {
                  setCreatePurchaseOrderOpen(false);
                  setPurchaseOrderEditRef(null);
                  const whId = order.warehouse_id ?? null;
                  if (whId != null) {
                    void (async () => {
                      try {
                        await dispatch(setSelectedWarehouse(whId)).unwrap();
                        await dispatch(
                          switchShopContextWarehouse(whId),
                        ).unwrap();
                      } catch {
                        // vẫn đồng bộ kho đã chọn cục bộ nếu API context lỗi
                      }
                    })();
                  }
                  const ref =
                    order.order_number?.trim() ||
                    (Number.isFinite(order.id) ? String(order.id) : '');
                  if (ref) {
                    setPurchaseOrderDetailRef(ref);
                  }
                }}
                onUpdated={order => {
                  setCreatePurchaseOrderOpen(false);
                  setPurchaseOrderEditRef(null);
                  const whId = order.warehouse_id ?? null;
                  if (whId != null) {
                    void (async () => {
                      try {
                        await dispatch(setSelectedWarehouse(whId)).unwrap();
                        await dispatch(
                          switchShopContextWarehouse(whId),
                        ).unwrap();
                      } catch {
                        // ignore
                      }
                    })();
                  }
                  const ref =
                    order.order_number?.trim() ||
                    (Number.isFinite(order.id) ? String(order.id) : '');
                  if (ref) {
                    setPurchaseOrderDetailRef(ref);
                  }
                }}
              />
            </View>
          ) : null}

          {purchaseOrderDetailRef != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <PurchaseOrderDetailScreen
                orderRef={purchaseOrderDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setPurchaseOrderDetailRef(null)}
                onEditPurchaseOrder={ref => {
                  setPurchaseOrderDetailRef(null);
                  setPurchaseOrderEditRef(ref);
                  setCreatePurchaseOrderOpen(true);
                }}
              />
            </View>
          ) : null}

          {packingOrderDetailRef != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <PackingOrderDetailScreen
                key={packingOrderDetailRef}
                packingOrderRef={packingOrderDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setPackingOrderDetailRef(null)}
                onOpenSaleOrder={orderNo => {
                  setPackingOrderDetailRef(null);
                  setOrderDetailRef(orderNo);
                }}
              />
            </View>
          ) : null}

          {outboundOrderDetailRef != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <OutboundOrderDetailScreen
                key={outboundOrderDetailRef}
                outboundOrderRef={outboundOrderDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setOutboundOrderDetailRef(null)}
                onOpenSaleOrder={orderNo => {
                  setOutboundOrderDetailRef(null);
                  setOrderDetailRef(orderNo);
                }}
                onOpenPackingOrder={pkNo => {
                  setOutboundOrderDetailRef(null);
                  setPackingOrderDetailRef(pkNo);
                }}
              />
            </View>
          ) : null}

          {inboundOrderDetailRef != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <InboundOrderDetailScreen
                key={inboundOrderDetailRef}
                inboundOrderRef={inboundOrderDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setInboundOrderDetailRef(null)}
                onOpenSaleOrder={orderNo => {
                  setInboundOrderDetailRef(null);
                  setOrderDetailRef(orderNo);
                }}
                onOpenPurchaseOrder={poRef => {
                  setInboundOrderDetailRef(null);
                  setPurchaseOrderDetailRef(poRef);
                }}
              />
            </View>
          ) : null}

          {transferOrderDetailRef != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <TransferOrderDetailScreen
                key={transferOrderDetailRef}
                transferOrderRef={transferOrderDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setTransferOrderDetailRef(null)}
                onOpenOutboundOrder={orderNo => {
                  const r = orderNo.trim();
                  if (!r) {
                    return;
                  }
                  setTransferOrderDetailRef(null);
                  setOutboundOrderDetailRef(r);
                }}
                onOpenInboundOrder={orderNo => {
                  const r = orderNo.trim();
                  if (!r) {
                    return;
                  }
                  setTransferOrderDetailRef(null);
                  setInboundOrderDetailRef(r);
                }}
                onOpenSaleOrder={orderNo => {
                  const r = orderNo.trim();
                  if (!r) {
                    return;
                  }
                  setTransferOrderDetailRef(null);
                  setOrderDetailRef(r);
                }}
              />
            </View>
          ) : null}

          {comboAssemblyDetailRef != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <ComboAssemblyDetailScreen
                key={comboAssemblyDetailRef}
                assemblyRef={comboAssemblyDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setComboAssemblyDetailRef(null)}
              />
            </View>
          ) : null}

          {supplierDetailId != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <SupplierDetailScreen
                supplierId={supplierDetailId}
                reloadSignal={supplierDetailReload}
                onOpenDrawer={drawerNoop}
                onBack={() => setSupplierDetailId(null)}
                onEditSupplier={id => setEditSupplierId(id)}
                onOpenPurchaseOrder={ref => {
                  const r = ref?.trim();
                  if (r) {
                    setPurchaseOrderDetailRef(r);
                  }
                }}
              />
            </View>
          ) : null}

          {editSupplierId != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <EditSupplierScreen
                supplierId={editSupplierId}
                onOpenDrawer={drawerNoop}
                onBack={() => setEditSupplierId(null)}
                onSaved={() => {
                  setSupplierDetailReload(n => n + 1);
                  setEditSupplierId(null);
                }}
              />
            </View>
          ) : null}

          {createPriceListOpen ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <CreatePriceListScreen
                onOpenDrawer={drawerNoop}
                onBack={() => setCreatePriceListOpen(false)}
              />
            </View>
          ) : null}

          {createServicePricingOpen ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <CreateServicePricingScreen
                onOpenDrawer={drawerNoop}
                onBack={() => setCreateServicePricingOpen(false)}
                onCreated={() =>
                  setServicePricingReloadSignal(n => n + 1)
                }
              />
            </View>
          ) : null}

          {createShopOpen ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <CreateShopScreen
                onOpenDrawer={drawerNoop}
                onBack={() => setCreateShopOpen(false)}
              />
            </View>
          ) : null}

          {createBankAccountOpen || editBankAccountId != null ? (
            <View
              style={[
                styles.overlay,
                editBankAccountId != null ? styles.overlayTop : null,
              ]}
              pointerEvents="box-none"
            >
              <CreateBankAccountScreen
                onOpenDrawer={drawerNoop}
                bankAccountId={editBankAccountId}
                onBack={() => {
                  setCreateBankAccountOpen(false);
                  setEditBankAccountId(null);
                }}
                onCreated={() => {
                  void dispatch(
                    fetchBankAccountDirectory({
                      page: 1,
                      per_page: 10,
                      status: 'all',
                      isDefaultFilter: 'all',
                    }),
                  );
                }}
              />
            </View>
          ) : null}

          {editShipPartnerSellerId != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <EditShipPartnerConnectionScreen
                key={editShipPartnerSellerId}
                sellerShippingPartnerSellerId={editShipPartnerSellerId}
                onOpenDrawer={drawerNoop}
                onBack={() => setEditShipPartnerSellerId(null)}
                onSaved={() => {
                  void dispatch(
                    fetchShipPartnerDirectory({
                      page: 1,
                      per_page: 10,
                      status: 'all',
                    }),
                  );
                }}
              />
            </View>
          ) : null}

          {createStaffOpen ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <CreateStaffScreen
                onOpenDrawer={drawerNoop}
                onBack={() => setCreateStaffOpen(false)}
                onCreated={() => {
                  void dispatch(fetchStaffUserCounts());
                  void dispatch(
                    fetchStaffUserDirectory({
                      page: 1,
                      per_page: 10,
                      status: 'all',
                      role: 'all',
                    }),
                  );
                  setStaffDetailReload(n => n + 1);
                }}
              />
            </View>
          ) : null}

          {staffDetailUserId != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <StaffDetailScreen
                key={staffDetailUserId}
                staffUserId={staffDetailUserId}
                reloadSignal={staffDetailReload}
                onOpenDrawer={drawerNoop}
                onBack={() => setStaffDetailUserId(null)}
                onStaffUpdated={() => {
                  void dispatch(fetchStaffUserCounts());
                  void dispatch(
                    fetchStaffUserDirectory({
                      page: 1,
                      per_page: 10,
                      status: 'all',
                      role: 'all',
                    }),
                  );
                }}
              />
            </View>
          ) : null}

          {shopDetailId != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <ShopDetailScreen
                shopId={shopDetailId}
                reloadSignal={shopDetailReload}
                onOpenDrawer={drawerNoop}
                onBack={() => setShopDetailId(null)}
                onEditShop={id => setEditShopId(id)}
                onOpenProduct={id => {
                  setShopDetailId(null);
                  setProductDetailId(id);
                }}
              />
            </View>
          ) : null}

          {editShopId != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <EditShopScreen
                shopId={editShopId}
                onOpenDrawer={drawerNoop}
                onBack={() => setEditShopId(null)}
                onSaved={() => {
                  setShopDetailReload(n => n + 1);
                }}
              />
            </View>
          ) : null}

          {priceListDetailId != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <PriceListDetailScreen
                priceListId={priceListDetailId}
                reloadSignal={priceListDetailReload}
                onOpenDrawer={drawerNoop}
                onBack={() => setPriceListDetailId(null)}
                onEditPriceList={id => setEditPriceListId(id)}
                onOpenProduct={id => {
                  setPriceListDetailId(null);
                  setProductDetailId(id);
                }}
              />
            </View>
          ) : null}

          {editPriceListId != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <EditPriceListScreen
                priceListId={editPriceListId}
                onOpenDrawer={drawerNoop}
                onBack={() => setEditPriceListId(null)}
                onSaved={() => setPriceListDetailReload(n => n + 1)}
              />
            </View>
          ) : null}

          {orderDetailRef != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <OrderDetailScreen
                orderRef={orderDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setOrderDetailRef(null)}
                onOpenPayment={ref => {
                  const s = ref.trim();
                  if (s) {
                    setPaymentDetailRef(s);
                  }
                }}
                onOpenInvoice={ref => {
                  const s = ref.trim();
                  if (s) {
                    setInvoiceDetailId(s);
                  }
                }}
              />
            </View>
          ) : null}

          {invoiceDetailId != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <InvoiceDetailScreen
                key={invoiceDetailId}
                invoiceId={invoiceDetailId}
                onOpenDrawer={drawerNoop}
                onBack={() => setInvoiceDetailId(null)}
                onOpenSettlement={ref => {
                  const s = ref.trim();
                  if (s) {
                    setSettlementDetailRef(s);
                  }
                }}
              />
            </View>
          ) : null}

          {settlementDetailRef != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <SettlementDetailScreen
                key={settlementDetailRef}
                settlementRef={settlementDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setSettlementDetailRef(null)}
              />
            </View>
          ) : null}

          {paymentDetailRef != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <PaymentDetailScreen
                key={paymentDetailRef}
                paymentRef={paymentDetailRef}
                onOpenDrawer={drawerNoop}
                onBack={() => setPaymentDetailRef(null)}
                onOpenOrder={orderNum => {
                  const r = orderNum.trim();
                  if (r) {
                    setPaymentDetailRef(null);
                    setOrderDetailRef(r);
                  }
                }}
              />
            </View>
          ) : null}

          {productDetailId != null ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <ProductDetailScreen
                productId={productDetailId}
                reloadSignal={productDetailReload}
                onOpenDrawer={drawerNoop}
                onBack={() => {
                  setProductDetailId(null);
                  setEditProduct(null);
                }}
                onEditProduct={p => setEditProduct(p)}
                onOpenPriceList={id => {
                  setProductDetailId(null);
                  setEditProduct(null);
                  setPriceListDetailId(id);
                }}
              />
            </View>
          ) : null}

          {editProduct != null ? (
            <View
              style={[styles.overlay, styles.overlayTop]}
              pointerEvents="box-none"
            >
              <EditProductScreen
                product={editProduct}
                onOpenDrawer={drawerNoop}
                onBack={() => setEditProduct(null)}
                onSaved={() => {
                  setProductDetailReload(n => n + 1);
                }}
              />
            </View>
          ) : null}

            </ShellOverlayWithEdgeBack>
          ) : null}

          </View>
        </SalesShellNavProvider>
      </SalesStackActionsProvider>
    </SafeAreaView>
  );
}

function create_SalesLayout_styles(c: AppColorPalette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.bg,
    },
    shell: {
      flex: 1,
      position: 'relative',
      backgroundColor: c.bg,
    },
    mainFill: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 40,
      backgroundColor: c.bgModal,
    },
    /** Cho phép tương tác xuống stack bên dưới (màn `CreateCustomer` trong navigator). */
    overlayPassThrough: {
      opacity: 0,
      pointerEvents: 'none',
    },
    overlayTop: {
      zIndex: 50,
    },
  });
}
