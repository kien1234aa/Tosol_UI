import type { PreferenceEntry } from '@/src/types/preferences/preferences.types';
import type { CreateOrderSelectOption } from '@/src/types/orders/createOrder.types';
import type { CustomerSearchResult } from '@/src/types/orders/createOrder.types';

const recencyHalfLifeMs = 30 * 24 * 60 * 60 * 1000;

export function computePreferenceScore(
  entry: PreferenceEntry,
  now = Date.now(),
): number {
  const recency = Math.exp(-(now - entry.lastUsedAt) / recencyHalfLifeMs);
  return entry.useCount * 0.3 + recency;
}

export function sortPreferenceEntries(
  entries: PreferenceEntry[],
): PreferenceEntry[] {
  const now = Date.now();
  return [...entries].sort(
    (a, b) => computePreferenceScore(b, now) - computePreferenceScore(a, now),
  );
}

export function getTopPreferenceId(
  entries: PreferenceEntry[],
  validIds: Array<string | number>,
): string | null {
  const validSet = new Set(validIds.map(String));

  for (const entry of sortPreferenceEntries(entries)) {
    if (validSet.has(entry.id)) {
      return entry.id;
    }
  }

  return null;
}

export function sortOptionsByPreference<T extends { id: number }>(
  options: T[],
  entries: PreferenceEntry[],
): T[] {
  const scoreMap = new Map<string, number>();
  const now = Date.now();

  for (const entry of entries) {
    scoreMap.set(entry.id, computePreferenceScore(entry, now));
  }

  return [...options].sort((a, b) => {
    const scoreA = scoreMap.get(String(a.id)) ?? 0;
    const scoreB = scoreMap.get(String(b.id)) ?? 0;
    return scoreB - scoreA;
  });
}

export function pickSuggestedOptions<T extends { id: number }>(
  options: T[],
  entries: PreferenceEntry[],
  limit = 3,
): T[] {
  const rankedIds = new Set(
    sortPreferenceEntries(entries).map(entry => entry.id),
  );
  const sorted = sortOptionsByPreference(options, entries);
  const suggested: T[] = [];

  for (const option of sorted) {
    if (rankedIds.has(String(option.id))) {
      suggested.push(option);
      if (suggested.length >= limit) {
        break;
      }
    }
  }

  return suggested;
}

export function pickSuggestedSelectOptions(
  options: CreateOrderSelectOption[],
  entries: PreferenceEntry[],
  limit = 3,
): CreateOrderSelectOption[] {
  return pickSuggestedOptions(options, entries, limit);
}

export function preferenceEntryToCustomerSearchResult(
  entry: PreferenceEntry,
): CustomerSearchResult | null {
  const id = Number(entry.id);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  return {
    id,
    name: entry.label,
    phone: entry.meta?.phone ?? '',
    address: entry.meta?.address ?? '',
    fullAddress: entry.meta?.fullAddress ?? '',
    email: entry.meta?.email ?? null,
    provinceLabel: entry.meta?.provinceLabel ?? '',
    districtLabel: entry.meta?.districtLabel ?? '',
    wardLabel: entry.meta?.wardLabel ?? '',
  };
}

export function customerSearchResultToPreferenceMeta(
  customer: CustomerSearchResult,
): Record<string, string> {
  return {
    phone: customer.phone,
    address: customer.address,
    fullAddress: customer.fullAddress,
    ...(customer.email ? { email: customer.email } : {}),
    ...(customer.provinceLabel ? { provinceLabel: customer.provinceLabel } : {}),
    ...(customer.districtLabel ? { districtLabel: customer.districtLabel } : {}),
    ...(customer.wardLabel ? { wardLabel: customer.wardLabel } : {}),
  };
}

export function mergePreferenceBuckets(
  ...buckets: PreferenceEntry[][]
): PreferenceEntry[] {
  const merged = new Map<string, PreferenceEntry>();

  for (const bucket of buckets) {
    for (const entry of bucket) {
      const existing = merged.get(entry.id);
      if (!existing || existing.lastUsedAt < entry.lastUsedAt) {
        merged.set(entry.id, entry);
      }
    }
  }

  return sortPreferenceEntries([...merged.values()]);
}
