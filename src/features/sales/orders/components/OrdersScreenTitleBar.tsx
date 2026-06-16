import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { Button } from '@shared/components/ui/Button';
export type OrdersScreenTitleBarProps = {
  title: string;
  subtitle: string;
  onCreateOrder?: () => void;
  /** Nhãn nút chính (mặc định tạo đơn hàng). */
  primaryButtonTitle?: string;
  /** Nút nhập dữ liệu (vd. màn sản phẩm). */
  showImportButton?: boolean;
  onImport?: () => void;
  /** Ẩn nút tạo đơn (vd. màn vận đơn không có tạo vận đơn trên app). Mặc định true. */
  showCreateOrderButton?: boolean;
  onRefresh?: () => void;
  /**
   * `below` — đặt khối nút (Tạo / …) xuống **dòng riêng** dưới title,
   * tránh chồng chữ trên màn hẹp (vd. Đơn mua hàng).
   */
  actionsPlacement?: 'beside' | 'below';
};

export function OrdersScreenTitleBar({
  title,
  subtitle,
  onCreateOrder,
  primaryButtonTitle,
  showImportButton = false,
  onImport,
  showCreateOrderButton = true,
  onRefresh,
  actionsPlacement = 'beside',
}: OrdersScreenTitleBarProps) {
  const { t } = useTranslation();
  const styles = useThemeStyleSheet(create_OrdersScreenTitleBar_styles);
  const palette = useAppColors();
  const createOrderLabel =
    primaryButtonTitle ?? t('orders.actions.createOrderPlus');

  const stackActions = actionsPlacement === 'below';
  return (
    <View style={[styles.wrap, stackActions && styles.wrapStacked]}>
      <View style={[styles.textCol, stackActions && styles.textColStacked]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.actions, stackActions && styles.actionsStacked]}>
        {showImportButton ? (
          <Button
            title={t('common.import')}
            variant="outline"
            size="sm"
            onPress={onImport ?? (() => {})}
            style={styles.importBtn}
            textStyle={styles.importBtnText}
          />
        ) : null}
        {showCreateOrderButton ? (
          <Button
            title={createOrderLabel}
            variant="primary"
            size="sm"
            onPress={onCreateOrder ?? (() => {})}
          />
        ) : null}
        <Pressable
          onPress={onRefresh ?? (() => {})}
          style={styles.refreshBtn}
          hitSlop={8}
          accessibilityLabel={t('common.refreshA11y')}
        >
          <SystemIcon name="refresh" size={22} color={palette.cyan} />
        </Pressable>
      </View>
    </View>
  );
}

function create_OrdersScreenTitleBar_styles(c: AppColorPalette) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    wrapStacked: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    textCol: {
      flex: 1,
      minWidth: 0,
    },
    textColStacked: {
      flexGrow: 0,
      flexShrink: 0,
      width: '100%',
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: c.textPrimary,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: c.textMuted,
      lineHeight: 18,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    actionsStacked: {
      flexWrap: 'wrap',
      width: '100%',
      justifyContent: 'flex-start',
      marginTop: 2,
    },
    importBtn: {
      paddingHorizontal: 10,
      borderColor: c.blue,
      backgroundColor: 'transparent',
    },
    importBtnText: {
      color: c.blue,
    },
    refreshBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
