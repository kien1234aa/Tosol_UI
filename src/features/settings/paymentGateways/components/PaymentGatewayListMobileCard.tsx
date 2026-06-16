import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { listMobileCard } from '@shared/theme/surfaceStyles';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { SystemIcon } from '@shared/components/icons/SystemIcon';
import { StatusPill } from '@shared/components/ui/StatusPill';
import { createListCardLayoutStyles } from '@shared/components/ui/listMobileCard/listCardLayout';
import type { SellerPaymentGatewayApi } from '@services/settings/paymentGatewayApiTypes';

export type PaymentGatewayListMobileCardProps = {
  row: SellerPaymentGatewayApi;
  /** Kết nối được chọn làm cổng thanh toán của shop hiện tại. */
  isShopDefault?: boolean;
};

export function PaymentGatewayListMobileCard({
  row,
  isShopDefault = false,
}: PaymentGatewayListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const layout = useThemeStyleSheet(createListCardLayoutStyles);
  const styles = useThemeStyleSheet(createStyles);
  const cardSurface = listMobileCard(c, mode);

  const gatewayName = row.payment_gateway?.name?.trim() || 'Cổng thanh toán';
  const gatewayCode = row.payment_gateway?.code?.trim() || null;
  const logoUri = useMemo(
    () => (row.payment_gateway?.logo_url ?? '').trim(),
    [row.payment_gateway?.logo_url],
  );
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUri, row.id]);

  return (
    <Pressable
      style={({ pressed }) => [
        layout.card,
        cardSurface,
        layout.bodyTight,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={layout.row}>
        <View style={layout.thumb}>
          {logoUri.length > 0 && !logoFailed ? (
            <Image
              source={{ uri: logoUri }}
              style={layout.thumbImg}
              resizeMode="cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <SystemIcon name="wallet" size={18} color={c.textMuted} />
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <View style={layout.row}>
            <Text
              style={[layout.headerTitle, { color: c.textPrimary, flex: 1 }]}
              numberOfLines={1}
            >
              {gatewayName}
            </Text>
            {isShopDefault ? (
              <StatusPill tone="info" emphasized={false} compact>
                Shop
              </StatusPill>
            ) : null}
            {row.is_ready ? (
              <StatusPill tone="success" emphasized={false} compact>
                Sẵn sàng
              </StatusPill>
            ) : null}
            <StatusPill
              tone={row.is_active ? 'success' : 'neutral'}
              emphasized={false}
              compact
            >
              {row.is_active ? 'Bật' : 'Tắt'}
            </StatusPill>
          </View>
          {gatewayCode ? (
            <Text style={layout.metaSecondary} numberOfLines={1}>
              Mã: {gatewayCode}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(c: AppColorPalette) {
  return StyleSheet.create({
    cardPressed: { opacity: 0.92 },
  });
}
