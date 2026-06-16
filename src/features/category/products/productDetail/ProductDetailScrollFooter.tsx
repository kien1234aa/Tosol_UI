import React from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { createDetailQuickDockThemeStyles } from '@shared/components/ui/detailQuickDockSharedStyles';
import { CanvasDetailOverviewPanel } from '@shared/components/ui/canvasDetail/CanvasDetailOverviewPanel';
import { quickActionPaint } from '@shared/theme/quickActionPaint';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { DetailRow } from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import { PRODUCT_UNIT_OPTIONS } from '../constants/productUnits';
import type { ProductApi } from '@services/category/productApiTypes';

export type ProductDetailOverviewSectionProps = {
  product: ProductApi;
  storeLabel: string;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('vi-VN');
}

function fmtPriceVnd(priceStr: string): string {
  const n = Number.parseFloat(priceStr) || 0;
  if (n <= 0) {
    return '0₫';
  }
  return `${Math.round(n).toLocaleString('vi-VN')}\u20AB`;
}

export function ProductDetailOverviewSection({
  product,
  storeLabel,
}: ProductDetailOverviewSectionProps) {
  const unitLabel =
    PRODUCT_UNIT_OPTIONS.find(o => o.value === product.unit)?.label ??
    product.unit;
  const total = product.total_stock != null ? String(product.total_stock) : '—';
  const avail =
    product.available_stock != null ? String(product.available_stock) : '—';

  return (
    <CanvasDetailOverviewPanel
      metrics={[
        { label: 'Giá bán', value: fmtPriceVnd(product.price), icon: 'cash' },
        { label: 'Tồn kho', value: total, icon: 'cube' },
      ]}
      timeline={{
        label: 'Cửa hàng',
        value: storeLabel,
        hint: product.is_active ? 'Đang bán' : 'Ngưng',
      }}
      title="Thông tin chi tiết"
      icon="document"
    >
      <DetailRow label="Mã SKU" value={product.sku} />
      <DetailRow label="Đơn vị" value={unitLabel} />
      <DetailRow label="Tồn khả dụng" value={avail} />
      <DetailRow label="Ngày tạo" value={fmtDate(product.created_at)} />
      <DetailRow label="Cập nhật" value={fmtDate(product.updated_at)} last />
    </CanvasDetailOverviewPanel>
  );
}

export type ProductDetailQuickDockProps = {
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ProductDetailQuickDock({
  onEdit,
  onDelete,
}: ProductDetailQuickDockProps) {
  const c = useAppColors();
  const qd = useThemeStyleSheet(createDetailQuickDockThemeStyles);
  const paintNeutral = quickActionPaint(c, 'neutral');
  const paintDanger = quickActionPaint(c, 'danger');

  return (
    <View style={qd.dockCard}>
      <Text style={qd.dockTitle}>Thao tác nhanh</Text>
      <View style={qd.dockCol}>
        <Pressable
          onPress={() => onEdit?.()}
          disabled={!onEdit}
          style={({ pressed }) => [
            qd.dockBtnPrimary,
            pressed && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon name="pencil" size={18} color="#fff" />
          <Text style={qd.dockBtnPrimaryLabel}>Sửa sản phẩm</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete?.()}
          disabled={!onDelete}
          style={({ pressed }) => [
            qd.dockBtn,
            {
              backgroundColor: paintDanger.bg,
              borderColor: paintDanger.border,
            },
            pressed && qd.dockBtnPressed,
          ]}
        >
          <SystemIcon name="trash" size={16} color={paintDanger.fg} />
          <Text style={[qd.dockBtnLabel, { color: paintDanger.fg }]}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}

function create_ProductDetailScrollFooter_styles(_c: AppColorPalette) {
  return StyleSheet.create({});
}
