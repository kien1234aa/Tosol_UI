import { toast } from '@shared/components/ui/appFeedback/appFeedback';
import React, { useCallback, useMemo } from 'react';
import { CatalogListMobileCard } from '@shared/components/ui/listMobileCard/CatalogListMobileCard';
import { StatusPill } from '@shared/components/ui/StatusPill';
import type { ServicePricingListItemApi } from '@services/finance/servicePricingApiTypes';

export type ServicePricingListMobileCardProps = {
  row: ServicePricingListItemApi;
  onEdit?: () => void;
};

function formatPrice(
  n: number,
  currencyCode: string,
  decimals: number,
): string {
  const d = Number.isFinite(decimals) ? Math.max(0, Math.min(6, decimals)) : 0;
  return `${n.toLocaleString('vi-VN', {
    maximumFractionDigits: d,
  })} ${currencyCode}`;
}

function ServicePricingListMobileCardImpl({
  row,
  onEdit,
}: ServicePricingListMobileCardProps) {
  const cur = row.currency;
  const curCode = cur?.code?.trim() || 'VND';
  const decimals = cur?.decimal_places ?? 0;
  const seller = row.seller;
  const wh = row.warehouse;
  const toWh = row.to_warehouse;

  const onDetail = useCallback(() => {
    const lines = [
      `Mã: ${row.name}`,
      `Đơn vị: ${row.unit_label}`,
      seller ? `Seller: ${seller.name}` : null,
      wh ? `Kho: ${wh.name}` : null,
      toWh ? `Kho đích: ${toWh.name}` : null,
    ].filter(Boolean);
    toast.info(lines.join('\n'));
  }, [row, seller, wh, toWh]);

  const loc = [
    seller?.name,
    wh?.name,
    toWh != null ? `→ ${toWh.name}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const statusPill = useMemo(
    () => (
      <>
        <StatusPill
          tone={row.is_active ? 'success' : 'neutral'}
          emphasized={false}
          compact
        >
          {row.is_active ? 'Bật' : 'Tắt'}
        </StatusPill>
      </>
    ),
    [row.is_active],
  );

  return (
    <CatalogListMobileCard
      title={row.service_type_label || row.service_type}
      icon="wallet"
      statusPill={statusPill}
      metaLines={[
        `${formatPrice(row.price, curCode, decimals)} · ${row.unit_label} · ${row.name}`,
        loc.length > 0 ? loc : undefined,
      ].filter((x): x is string => x != null && x.length > 0)}
      onPress={onDetail}
      onEdit={onEdit}
    />
  );
}

export const ServicePricingListMobileCard = React.memo(ServicePricingListMobileCardImpl);
