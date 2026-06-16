import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
import { FormScreenHeading } from '@shared/components/ui/FormScreenHeading';
import { TextField } from '@shared/components/ui/TextField';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { FormDatePickerField } from '../../category/priceList/components/FormDatePickerField';
import { AddProductModal } from '../components/AddProductModal';
import { CustomerSearchCombo } from '../components/CustomerSearchCombo';
import { SalesScreenHeader } from '../components/SalesScreenHeader';
import type { SaleOrderCreatedRecord } from '@services/sales/saleOrderApiTypes';
import {
  SALES_ORDER_DISTRICT_DROPDOWN_KEY,
  SALES_ORDER_PACKING_WAREHOUSE_DROPDOWN_KEY,
  SALES_ORDER_PROVINCE_DROPDOWN_KEY,
  SALES_ORDER_SHIP_PAYER_DROPDOWN_KEY,
  SALES_ORDER_SHIPPING_PARTNER_DROPDOWN_KEY,
  SALES_ORDER_SHIPPING_WAREHOUSE_DROPDOWN_KEY,
  SALES_ORDER_WARD_DROPDOWN_KEY,
  SALES_SHOP_DROPDOWN_KEY,
} from '../../dropdownFrequency/dropdownFrequencyKeys';
import { type DropdownAccountKey } from '@services/system/dropdownFrequencySlice';
import { useFrequencyDropdown } from '../../dropdownFrequency/useFrequencyDropdown';
import {
  computeLineTotal,
  startOfDay,
  type SelectOption,
} from './createOrder/createOrderUtils';

const ORDER_DATE_RANGE_DAYS = 420;
import { useCreateOrderForm } from './createOrder/useCreateOrderForm';

const pickerItemFill = { flex: 1 } as const;

export type CreateOrderScreenProps = {
  onOpenDrawer: () => void;
  onBack: () => void;
  /** Khi có callback, sau khi tạo thành công sẽ gọi thay cho hộp thoại chỉ báo thành công. */
  onOrderCreated?: (record: SaleOrderCreatedRecord) => void;
  /** Mở form từ màn đơn theo shop — gán sẵn cửa hàng. */
  initialShopId?: number;
  /** Mở màn tạo khách (overlay) thay cho modal trong ô tìm khách. */
  onOpenCreateCustomer?: () => void;
};

function FormSelect<T extends string | number>({
  label,
  required,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  modalTitle,
  frequencyKey,
  frequencyAccountKey,
}: {
  label: string;
  required?: boolean;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  disabled?: boolean;
  modalTitle: string;
  frequencyKey?: string;
  frequencyAccountKey?: DropdownAccountKey | null;
}) {
  const insets = useSafeAreaInsets();
  const palette = useAppColors();
  const fs = useThemeStyleSheet(createCreateOrderFsStyles);
  const [open, setOpen] = useState(false);
  const { sortedOptions, handleSelect } = useFrequencyDropdown(
    frequencyKey ?? '__disabled_create_order_select__',
    options,
    frequencyAccountKey,
  );
  const displayOptions = frequencyKey ? sortedOptions : options;
  const selected = options.find(o => o.value === value);
  const display = selected?.label ?? placeholder ?? 'Chọn…';

  const renderPickerItem = useCallback(
    ({ item }: { item: SelectOption<T> }) => (
      <Pressable
        style={fs.row}
        onPress={() => {
          onChange(item.value);
          if (frequencyKey) {
            handleSelect(item.value);
          }
          setOpen(false);
        }}
      >
        <View style={pickerItemFill}>
          <Text style={fs.rowTitle}>{item.label}</Text>
          {item.subtitle ? (
            <Text style={fs.rowSub}>{item.subtitle}</Text>
          ) : null}
        </View>
        {value === item.value ? (
          <SystemIcon name="check" size={18} color={palette.teal} />
        ) : null}
      </Pressable>
    ),
    [
      onChange,
      frequencyKey,
      handleSelect,
      setOpen,
      value,
      palette.teal,
      fs.row,
      fs.rowTitle,
      fs.rowSub,
    ],
  );

  const pickerKeyExtractor = useCallback(
    (item: SelectOption<T>) => String(item.value),
    [],
  );

  return (
    <View style={[fs.wrap, fs.wrapGrow]}>
      <Text style={fs.lab}>
        {label}
        {required ? <Text style={fs.req}> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        style={[fs.field, disabled && fs.fieldDis]}
        disabled={disabled}
      >
        <Text style={[fs.fieldTxt, !selected && fs.fieldPh]} numberOfLines={1}>
          {display}
        </Text>
        <SystemIcon name="chevronDown" size={14} color={palette.textMuted} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={fs.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[fs.sheet, { paddingBottom: insets.bottom + 16 }]}
            onPress={e => e.stopPropagation()}
          >
            <Text style={fs.sheetTitle}>{modalTitle}</Text>
            <FlatList
              style={fs.list}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              data={displayOptions}
              keyExtractor={pickerKeyExtractor}
              renderItem={renderPickerItem}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SectionCard({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  const sec = useThemeStyleSheet(createCreateOrderSecStyles);
  return (
    <View style={sec.card}>
      <Text style={sec.title}>
        <Text style={sec.num}>{index}. </Text>
        {title}
      </Text>
      {children}
    </View>
  );
}

function RadioRow({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  const rad = useThemeStyleSheet(createCreateOrderRadStyles);
  return (
    <Pressable style={rad.row} onPress={onPress}>
      <View style={[rad.dot, selected && rad.dotOn]} />
      <Text style={rad.lab}>{label}</Text>
    </Pressable>
  );
}

export function CreateOrderScreen({
  onOpenDrawer,
  onBack,
  onOrderCreated,
  initialShopId,
  onOpenCreateCustomer,
}: CreateOrderScreenProps) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const styles = useThemeStyleSheet(createCreateOrderScreenStyles);
  const fs = useThemeStyleSheet(createCreateOrderFsStyles);

  const {
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
    needPartnerWarning,
    shipPayerOptions,
    MIN_CUSTOMER_SEARCH_LEN,
    provinceOptions,
    districtOptions,
    wardOptions,
    subtotal,
    orderDiscountVnd,
    total,
    shopSelected,
    sellerShippingContextId,
    packingWarehouseCode,
  } = useCreateOrderForm({ initialShopId, onBack, onOrderCreated });

  const orderDateMin = useMemo(() => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() - ORDER_DATE_RANGE_DAYS);
    return d;
  }, []);

  const orderDateMax = useMemo(() => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() + ORDER_DATE_RANGE_DAYS);
    return d;
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[ canvasListScrollContent(),
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormScreenHeading sectionLabel="Đơn hàng" title="Tạo đơn hàng" />

        <SectionCard index={1} title="Thiết lập đơn hàng">
          <View style={styles.row3}>
            <View style={styles.colFlex}>
              <FormSelect
                label="Cửa hàng"
                required
                value={shopId}
                options={shopOptions}
                onChange={setShopId}
                placeholder={menuLoading ? 'Đang tải…' : 'Chọn cửa hàng'}
                disabled={menuLoading || shopOptions.length === 0}
                modalTitle="Chọn cửa hàng"
                frequencyKey={SALES_SHOP_DROPDOWN_KEY}
                frequencyAccountKey={dropdownAccountKey}
              />
            </View>
          </View>
          <View style={[styles.rowPair, styles.mt]}>
            <View style={styles.colFlex}>
              <FormSelect
                label="Kho đóng gói"
                required
                value={packingWarehouseId}
                options={warehouseOptions}
                onChange={setPackingWarehouseId}
                placeholder="Chọn kho"
                disabled={warehouseOptions.length === 0}
                modalTitle="Chọn kho đóng gói"
                frequencyKey={SALES_ORDER_PACKING_WAREHOUSE_DROPDOWN_KEY}
                frequencyAccountKey={dropdownAccountKey}
              />
            </View>
            <View style={[styles.colFlex, styles.colCustomerCombo]}>
              <CustomerSearchCombo
                labelBackgroundColor={colors.bgCard}
                value={selectedCustomer}
                onChange={handleCustomerChange}
                customers={customerHits}
                recentCustomers={recentCustomerSuggestions}
                remoteSearch
                onQueryChange={handleCustomerQueryChange}
                remoteLoading={customerSearchLoading}
                remoteError={customerSearchError}
                minSearchLength={MIN_CUSTOMER_SEARCH_LEN}
                onOpenCreateCustomer={onOpenCreateCustomer}
              />
              {selectedCustomer ? (
                <View style={styles.custShipFoot}>
                  {customerShipmentsLoading ? (
                    <View style={styles.custShipRow}>
                      <ActivityIndicator
                        size="small"
                        color={colors.tealLight}
                      />
                      <Text style={styles.custShipHint}>Đang tải vận đơn…</Text>
                    </View>
                  ) : customerShipmentsError ? (
                    <Text style={styles.fieldErr}>
                      {customerShipmentsError}
                    </Text>
                  ) : customerShipmentsMeta != null ? (
                    <Text style={styles.custShipHint}>
                      {customerShipmentsMeta.total === 0
                        ? 'Khách chưa có vận đơn trong hệ thống.'
                        : `${customerShipmentsMeta.total} vận đơn liên quan (đã đồng bộ).`}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        </SectionCard>

        <SectionCard index={2} title="Sản phẩm">
          <View style={styles.prodHeader}>
            {orderLines.length > 0 ? (
              <Text style={styles.prodCount} numberOfLines={1}>
                {orderLines.length} mặt hàng
              </Text>
            ) : (
              <View style={styles.prodHeaderSpacer} />
            )}
            <Button
              title="+ Thêm sản phẩm"
              variant="outline"
              size="sm"
              disabled={!shopSelected}
              onPress={() => shopSelected && setAddProductOpen(true)}
              style={!shopSelected ? styles.btnAddProdDim : undefined}
            />
          </View>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.thNum]}>#</Text>
            <Text style={[styles.th, styles.thName]}>Sản phẩm</Text>
            <Text style={[styles.th, styles.thQty]}>SL</Text>
            <Text style={[styles.th, styles.thPrice]}>Đơn giá</Text>
            <Text style={[styles.th, styles.thDisc]}>Giảm</Text>
            <Text style={[styles.th, styles.thTotal]}>Tổng</Text>
          </View>
          {orderLines.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcoSlot}>
                <SystemIcon name="package" size={40} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTxt}>
                {shopSelected
                  ? 'Chưa có sản phẩm. Nhấn thêm sản phẩm để bắt đầu.'
                  : 'Không có sản phẩm. Vui lòng chọn cửa hàng trước'}
              </Text>
            </View>
          ) : (
            <View style={styles.tableBody}>
              {orderLines.map((line, idx) => (
                <View
                  key={line.key}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowAlt : null,
                    idx === orderLines.length - 1 ? styles.tableRowLast : null,
                  ]}
                >
                  <Text style={[styles.td, styles.thNum]}>{idx + 1}</Text>
                  <View style={[styles.thName, styles.tdNameCell]}>
                    {line.thumbnailUrl ? (
                      <Image
                        source={{ uri: line.thumbnailUrl }}
                        style={styles.prodThumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.prodThumbPlaceholder}>
                        <SystemIcon name="package" size={16} color={colors.textMuted} />
                      </View>
                    )}
                    <Text style={[styles.td, styles.tdNameText]} numberOfLines={2}>
                      {line.productName}
                    </Text>
                  </View>
                  <Text style={[styles.td, styles.thQty]}>{line.quantity}</Text>
                  <Text style={[styles.td, styles.thPrice]}>
                    {line.unitPrice.toLocaleString('vi-VN')}
                  </Text>
                  <Text style={[styles.td, styles.thDisc]}>
                    {line.discountPercent}%
                  </Text>
                  <Text style={[styles.td, styles.thTotal]}>
                    {computeLineTotal(line).toLocaleString('vi-VN')}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {orderLines.length === 0 ? (
            <Button
              title="+ Thêm sản phẩm đầu tiên"
              variant="outline"
              size="sm"
              disabled={!shopSelected}
              onPress={() => shopSelected && setAddProductOpen(true)}
              style={[
                styles.firstProdBtn,
                !shopSelected && styles.btnAddProdDim,
              ]}
            />
          ) : null}
        </SectionCard>

        <SectionCard index={3} title="Giao hàng & Thanh toán">
          <View style={styles.shipGrid}>
            <View style={styles.shipCol}>
              <Text style={styles.blockLab}>Phương thức giao hàng</Text>
              <RadioRow
                selected={shippingMode === 'seller'}
                label="Đối tác của seller"
                onPress={() => setShippingMode('seller')}
              />
              <RadioRow
                selected={shippingMode === 'warehouse'}
                label="Đối tác vận chuyển"
                onPress={() => setShippingMode('warehouse')}
              />
              <RadioRow
                selected={shippingMode === 'pickup'}
                label="Khách tự đến lấy"
                onPress={() => setShippingMode('pickup')}
              />

              {shippingMode === 'warehouse' ? (
                <View style={styles.mt}>
                  <FormSelect
                    label="Chọn đối tác vận chuyển"
                    required
                    value={warehousePartnerId}
                    options={warehousePartnerOptions}
                    onChange={setWarehousePartnerId}
                    placeholder={
                      packingWarehouseCode == null
                        ? 'Chọn kho đóng gói trước'
                        : shippingPartnersLoading
                        ? 'Đang tải đối tác vận chuyển…'
                        : warehousePartnerOptions.length === 0
                        ? 'Chưa có đối tác vận chuyển'
                        : 'Chọn đối tác vận chuyển'
                    }
                    disabled={
                      packingWarehouseCode == null ||
                      shippingPartnersLoading ||
                      warehousePartnerOptions.length === 0
                    }
                    modalTitle="Đối tác vận chuyển"
                    frequencyKey={SALES_ORDER_SHIPPING_PARTNER_DROPDOWN_KEY}
                    frequencyAccountKey={dropdownAccountKey}
                  />
                  {shippingPartnersError ? (
                    <Text style={styles.fieldErr}>{shippingPartnersError}</Text>
                  ) : null}
                </View>
              ) : null}

              {shippingMode === 'seller' ? (
                <View style={styles.mt}>
                  <Text style={styles.sellerBeLab}>Đối tác vận chuyển</Text>
                  <View style={styles.sellerBeBox}>
                    {sellerPartnersLoading ? (
                      <View style={styles.sellerBeLoading}>
                        <ActivityIndicator
                          size="small"
                          color={colors.tealLight}
                        />
                        <Text style={styles.sellerBeLoadingTxt}>
                          Đang kiểm tra cấu hình Best Express…
                        </Text>
                      </View>
                    ) : sellerPartnersError ? (
                      <Text style={styles.fieldErr}>{sellerPartnersError}</Text>
                    ) : sellerShippingContextId == null ? (
                      <Text style={styles.sellerBeMuted}>
                        Không có thông tin seller để tải cấu hình.
                      </Text>
                    ) : sellerBestExpressRow ? (
                      <>
                        <Text style={styles.sellerBeName}>
                          {sellerBestExpressRow.shipping_partner?.name?.trim() ||
                            'Best Express'}
                        </Text>
                        {sellerBestExpressRow.shipping_partner?.code ? (
                          <Text style={styles.sellerBeSub} numberOfLines={2}>
                            {sellerBestExpressRow.shipping_partner.code}
                          </Text>
                        ) : null}
                      </>
                    ) : (
                      <Text style={styles.sellerBeMuted}>
                        Chưa tìm thấy cấu hình Best Express cho seller.
                      </Text>
                    )}
                  </View>
                </View>
              ) : null}

              {shippingMode !== 'pickup' ? (
                <>
                  <View style={styles.mt}>
                    <FormSelect
                      label="Người trả phí ship"
                      value={shipPayer}
                      options={shipPayerOptions}
                      onChange={setShipPayer}
                      modalTitle="Người trả phí ship"
                      frequencyKey={SALES_ORDER_SHIP_PAYER_DROPDOWN_KEY}
                      frequencyAccountKey={dropdownAccountKey}
                    />
                  </View>

                  <View style={styles.mt}>
                    <TextField
                      variant="dark"
                      size="md"
                      label="Phí vận chuyển"
                      value={shippingFee}
                      onChangeText={setShippingFee}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                    <Text style={styles.hint}>
                      {shippingMode === 'warehouse' || shippingMode === 'seller'
                        ? shippingEstimate
                          ? 'Phí ô trên đã đồng bộ theo ước tính; bạn vẫn có thể chỉnh tay.'
                          : shippingMode === 'seller'
                          ? 'Best Express là đối tác vận chuyển cố định; đủ tỉnh / quận / phường và có ít nhất một dòng hàng để hệ thống ước tính phí.'
                          : 'Chọn đối tác vận chuyển, đủ tỉnh / quận / phường và có ít nhất một dòng hàng để hệ thống ước tính phí.'
                        : 'Có thể nhập phí ship thủ công hoặc bổ sung sau.'}
                    </Text>
                    {shippingMode === 'warehouse' ||
                    shippingMode === 'seller' ? (
                      <>
                        {shippingEstimateLoading ? (
                          <View style={styles.estLoadingRow}>
                            <ActivityIndicator
                              size="small"
                              color={colors.tealLight}
                            />
                            <Text style={styles.estLoadingTxt}>
                              Đang ước tính phí vận chuyển…
                            </Text>
                          </View>
                        ) : null}
                        {shippingEstimateError ? (
                          <Text style={styles.fieldErr}>
                            {shippingEstimateError}
                          </Text>
                        ) : null}
                        {shippingEstimate ? (
                          <View style={styles.estCard}>
                            <Text style={styles.estCardTitle}>
                              Kết quả ước tính
                            </Text>
                            {shippingEstimate.breakdown?.service_type ? (
                              <Text style={styles.estService} numberOfLines={2}>
                                {shippingEstimate.breakdown.service_type}
                              </Text>
                            ) : null}
                            <View style={styles.estRowPair}>
                              <Text style={styles.estLab}>Tổng phí</Text>
                              <Text style={styles.estVal}>
                                {shippingEstimate.total_fee.toLocaleString(
                                  'vi-VN',
                                )}{' '}
                                đ
                              </Text>
                            </View>
                            <View style={styles.estRowPair}>
                              <Text style={styles.estLab}>Phí giao</Text>
                              <Text style={styles.estVal}>
                                {shippingEstimate.shipping_fee.toLocaleString(
                                  'vi-VN',
                                )}{' '}
                                đ
                              </Text>
                            </View>
                            <View style={styles.estRowPair}>
                              <Text style={styles.estLab}>Phí COD</Text>
                              <Text style={styles.estVal}>
                                {shippingEstimate.cod_fee.toLocaleString(
                                  'vi-VN',
                                )}{' '}
                                đ
                              </Text>
                            </View>
                            <View style={styles.estRowPair}>
                              <Text style={styles.estLab}>Bảo hiểm</Text>
                              <Text style={styles.estVal}>
                                {shippingEstimate.insurance_fee.toLocaleString(
                                  'vi-VN',
                                )}{' '}
                                đ
                              </Text>
                            </View>
                            {shippingEstimate.remote_area_surcharge > 0 ? (
                              <View style={styles.estRowPair}>
                                <Text style={styles.estLab}>
                                  Phụ phí vùng xa
                                </Text>
                                <Text style={styles.estVal}>
                                  {shippingEstimate.remote_area_surcharge.toLocaleString(
                                    'vi-VN',
                                  )}{' '}
                                  đ
                                </Text>
                              </View>
                            ) : null}
                            {shippingEstimate.discount > 0 ? (
                              <View style={styles.estRowPair}>
                                <Text style={styles.estLab}>Giảm giá</Text>
                                <Text style={styles.estVal}>
                                  −
                                  {shippingEstimate.discount.toLocaleString(
                                    'vi-VN',
                                  )}{' '}
                                  đ
                                </Text>
                              </View>
                            ) : null}
                            <Text style={styles.estSource} numberOfLines={2}>
                              Nguồn: {shippingEstimate.source} ·{' '}
                              {shippingEstimate.currency_code}
                            </Text>
                          </View>
                        ) : null}
                      </>
                    ) : null}
                  </View>
                </>
              ) : (
                <View style={styles.mt}>
                  <Text style={styles.hint}>
                    Khách tự đến lấy, không tính phí vận chuyển.
                  </Text>
                </View>
              )}

              <View style={styles.codRow}>
                <Text style={styles.codLab}>Thu hộ COD</Text>
                <Switch
                  value={collectCod}
                  onValueChange={setCollectCod}
                  trackColor={{ false: colors.border, true: colors.tealDim }}
                  thumbColor={collectCod ? colors.tealLight : '#8899aa'}
                />
              </View>
            </View>

            <View style={styles.shipCol}>
              <Text style={styles.blockLab}>
                {shippingMode === 'pickup'
                  ? 'Thông tin người nhận'
                  : 'Người nhận'}
              </Text>
              {shippingMode === 'pickup' ? (
                <View style={styles.pickupInfoBox}>
                  <View style={styles.pickupInfoHead}>
                    <SystemIcon name="info" size={16} color={colors.blue} />
                    <SystemIcon name="package" size={16} color={colors.blue} />
                    <Text style={styles.pickupInfoMain}>
                      Khách nhận hàng tại kho; không cần nhập địa chỉ giao
                      hàng.
                    </Text>
                  </View>
                  <View style={styles.pickupPinBlock}>
                    <SystemIcon
                      name="location"
                      size={18}
                      color={colors.blue}
                      style={{ marginTop: 1 }}
                    />
                    <View style={styles.pickupPinText}>
                      <Text style={styles.pickupLocTitle} numberOfLines={2}>
                        Địa điểm nhận hàng: {pickupWarehouseDisplay.name}
                      </Text>
                      {pickupWarehouseDisplay.detail ? (
                        <Text style={styles.pickupLocAddr}>
                          {pickupWarehouseDisplay.detail}
                        </Text>
                      ) : (
                        <Text style={styles.pickupLocAddrMuted}>
                          Chưa có địa chỉ chi tiết cho kho này.
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  <TextField
                    variant="dark"
                    size="md"
                    label="Tên người nhận *"
                    value={recipientName}
                    onChangeText={setRecipientName}
                    placeholder="Họ tên"
                  />
                  <TextField
                    variant="dark"
                    size="md"
                    label="Số điện thoại *"
                    value={recipientPhone}
                    onChangeText={setRecipientPhone}
                    placeholder="09…"
                    keyboardType="phone-pad"
                    containerStyle={styles.mt}
                  />
                  <TextField
                    variant="dark"
                    size="md"
                    label="Địa chỉ *"
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Số nhà, đường…"
                    containerStyle={styles.mt}
                  />
                  <View style={[styles.row3, styles.mt]}>
                    <View style={styles.colFlex}>
                      <FormSelect
                        label="Tỉnh/Thành phố"
                        value={provinceId}
                        options={provinceOptions}
                        onChange={setProvinceId}
                        placeholder={
                          provincesLoading
                            ? 'Đang tải…'
                            : 'Chọn tỉnh/thành'
                        }
                        disabled={provincesLoading}
                        modalTitle="Tỉnh / Thành phố"
                        frequencyKey={SALES_ORDER_PROVINCE_DROPDOWN_KEY}
                        frequencyAccountKey={dropdownAccountKey}
                      />
                      {provincesError ? (
                        <Text style={styles.fieldErr}>{provincesError}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={[styles.rowPair, styles.mt]}>
                    <View style={styles.colFlex}>
                      <FormSelect
                        label="Quận/Huyện"
                        required
                        value={districtId}
                        options={districtOptions}
                        onChange={setDistrictId}
                        placeholder={
                          provinceId == null
                            ? 'Chọn tỉnh trước'
                            : districtsLoading
                            ? 'Đang tải…'
                            : 'Chọn quận/huyện'
                        }
                        disabled={provinceId == null || districtsLoading}
                        modalTitle="Quận / Huyện"
                        frequencyKey={SALES_ORDER_DISTRICT_DROPDOWN_KEY}
                        frequencyAccountKey={dropdownAccountKey}
                      />
                      {districtsError ? (
                        <Text style={styles.fieldErr}>{districtsError}</Text>
                      ) : null}
                    </View>
                    <View style={styles.colFlex}>
                      <FormSelect
                        label="Phường/Xã"
                        value={wardId}
                        options={wardOptions}
                        onChange={setWardId}
                        placeholder={
                          districtId == null
                            ? 'Chọn quận trước'
                            : wardsLoading
                            ? 'Đang tải…'
                            : 'Chọn phường/xã'
                        }
                        disabled={districtId == null || wardsLoading}
                        modalTitle="Phường / Xã"
                        frequencyKey={SALES_ORDER_WARD_DROPDOWN_KEY}
                        frequencyAccountKey={dropdownAccountKey}
                      />
                      {wardsError ? (
                        <Text style={styles.fieldErr}>{wardsError}</Text>
                      ) : null}
                    </View>
                  </View>

                  {needPartnerWarning ? (
                    <View style={styles.warnBox}>
                      <Text style={styles.warnTxt}>
                        {shippingMode === 'seller'
                          ? 'Chưa tìm thấy cấu hình Best Express cho seller. Kiểm tra API hoặc cấu hình đối tác.'
                          : 'Vui lòng chọn đối tác vận chuyển trước'}
                      </Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          </View>
        </SectionCard>

        <Pressable
          style={styles.advHead}
          onPress={() => setAdvancedOpen(o => !o)}
        >
          <View style={styles.advIconSlot}>
            <SystemIcon
              name="settings"
              size={18}
              color={colors.textSecondary}
            />
          </View>
          <Text style={styles.advTitle}>Nâng cao</Text>
          <SystemIcon
            name={advancedOpen ? 'chevronUp' : 'chevronDown'}
            size={14}
            color={colors.textMuted}
          />
        </Pressable>
        {advancedOpen ? (
          <View style={styles.advBody}>
            <FormDatePickerField
              label="Ngày đặt hàng"
              value={orderDate}
              onChange={d => {
                if (d) {
                  setOrderDate(startOfDay(d));
                }
              }}
              minimumDate={orderDateMin}
              maximumDate={orderDateMax}
              clearable={false}
            />

            <View style={styles.mtSm}>
              <FormSelect
                label="Kho xuất hàng"
                required
                value={shippingWarehouseId}
                options={warehouseOptions}
                onChange={v => {
                  shippingWarehouseTouchedRef.current = true;
                  setShippingWarehouseId(v);
                }}
                placeholder="Chọn kho"
                disabled={warehouseOptions.length === 0}
                modalTitle="Chọn kho xuất hàng"
                frequencyKey={SALES_ORDER_SHIPPING_WAREHOUSE_DROPDOWN_KEY}
                frequencyAccountKey={dropdownAccountKey}
              />
            </View>

            <View style={styles.mtSm}>
              <TextField
                variant="dark"
                size="md"
                label="Giảm giá (%)"
                value={orderDiscountPercent}
                onChangeText={setOrderDiscountPercent}
                keyboardType="decimal-pad"
                placeholder="0"
                startIcon={<Text style={styles.advGlyph}>%</Text>}
              />
              <Text style={styles.hint}>
                Theo phần trăm trên tạm tính (sau giảm và thuế từng dòng).
              </Text>
            </View>

            <View style={styles.mtSm}>
              <TextField
                variant="dark"
                size="md"
                value={orderNote}
                onChangeText={setOrderNote}
                placeholder="Ghi chú"
                multiline
                startIcon={
                  <SystemIcon
                    name="document"
                    size={18}
                    color={colors.textMuted}
                  />
                }
              />
            </View>
          </View>
        ) : null}

        <View style={styles.summary}>
          <View style={styles.sumHead}>
            <View style={styles.sumIconSlot}>
              <SystemIcon
                name="clipboard"
                size={20}
                color={colors.textSecondary}
              />
            </View>
            <Text style={styles.sumTitle}>Tổng quan đơn hàng</Text>
          </View>
          <Text
            style={[
              styles.sumWh,
              dualShippingWarehouse ? styles.sumWhTight : styles.sumWhAfter,
            ]}
          >
            Kho đóng gói: {packingLabel}
          </Text>
          {dualShippingWarehouse ? (
            <Text style={[styles.sumWh, styles.sumWhAfter]}>
              Kho xuất: {shippingExportLabel}
            </Text>
          ) : null}
          <View style={styles.sumRow}>
            <Text style={styles.sumLab}>Tạm tính</Text>
            <Text style={styles.sumVal}>
              {`${subtotal.toLocaleString('vi-VN')}\u0111`}
            </Text>
          </View>
          {orderDiscountVnd > 0 ? (
            <View style={styles.sumRow}>
              <Text style={styles.sumLab}>Giảm giá đơn</Text>
              <Text style={styles.sumVal}>
                {`\u2212${orderDiscountVnd.toLocaleString('vi-VN')}\u0111`}
              </Text>
            </View>
          ) : null}
          <View style={styles.sumRow}>
            <Text style={styles.sumLab}>Tổng cộng</Text>
            <Text style={[styles.sumVal, styles.sumTotal]}>
              {`${Math.round(total).toLocaleString('vi-VN')}\u0111`}
            </Text>
          </View>
          <Button
            title="Tạo đơn hàng"
            variant="primary"
            size="md"
            loading={createSubmitting}
            onPress={() => {
              void handleCreate();
            }}
            style={styles.createBtn}
          />
          <Button
            title="Huỷ"
            variant="outline"
            size="md"
            onPress={onBack}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
      {/* Modal toàn màn — anh em với ScrollView, không nằm trong luồng cuộn trang */}
      <AddProductModal
        visible={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        shopId={shopId}
        onSubmit={handleAddProductLine}
      />

    </View>
  );
}

function createCreateOrderFsStyles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: { marginBottom: 0, minWidth: 0 },
    wrapGrow: { flexGrow: 1, alignSelf: 'stretch' },
    lab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      marginBottom: 6,
    },
    req: { color: c.orange },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgInput,
    },
    fieldDis: { opacity: 0.5 },
    fieldTxt: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    fieldPh: { color: c.textMuted },
    chev: { fontSize: 14, color: c.textMuted },
    backdrop: {
      flex: 1,
      backgroundColor: c.bgOverlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
      maxHeight: '70%',
      borderTopWidth: 1,
      borderColor: c.border,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 12,
    },
    list: {
      maxHeight: 320,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    rowMain: { flex: 1, minWidth: 0 },
    rowTitle: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    rowSub: { fontSize: 12, color: c.textMuted, marginTop: 2 },
  });
}

function createCreateOrderSecStyles(c: AppColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      marginBottom: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 14,
    },
    num: { color: c.tealLight },
  });
}

function createCreateOrderRadStyles(c: AppColorPalette) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    dot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: c.borderLight,
      marginRight: 10,
    },
    dotOn: { borderColor: c.teal, backgroundColor: c.tealDim },
    lab: { fontSize: 14, fontWeight: '600', color: c.textSecondary, flex: 1 },
  });
}

function createCreateOrderScreenStyles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 14, paddingTop: 12 },
    row3: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    /** Hai cột cạnh nhau — không wrap để tránh chồng lên nhau trên mobile. */
    rowPair: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      width: '100%',
    },
    colFlex: { flex: 1, minWidth: 0, flexBasis: 0 },
    /** Căn ô tìm khách với `FormSelect` (nhãn nằm trong viền, không có dòng nhãn riêng). */
    colCustomerCombo: { paddingTop: 18 },
    mt: { marginTop: 12 },
    mtSm: { marginTop: 10 },
    custShipFoot: { marginTop: 10 },
    custShipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    custShipHint: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 17,
    },
    prodHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 10,
    },
    prodHeaderSpacer: { flex: 1 },
    prodCount: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
    },
    tableHead: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: 8,
      marginBottom: 0,
    },
    th: {
      fontSize: 10,
      fontWeight: '800',
      color: c.textMuted,
      letterSpacing: 0.3,
    },
    thNum: { width: 26, textAlign: 'center' },
    thName: { flex: 1, minWidth: 0, paddingRight: 6 },
    thQty: { width: 34, textAlign: 'right' },
    thPrice: { width: 72, textAlign: 'right' },
    thDisc: { width: 40, textAlign: 'right' },
    thTotal: { width: 76, textAlign: 'right' },
    tdNameCell: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    prodThumb: {
      width: 36,
      height: 36,
      borderRadius: 6,
      flexShrink: 0,
      backgroundColor: c.bgLayer3,
    },
    prodThumbPlaceholder: {
      width: 36,
      height: 36,
      borderRadius: 6,
      flexShrink: 0,
      backgroundColor: c.bgLayer3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tdNameText: {
      flex: 1,
      minWidth: 0,
    },
    tableBody: {
      marginTop: 4,
      marginBottom: 2,
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgRow,
    },
    emptyBox: {
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 12,
    },
    emptyIcoSlot: { marginBottom: 8, opacity: 0.5 },
    emptyTxt: {
      fontSize: 13,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    firstProdBtn: { alignSelf: 'flex-start', marginTop: 14 },
    btnAddProdDim: {
      borderColor: c.border,
      opacity: 0.42,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    tableRowAlt: {
      backgroundColor: c.bgRowAlt,
    },
    tableRowLast: {
      borderBottomWidth: 0,
    },
    td: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textPrimary,
    },
    shipGrid: { gap: 16 },
    shipCol: {},
    blockLab: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 10,
    },
    hint: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 6,
      lineHeight: 16,
    },
    estLoadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
    },
    estLoadingTxt: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '600',
    },
    estCard: {
      marginTop: 12,
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(45,200,200,0.07)',
      borderWidth: 1,
      borderColor: 'rgba(61,200,200,0.28)',
    },
    estCardTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: c.tealLight,
      marginBottom: 4,
    },
    estService: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textPrimary,
      marginBottom: 8,
    },
    estRowPair: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
      gap: 12,
    },
    estLab: { fontSize: 12, color: c.textSecondary, fontWeight: '600' },
    estVal: { fontSize: 13, color: c.textPrimary, fontWeight: '800' },
    estSource: {
      marginTop: 8,
      fontSize: 11,
      color: c.textMuted,
      fontWeight: '600',
    },
    sellerBeLab: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 8,
    },
    sellerBeBox: {
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.borderMid,
      backgroundColor: c.bgInput,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    sellerBeName: {
      fontSize: 16,
      fontWeight: '800',
      color: c.tealLight,
    },
    sellerBeSub: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 19,
    },
    sellerBeMuted: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 19,
    },
    sellerBeLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    sellerBeLoadingTxt: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
    },
    pickupInfoBox: {
      marginTop: 4,
      padding: 14,
      borderRadius: 12,
      backgroundColor: c.blueBg,
      borderWidth: 1,
      borderColor: 'rgba(96,165,250,0.35)',
    },
    pickupInfoHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    pickupInfoMain: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
      lineHeight: 20,
    },
    pickupPinBlock: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    pickupPinText: { flex: 1, minWidth: 0 },
    pickupLocTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: c.blue,
      lineHeight: 19,
    },
    pickupLocAddr: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 20,
    },
    pickupLocAddrMuted: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      lineHeight: 18,
    },
    codRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    codLab: { fontSize: 14, fontWeight: '700', color: c.textSecondary },
    warnBox: {
      marginTop: 12,
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(245,158,11,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(245,158,11,0.35)',
    },
    warnTxt: { fontSize: 13, fontWeight: '600', color: c.orange },
    fieldErr: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: '600',
      color: c.red,
    },
    advHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 10,
    },
    advIconSlot: { justifyContent: 'center' },
    advTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
    },
    advBody: {
      padding: 14,
      marginBottom: 14,
      backgroundColor: c.bgInput,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    advGlyph: {
      fontSize: 16,
      marginRight: 8,
      lineHeight: 22,
    },
    advGlyphSlot: { marginRight: 8, justifyContent: 'center' },
    advDateMid: { flex: 1, minWidth: 0 },
    summary: {
      backgroundColor: c.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginTop: 4,
    },
    sumHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    sumIconSlot: { justifyContent: 'center' },
    sumTitle: { fontSize: 17, fontWeight: '800', color: c.textPrimary },
    sumWh: { fontSize: 13, color: c.textSecondary },
    sumWhTight: { marginBottom: 6 },
    sumWhAfter: { marginBottom: 14 },
    sumRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    sumLab: { fontSize: 14, color: c.textSecondary },
    sumVal: { fontSize: 14, fontWeight: '700', color: c.textPrimary },
    sumTotal: { fontSize: 18, color: c.tealLight },
    createBtn: { marginTop: 16 },
    cancelBtn: { marginTop: 10 },
  });
}
