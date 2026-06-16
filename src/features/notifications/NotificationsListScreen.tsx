import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListLoadingGate } from '@shared/components/ui/ListLoadingGate';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppColorPalette } from '@shared/theme/colorPalettes';
import { useAppColors } from '@shared/theme/ThemeContext';
import { useThemeStyleSheet } from '@shared/theme/useThemeStyleSheet';
import { RADIUS } from '@shared/theme/designTokens';
import { listMobileCard } from '@shared/theme/surfaceStyles';
import { useThemeMode } from '@shared/theme/ThemeContext';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleAfterUIReady } from '@shared/utils/scheduleAfterUIReady';
import type { SalesMainStackParamList } from '../sales/navigation/salesNavigationRef';
import { syncUnreadNotificationBadgeFromCounters } from '@services/system/countersApi';
import {
  NOTIF_BADGE_STORAGE_KEY,
  PUSH_NOTIF_STORAGE_KEY,
} from './notificationPrefsKeys';
import { readInboundOrderNumberFromNotificationData } from './inboundOrderFromNotificationData';
import { parseNotificationTarget } from './notificationActionUrl';
import { resolveNotificationActionUrl } from './notificationResolveActionUrl';
import { apiNotificationToDetailParams } from './notificationDetailParams';
import { devFcmTemplatesAsNotifications } from '@features/push/fcmNotificationTemplates';
import {
  fetchNotificationsList,
  type ApiNotification,
} from '@services/system/notificationsApi';

const NOTIF_ICON_TO_ION: Record<string, string> = {
  'file-invoice': 'document-text-outline',
  'alert-circle': 'alert-circle-outline',
  receipt: 'receipt-outline',
  'truck-delivery': 'car-outline',
  'package-check': 'cube-outline',
  send: 'send-outline',
};

function previewMessage(raw: string, maxLen = 140): string {
  const oneLine = raw.replace(/\r\n/g, '\n').split('\n')[0]?.trim() ?? '';
  const stripped = oneLine.replace(/^#+\s*/g, '').trim();
  if (stripped.length <= maxLen) {
    return stripped;
  }
  return `${stripped.slice(0, maxLen - 1)}…`;
}

function formatNotifTime(
  iso: string,
  t: (k: string, o?: Record<string, number | string>) => string,
  locale: string,
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const now = Date.now();
  const diffMs = Math.max(0, now - d.getTime());
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) {
    return t('notifications.time.justNow');
  }
  if (diffMins < 60) {
    return t('notifications.time.minutesAgo', { count: diffMins });
  }
  if (diffHours < 24) {
    return t('notifications.time.hoursAgo', { count: diffHours });
  }
  if (diffDays < 7) {
    return t('notifications.time.daysAgo', { count: diffDays });
  }
  const loc = locale === 'vi' ? 'vi-VN' : locale === 'ja' ? 'ja-JP' : 'en-GB';
  return d.toLocaleDateString(loc, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function popStackThenOpen(navigation: Nav, open: () => void) {
  navigation.goBack();
  scheduleAfterUIReady(() => {
    open();
  });
}

export type NotificationsListScreenProps = {
  onOpenDrawer: () => void;
  onOpenOrder: (orderNumber: string) => void;
  onOpenInvoice?: (invoiceId: string) => void;
  onOpenSettlement?: (ref: string) => void;
  onOpenPayment?: (paymentRef: string) => void;
  onOpenPurchaseOrder?: (orderRef: string) => void;
  onOpenInboundOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenPackingOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenOutboundOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenTransferOrder?: (ref: {
    uuid: string | null;
    orderNumber: string;
    id: number;
  }) => void;
  onOpenComboAssembly?: (ref: {
    uuid: string | null;
    assemblyNumber: string;
    id: number;
  }) => void;
};

type Nav = NativeStackNavigationProp<SalesMainStackParamList>;

export function NotificationsListScreen({
  onOpenDrawer: _onOpenDrawer,
  onOpenOrder,
  onOpenInvoice,
  onOpenSettlement,
  onOpenPayment,
  onOpenPurchaseOrder,
  onOpenInboundOrder,
  onOpenPackingOrder,
  onOpenOutboundOrder,
  onOpenTransferOrder,
  onOpenComboAssembly,
}: NotificationsListScreenProps) {
  const { t, i18n } = useTranslation();
  const palette = useAppColors();
  const styles = useThemeStyleSheet(createStyles);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { navigate } = navigation;

  const [pushEnabled, setPushEnabled] = useState(true);
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistPush = useCallback((v: boolean) => {
    setPushEnabled(v);
    void AsyncStorage.setItem(PUSH_NOTIF_STORAGE_KEY, v ? '1' : '0');
  }, []);

  const load = useCallback(async (background = false) => {
    setError(null);
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetchNotificationsList({ per_page: 20 });
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      const fromCounters = await syncUnreadNotificationBadgeFromCounters();
      if (fromCounters == null) {
        const unread = list.filter(n => !n.is_read).length;
        void AsyncStorage.setItem(NOTIF_BADGE_STORAGE_KEY, String(unread));
      }
    } catch (e: unknown) {
      setItems([]);
      setError(e instanceof Error ? e.message : t('notifications.errorLoad'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const pushRaw = await AsyncStorage.getItem(PUSH_NOTIF_STORAGE_KEY);
        if (!cancelled) {
          if (pushRaw === '0') {
            setPushEnabled(false);
          } else {
            setPushEnabled(true);
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const onRefresh = useCallback(() => {
    void load(true);
  }, [load]);

  const handleOpenItem = useCallback(
    (n: ApiNotification) => {
      const openTextDetail = (): void => {
        navigate(
          'NotificationDetail',
          apiNotificationToDetailParams(n),
        );
      };

      const effectiveUrl = resolveNotificationActionUrl(n);
      if (effectiveUrl == null) {
        openTextDetail();
        return;
      }
      const parsed = parseNotificationTarget(effectiveUrl);
      if (parsed == null) {
        openTextDetail();
        return;
      }
      const { kind, slug } = parsed;
      const orderRef = {
        uuid: null as string | null,
        orderNumber: slug,
        id: 0,
      };
      const assemblyRef = {
        uuid: null as string | null,
        assemblyNumber: slug,
        id: 0,
      };

      if (kind === 'invoices' && onOpenInvoice) {
        popStackThenOpen(navigation, () => onOpenInvoice(slug));
        return;
      }
      if (kind === 'settlements' && onOpenSettlement) {
        popStackThenOpen(navigation, () => onOpenSettlement(slug));
        return;
      }
      if (kind === 'sale-orders') {
        popStackThenOpen(navigation, () => onOpenOrder(slug));
        return;
      }
      if (kind === 'inbound-orders' && onOpenInboundOrder) {
        popStackThenOpen(navigation, () => onOpenInboundOrder(orderRef));
        return;
      }
      if (kind === 'packing-orders' && onOpenPackingOrder) {
        popStackThenOpen(navigation, () => onOpenPackingOrder(orderRef));
        return;
      }
      if (kind === 'outbound-orders' && onOpenOutboundOrder) {
        popStackThenOpen(navigation, () => onOpenOutboundOrder(orderRef));
        return;
      }
      if (kind === 'transfer-orders' && onOpenTransferOrder) {
        popStackThenOpen(navigation, () => onOpenTransferOrder(orderRef));
        return;
      }
      if (kind === 'payments' && onOpenPayment) {
        popStackThenOpen(navigation, () => onOpenPayment(slug));
        return;
      }
      if (kind === 'purchase-orders' && onOpenInboundOrder) {
        const inboundNo = readInboundOrderNumberFromNotificationData(n.data);
        if (inboundNo) {
          popStackThenOpen(navigation, () =>
            onOpenInboundOrder({ uuid: null, orderNumber: inboundNo, id: 0 }),
          );
          return;
        }
      }
      if (kind === 'purchase-orders' && onOpenPurchaseOrder) {
        popStackThenOpen(navigation, () => onOpenPurchaseOrder(slug));
        return;
      }
      if (kind === 'combo-assemblies' && onOpenComboAssembly) {
        popStackThenOpen(navigation, () => onOpenComboAssembly(assemblyRef));
        return;
      }

      openTextDetail();
    },
    [
      navigation,
      onOpenComboAssembly,
      onOpenInboundOrder,
      onOpenInvoice,
      onOpenOrder,
      onOpenOutboundOrder,
      onOpenPackingOrder,
      onOpenPayment,
      onOpenPurchaseOrder,
      onOpenSettlement,
      onOpenTransferOrder,
    ],
  );

  const { mode } = useThemeMode();

  const listData = useMemo(() => {
    const devSamples = devFcmTemplatesAsNotifications();
    if (devSamples.length === 0) {
      return items;
    }
    const apiIds = new Set(items.map(n => n.id));
    const devOnly = devSamples.filter(d => !apiIds.has(d.id));
    return [...devOnly, ...items];
  }, [items]);

  const renderItem = useCallback(
    ({ item }: { item: ApiNotification }) => {
      const ionName = NOTIF_ICON_TO_ION[item.icon] ?? 'notifications-outline';
      const timeLabel = formatNotifTime(item.created_at, t, i18n.language);
      const msg = previewMessage(item.message);
      const cardSurface = listMobileCard(palette, mode);
      return (
        <Pressable
          onPress={() => handleOpenItem(item)}
          style={({ pressed }) => [
            styles.row,
            cardSurface,
            !item.is_read && { backgroundColor: palette.bgCard },
            { opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: palette.tealLight + '33' },
            ]}
          >
            <Ionicons
              name={ionName as 'notifications-outline'}
              size={22}
              color={palette.teal}
            />
          </View>
          <View style={styles.rowMid}>
            <Text
              style={[styles.rowTitle, { color: palette.textPrimary }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.rowMsg, { color: palette.textMuted }]}
              numberOfLines={2}
            >
              {msg}
            </Text>
          </View>
          <Text style={[styles.rowTime, { color: palette.textMuted }]}>
            {timeLabel}
          </Text>
        </Pressable>
      );
    },
    [handleOpenItem, i18n.language, mode, palette, styles, t],
  );

  const listHeader = useMemo(
    () => (
      <>
        <View style={[styles.switchRow, { borderColor: palette.border }]}>
          <Text style={[styles.switchLabel, { color: palette.textSecondary }]}>
            {t('header.notifToastLabel')}
          </Text>
          <Switch
            value={pushEnabled}
            onValueChange={persistPush}
            trackColor={{ false: palette.borderMid, true: palette.tealLight }}
            thumbColor={pushEnabled ? palette.surfaceWhite : palette.bgLayer2}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: palette.border }]} />
      </>
    ),
    [palette, persistPush, pushEnabled, styles, t],
  );

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={palette.teal}
      />
    ),
    [onRefresh, refreshing, palette.teal],
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top, borderBottomColor: palette.border },
        ]}
      >
        <View style={styles.backBtn} />
        <Text style={[styles.screenTitle, { color: palette.textPrimary }]}>
          {t('header.notificationsTitle')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {error != null && items.length === 0 && !loading ? (
        <View style={styles.centerBox}>
          <Text style={[styles.errorText, { color: palette.textMuted }]}>
            {error}
          </Text>
          <Pressable
            onPress={() => void load()}
            style={[styles.retryBtn, { backgroundColor: palette.bgRow }]}
          >
            <Text style={[styles.retryTxt, { color: palette.textLink }]}>
              {t('drawer.retry')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <ListLoadingGate
          loading={loading}
          refreshing={refreshing}
          itemCount={listData.length}
          options={{ canShowSkeleton: error == null }}
        >
        <FlatList
          style={styles.listFlex}
          data={listData}
          keyExtractor={it => it.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
          refreshControl={memoizedRefreshControl}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: palette.textMuted }]}>
              {t('notifications.empty')}
            </Text>
          }
          ItemSeparatorComponent={() => (
            <View style={[styles.sep, { backgroundColor: palette.border }]} />
          )}
          showsVerticalScrollIndicator
        />
        </ListLoadingGate>
      )}
    </View>
  );
}

function createStyles(_c: AppColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    listFlex: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    screenTitle: {
      fontSize: 18,
      fontWeight: '800',
      flex: 1,
      textAlign: 'center',
    },
    centerBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      gap: 12,
    },
    errorText: {
      fontSize: 15,
      textAlign: 'center',
    },
    retryBtn: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: RADIUS.control,
    },
    retryTxt: {
      fontSize: 15,
      fontWeight: '700',
    },
    listContent: {
      paddingHorizontal: 12,
      paddingTop: 12,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 4,
      marginBottom: 4,
    },
    switchLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      marginRight: 12,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 10,
      gap: 10,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowMid: {
      flex: 1,
      minWidth: 0,
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 4,
    },
    rowMsg: {
      fontSize: 13,
      lineHeight: 18,
    },
    rowTime: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
      maxWidth: 96,
      textAlign: 'right',
    },
    sep: {
      height: 8,
    },
    empty: {
      textAlign: 'center',
      marginTop: 32,
      fontSize: 15,
    },
  });
}
