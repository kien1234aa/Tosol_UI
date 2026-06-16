import React, { useMemo } from 'react';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { StyleSheet, Text, View } from 'react-native';
import type { ComboAssemblyApi } from '@services/warehouse/comboAssemblyApiTypes';
import type { ComboAssemblyRecipeComponentApi } from '@services/warehouse/comboAssemblyApiTypes';
import { formatComboAssemblyQuantity } from '@mappers/warehouse/comboAssemblyMappers';
import {
  DetailCard,
  DetailRow,
} from '../../../sales/screens/orderDetail/OrderDetailPrimitives';
import type { ComboAssemblyDetailTabId } from './comboAssemblyDetailTypes';

export type ComboAssemblyDetailTabPanelsProps = {
  activeTab: ComboAssemblyDetailTabId;
  a: ComboAssemblyApi;
  statusLabel: string;
};

function formatIntVi(v: number | string | null | undefined): string {
  if (v == null) {
    return '—';
  }
  const n =
    typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(n)) {
    return String(v);
  }
  return Math.round(n).toLocaleString('vi-VN');
}

function warehouseLine(a: ComboAssemblyApi): string {
  const w = a.warehouse;
  const code = w?.code?.trim();
  const name = w?.name?.trim();
  if (code && name) {
    return `${code} — ${name}`;
  }
  return name || code || '—';
}

export function ComboAssemblyDetailTabPanels({
  activeTab,
  a,
  statusLabel,
}: ComboAssemblyDetailTabPanelsProps) {
  const styles = useThemeStyleSheet(create_ComboAssemblyDetailTabPanels_styles);
  const palette = useAppColors();

  const components = useMemo((): ComboAssemblyRecipeComponentApi[] => {
    const raw = a.recipe_components;
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter(Boolean);
  }, [a.recipe_components]);

  const sku = a.product?.sku?.trim() || '—';
  const pname = a.product?.name?.trim() || '—';
  const qtyFormatted = formatComboAssemblyQuantity(a.quantity);

  switch (activeTab) {
    case 'info':
      return (
        <DetailCard title="Thông tin cơ bản" icon="clipboard">
          <View style={styles.comboBlock}>
            <Text style={styles.comboLab}>Combo</Text>
            <Text style={styles.comboSku}>{sku}</Text>
            <Text style={styles.comboName}>{pname}</Text>
          </View>
          <DetailRow label="Số lượng" value={qtyFormatted} />
          <DetailRow label="Kho" value={warehouseLine(a)} />
          <DetailRow label="Trạng thái" value={statusLabel} />
        </DetailCard>
      );
    case 'materials':
      if (components.length === 0) {
        return (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTxt, { color: palette.textMuted }]}>
              Chưa có dữ liệu nguyên liệu.
            </Text>
          </View>
        );
      }
      return (
        <View style={styles.matList}>
          {components.map((row, idx) => {
            const rsku = row.sku?.trim() || '—';
            const rname = row.name?.trim() || '—';
            const per = row.quantity_per_combo ?? '—';
            return (
              <View
                key={`${row.product_id ?? idx}-${rsku}`}
                style={[
                  styles.matCard,
                  {
                    borderColor: palette.border,
                    backgroundColor: palette.bgCard,
                  },
                ]}
              >
                <Text style={styles.matSku}>{rsku}</Text>
                <Text style={styles.matName}>{rname}</Text>
                <DetailRow label="SL / combo" value={String(per)} />
                <DetailRow
                  label="Cần tổng"
                  value={formatIntVi(row.total_needed)}
                />
                <DetailRow
                  label="Tồn kho"
                  value={formatIntVi(row.available_in_warehouse)}
                />
              </View>
            );
          })}
        </View>
      );
    default:
      return null;
  }
}

function create_ComboAssemblyDetailTabPanels_styles(c: AppColorPalette) {
  return StyleSheet.create({
    comboBlock: { marginBottom: 8 },
    comboLab: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 4,
    },
    comboSku: { fontSize: 14, fontWeight: '800', color: c.textPrimary },
    comboName: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      marginTop: 2,
    },
    emptyBox: { paddingVertical: 24, alignItems: 'center' },
    emptyTxt: { fontSize: 14, fontWeight: '600' },
    matList: { gap: 12 },
    matCard: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    matSku: { fontSize: 13, fontWeight: '800', color: c.textPrimary },
    matName: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: 6,
    },
  });
}
