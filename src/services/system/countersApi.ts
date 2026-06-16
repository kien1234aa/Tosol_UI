import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@shared/services/api';
import { NOTIF_BADGE_STORAGE_KEY } from '@features/notifications/notificationPrefsKeys';

/** Pháº£n há»“i GET /counters â€” chá»‰ khai bĂ¡o cĂ¡c trÆ°á»ng app \u0111ang dĂ¹ng; backend cĂ³ thá»ƒ bá»• sung. */
export type CountersWarehouse = {
  inbound_pending?: number;
  packing_pending?: number;
  outbound_pending?: number;
  staging_ready?: number;
  transfer_pending?: number;
  shipments_failed?: number;
  shipments_in_transit?: number;
  disposal_pending?: number;
  outbound_awaiting_transfer?: number;
  transfer_awaiting_handover?: number;
  returns_pending?: number;
  combo_assemblies_pending?: number;
};

export type CountersSeller = {
  orders_pending?: number;
  orders_confirmed?: number;
  orders_processing?: number;
  orders_ready_to_ship?: number;
  orders_issue?: number;
  returns_pending?: number;
  purchase_awaiting?: number;
  invoices_unpaid?: number;
  shipments_failed?: number;
  shipments_in_transit?: number;
  settlements_pending?: number;
};

export type CountersUser = {
  unread_notifications?: number;
};

export type CountersData = {
  warehouse?: CountersWarehouse;
  seller?: CountersSeller;
  user?: CountersUser;
};

type CountersApiEnvelope = {
  success: boolean;
  message?: string;
  data?: CountersData;
};

/**
 * GET /counters â€” tá»•ng há»£p sá»‘ \u0111áº¿m theo kho / seller / user (badge, dashboard).
 */
export async function fetchCounters(
  signal?: AbortSignal,
): Promise<CountersData | null> {
  try {
    const { data } = await api.get<CountersApiEnvelope>('/counters', {
      signal,
    });
    if (!data.success || data.data == null) {
      return null;
    }
    return data.data;
  } catch {
    return null;
  }
}

/**
 * Ghi badge chuĂ´ng tá»« snapshot GET /counters (khĂ´ng gá»i máº¡ng).
 * @returns sá»‘ \u0111Ă£ ghi, hoáº·c `null` náº¿u khĂ´ng cĂ³ `unread_notifications` há»£p lá»‡.
 */
export async function persistUnreadBadgeFromCountersData(
  d: CountersData | null,
): Promise<number | null> {
  const raw = d?.user?.unread_notifications;
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) {
    return null;
  }
  const n = Math.min(99999, Math.floor(raw));
  try {
    await AsyncStorage.setItem(NOTIF_BADGE_STORAGE_KEY, String(n));
  } catch {
    /* ignore */
  }
  return n;
}

/**
 * Äá»c `user.unread_notifications` tá»« /counters vĂ  ghi vĂ o storage badge (\u0111á»“ng bá»™ icon chuĂ´ng).
 * @returns sá»‘ \u0111Ă£ ghi, hoáº·c `null` náº¿u API lá»—i / khĂ´ng cĂ³ dá»¯ liá»‡u.
 */
export async function syncUnreadNotificationBadgeFromCounters(
  signal?: AbortSignal,
): Promise<number | null> {
  const d = await fetchCounters(signal);
  return persistUnreadBadgeFromCountersData(d);
}

