import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { canvasListScrollContent } from '@shared/components/ui/canvasScreen/canvasScreenTheme';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/hooks';
import { Button } from '@shared/components/ui/Button';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import { SalesScreenHeader } from '../../sales/components/SalesScreenHeader';
import { getWarehouseRackView } from '@services/warehouse/warehouseLayoutAPI';
import type {
  WarehouseRackViewData,
  WarehouseRackViewRack} from '@services/warehouse/warehouseLayoutApiTypes';

export type WarehouseLayoutMapScreenProps = {
  onOpenDrawer: () => void;
};

type SearchTab = 'sku' | 'product' | 'seller';

function formatRelativeVi(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 45) {
    return 'Vừa xong';
  }
  if (s < 3600) {
    return `${Math.floor(s / 60)} phút trước`;
  }
  if (s < 86400) {
    return `${Math.floor(s / 3600)} giờ trước`;
  }
  return d.toLocaleString('vi-VN');
}

function occupancyLabel(rate: number): string {
  if (!Number.isFinite(rate)) {
    return '—';
  }
  return `${rate}%`;
}

const LEGEND: { label: string; color: string; border?: string }[] = [
  { label: 'Không hoạt động', color: '#9ca3af' },
  { label: 'Vị trí trống', color: '#e5e7eb', border: '#d1d5db' },
  { label: 'Rất thấp', color: '#d4e8dc' },
  { label: 'Thấp', color: '#7ab896' },
  { label: 'Trung bình', color: '#e8c99a' },
  { label: 'Cao', color: '#e8912a' },
  { label: 'Đầy', color: '#c45c4a' },
  { label: 'Kết quả tìm kiếm', color: '#dce8f4', border: '#5a7fa8' },
];

function rackTitle(r: WarehouseRackViewRack, index: number): string {
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  const code = typeof r.code === 'string' ? r.code.trim() : '';
  if (name) {
    return name;
  }
  if (code) {
    return code;
  }
  return `Rack ${index + 1}`;
}

export function WarehouseLayoutMapScreen({
  onOpenDrawer}: WarehouseLayoutMapScreenProps) {
  const palette = useAppColors();
  const styles = useThemeStyleSheet(create_styles);
  const insets = useSafeAreaInsets();
  const { user, selectedWarehouseId } = useAppSelector(s => s.auth);

  const selectedWarehouse = useMemo(() => {
    const warehouses = user?.warehouses ?? [];
    return (
      warehouses.find(w => Number(w.id) === Number(selectedWarehouseId)) ?? null
    );
  }, [user, selectedWarehouseId]);

  const [payload, setPayload] = useState<WarehouseRackViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [searchTab, setSearchTab] = useState<SearchTab>('sku');
  const [searchQuery, setSearchQuery] = useState('');

  const needWarehousePick = selectedWarehouseId == null;
  const warehouseCode = selectedWarehouse?.code?.trim() ?? '';

  const fetchLayout = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (needWarehousePick || !warehouseCode) {
        setPayload(null);
        setError(null);
        setLoading(false);
        return;
      }
      if (mode === 'initial') {
        setLoading(true);
      }
      setError(null);
      try {
        const d = await getWarehouseRackView(warehouseCode);
        setPayload(d);
        setLastUpdated(new Date());
      } catch (e: unknown) {
        setPayload(null);
        setError(e instanceof Error ? e.message : 'Không tải được sơ đồ kho');
      } finally {
        setLoading(false);
      }
    },
    [needWarehousePick, warehouseCode],
  );

  useEffect(() => {
    void fetchLayout('initial');
  }, [fetchLayout]);

  const onRefresh = useCallback(async () => {
    if (needWarehousePick || !warehouseCode) {
      return;
    }
    setRefreshing(true);
    try {
      await fetchLayout('refresh');
    } finally {
      setRefreshing(false);
    }
  }, [needWarehousePick, warehouseCode, fetchLayout]);

  const onSearchPress = useCallback(() => {
    toast.info('Lọc theo SKU / sản phẩm / seller trên sơ đồ sẽ được bổ sung khi API tìm kiếm trên app sẵn sàng.');
  }, []);

  const summary = payload?.summary;
  const racks = payload?.racks ?? [];
  const showEmptyLocations =
    !loading &&
    payload != null &&
    racks.length === 0 &&
    (summary?.total_locations ?? 0) === 0;

  const searchPlaceholder =
    searchTab === 'sku'
      ? 'Nhập SKU, barcode hoặc mã vị trí…'
      : searchTab === 'product'
      ? 'Nhập tên hoặc mã sản phẩm…'
      : 'Nhập tên hoặc mã seller…';

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={palette.textSecondary}
        enabled={!needWarehousePick && warehouseCode.length > 0}
      />
    ),
    [refreshing, onRefresh, palette.textSecondary, needWarehousePick, warehouseCode],
  );

  return (
    <View style={styles.root}>
      <SalesScreenHeader onOpenDrawer={onOpenDrawer} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[ canvasListScrollContent(),
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={memoizedRefreshControl}
      >
        <View style={styles.titleBlock}>
          <Text style={[styles.screenTitle, { color: palette.textPrimary }]}>
            Sơ đồ kho
          </Text>
          {needWarehousePick ? (
            <Text style={[styles.screenSubtitle, { color: palette.textMuted }]}>
              Chọn kho trên header để tải sơ đồ rack
            </Text>
          ) : selectedWarehouse ? (
            <Text style={[styles.screenSubtitle, { color: palette.textMuted }]}>
              {selectedWarehouse.name} ({selectedWarehouse.code})
            </Text>
          ) : (
            <Text style={[styles.screenSubtitle, { color: palette.textMuted }]}>
              Kho đã chọn không còn trong danh sách
            </Text>
          )}
        </View>

        {needWarehousePick ? (
          <View style={styles.pickWarehouseBox}>
            <View
              style={[
                styles.pickIconWrap,
                {
                  backgroundColor: palette.bgCard,
                  borderColor: palette.border},
              ]}
            >
              <SystemIcon name="map" size={44} color={palette.textMuted} />
            </View>
            <Text style={[styles.pickTitle, { color: palette.textPrimary }]}>
              Vui lòng chọn kho
            </Text>
            <Text style={[styles.pickBody, { color: palette.textSecondary }]}>
              Bạn đang xem Tất cả kho. Mở menu kho trên thanh header và chọn
              một kho cụ thể để hiển thị sơ đồ rack và thống kê vị trí.
            </Text>
          </View>
        ) : !selectedWarehouse ? (
          <View style={styles.pickWarehouseBox}>
            <SystemIcon name="warning" size={40} color={palette.orange} />
            <Text style={[styles.pickTitle, { color: palette.textPrimary }]}>
              Không có kho hợp lệ
            </Text>
            <Text style={[styles.pickBody, { color: palette.textSecondary }]}>
              Hãy chọn lại kho trong menu header.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.metaRow}>
              <Text
                style={[styles.lastUp, { color: palette.textMuted }]}
                numberOfLines={1}
              >
                Cập nhật lần cuối:{' '}
                {lastUpdated != null
                  ? formatRelativeVi(lastUpdated)
                  : loading
                  ? '…'
                  : '—'}
              </Text>
              <Pressable
                onPress={() => void fetchLayout('refresh')}
                style={({ pressed }) => [
                  styles.refreshBtn,
                  pressed && { opacity: 0.85 },
                ]}
                hitSlop={8}
              >
                <SystemIcon name="refresh" size={18} color={palette.textLink} />
                <Text
                  style={[styles.refreshBtnTxt, { color: palette.textLink }]}
                >
                  Làm mới
                </Text>
              </Pressable>
            </View>

            {error ? (
              <Text style={styles.errorText} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <ListLoadingGate
              loading={loading}
              refreshing={refreshing}
              itemCount={payload != null ? 1 : 0}
              options={{ canShowSkeleton: !error }}
            >
            {summary != null ? (
              <>
                <View
                  style={[
                    styles.searchCard,
                    {
                      backgroundColor: palette.bgCard,
                      borderColor: palette.border},
                  ]}
                >
                  <View style={styles.searchTabs}>
                    {(
                      [
                        { key: 'sku' as const, label: 'SKU / Mã vị trí' },
                        { key: 'product' as const, label: 'Sản phẩm' },
                        { key: 'seller' as const, label: 'Seller' },
                      ] as const
                    ).map(t => {
                      const active = searchTab === t.key;
                      return (
                        <Pressable
                          key={t.key}
                          onPress={() => setSearchTab(t.key)}
                          style={[
                            styles.searchTab,
                            active && {
                              backgroundColor: palette.teal,
                              borderColor: palette.teal},
                            !active && {
                              borderColor: palette.border,
                              backgroundColor: palette.bgInput},
                          ]}
                        >
                          <Text
                            style={[
                              styles.searchTabTxt,
                              {
                                color: active
                                  ? '#ffffff'
                                  : palette.textSecondary},
                            ]}
                            numberOfLines={1}
                          >
                            {t.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.searchInputRow}>
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder={searchPlaceholder}
                      placeholderTextColor={palette.textMuted}
                      style={[
                        styles.searchInput,
                        {
                          color: palette.textPrimary,
                          borderColor: palette.border},
                      ]}
                    />
                    <Button
                      title="Tìm kiếm"
                      variant="primary"
                      size="sm"
                      onPress={onSearchPress}
                    />
                  </View>
                </View>

                <View style={styles.legendBlock}>
                  <Text
                    style={[
                      styles.legendTitle,
                      { color: palette.textSecondary },
                    ]}
                  >
                    Chú thích
                  </Text>
                  <View style={styles.legendGrid}>
                    {[0, 4].map(offset => (
                      <View key={offset} style={styles.legendGridRow}>
                        {LEGEND.slice(offset, offset + 4).map(item => (
                          <View key={item.label} style={styles.legendCell}>
                            <View
                              style={[
                                styles.legendSwatch,
                                {
                                  backgroundColor: item.color,
                                  borderWidth: item.border ? 2 : 0,
                                  borderColor: item.border ?? 'transparent'},
                              ]}
                            />
                            <Text
                              style={[
                                styles.legendLabel,
                                { color: palette.textMuted },
                              ]}
                              numberOfLines={2}
                            >
                              {item.label}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>

                {showEmptyLocations ? (
                  <View style={styles.mapEmpty}>
                    <SystemIcon
                      name="map"
                      size={56}
                      color={palette.textMuted}
                    />
                    <Text
                      style={[
                        styles.mapEmptyTitle,
                        { color: palette.textPrimary },
                      ]}
                    >
                      Chưa có vị trí
                    </Text>
                    <Text
                      style={[
                        styles.mapEmptySub,
                        { color: palette.textSecondary },
                      ]}
                    >
                      Kho này chưa có vị trí nào được cấu hình
                    </Text>
                  </View>
                ) : racks.length > 0 ? (
                  <View style={styles.rackList}>
                    <Text
                      style={[
                        styles.rackListTitle,
                        { color: palette.textSecondary },
                      ]}
                    >
                      Rack ({racks.length})
                    </Text>
                    {racks.map((r, idx) => (
                      <View
                        key={String(r.code ?? `rack-${idx}`)}
                        style={[
                          styles.rackCard,
                          {
                            backgroundColor: palette.bgCard,
                            borderColor: palette.border},
                        ]}
                      >
                        <Text
                          style={[
                            styles.rackCardTitle,
                            { color: palette.textPrimary },
                          ]}
                        >
                          {rackTitle(r, idx)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.mapPlaceholder,
                      { borderColor: palette.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.mapPlaceholderTxt,
                        { color: palette.textMuted },
                      ]}
                    >
                      Sơ đồ rack (đang có dữ liệu nhưng chưa hiển thị lưới trên
                      app).
                    </Text>
                  </View>
                )}
              </>
            ) : null}
            </ListLoadingGate>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function create_styles(c: AppColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 14, paddingTop: 12 },
    titleBlock: { marginBottom: 14, gap: 4 },
    screenTitle: { fontSize: 20, fontWeight: '800' },
    screenSubtitle: { fontSize: 13, fontWeight: '600' },
    pickWarehouseBox: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 12,
      gap: 12},
    pickIconWrap: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center'},
    pickTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
    pickBody: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 21,
      maxWidth: 340},
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 12},
    lastUp: { flex: 1, fontSize: 12, fontWeight: '600' },
    refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    refreshBtnTxt: { fontSize: 13, fontWeight: '700' },
    errorText: {
      marginBottom: 10,
      fontSize: 13,
      color: c.red,
      fontWeight: '600'},
    searchCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      marginBottom: 14,
      gap: 10},
    searchTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    searchTab: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1},
    searchTabTxt: { fontSize: 11, fontWeight: '700' },
    searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchInput: {
      flex: 1,
      minWidth: 0,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      fontWeight: '600'},
    legendBlock: { marginBottom: 14, gap: 8 },
    legendTitle: { fontSize: 12, fontWeight: '800' },
    /** Lưới 2 hàng × 4 cột — không cuộn ngang. */
    legendGrid: { gap: 8 },
    legendGridRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 6},
    legendCell: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5},
    legendSwatch: { width: 12, height: 12, borderRadius: 3, flexShrink: 0 },
    legendLabel: { fontSize: 10, fontWeight: '600', flex: 1, minWidth: 0 },
    mapEmpty: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 16,
      gap: 10},
    mapEmptyTitle: { fontSize: 17, fontWeight: '800' },
    mapEmptySub: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
    mapPlaceholder: {
      borderWidth: 1,
      borderRadius: 12,
      borderStyle: 'dashed',
      padding: 20,
      alignItems: 'center'},
    mapPlaceholderTxt: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
    rackList: { gap: 10, marginTop: 4 },
    rackListTitle: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
    rackCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14},
    rackCardTitle: { fontSize: 15, fontWeight: '700' }});
}
