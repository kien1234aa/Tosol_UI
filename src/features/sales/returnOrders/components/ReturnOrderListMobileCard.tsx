import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BRAND_HEX } from '@shared/theme/designTokens';
import { useAppColors, useThemeMode } from '@shared/theme/ThemeContext';
import { OpsOrderListMobileCard } from '@shared/components/ui/listMobileCard/OpsOrderListMobileCard';
import { joinReturnOrderMetaLine } from '@mappers/sales/returnOrderMappers';
import type {
  ReturnOrderListRow,
  ReturnOrderRowStatus,
} from '../returnOrderListTypes';
import type { StatusPillTone } from '@shared/components/ui/StatusPill';

function statusTone(s: ReturnOrderRowStatus): StatusPillTone {
  if (s === 'pending') {
    return 'warning';
  }
  if (s === 'approved' || s === 'completed') {
    return 'success';
  }
  if (s === 'receiving') {
    return 'info';
  }
  if (s === 'rejected' || s === 'cancelled') {
    return 'danger';
  }
  return 'neutral';
}

function statusLabel(s: ReturnOrderRowStatus): string {
  const m: Record<ReturnOrderRowStatus, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    receiving: 'Đang nhận',
    completed: 'Hoàn thành',
    rejected: 'Từ chối',
    cancelled: 'Đã hủy',
    unknown: 'Không rõ',
  };
  return m[s];
}

export type ReturnOrderListMobileCardProps = {
  row: ReturnOrderListRow;
  onPress?: () => void;
};

function ReturnOrderListMobileCardImpl({
  row,
  onPress,
}: ReturnOrderListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const { t } = useTranslation();
  const moneyColor = mode === 'dark' ? c.textLink : BRAND_HEX;

  const metaLine = useMemo(
    () =>
      joinReturnOrderMetaLine([
        row.originOrderNumber
          ? t('returnOrders.list.originOrder', {
              orderNumber: row.originOrderNumber,
              defaultValue: `Đơn ${row.originOrderNumber}`,
            })
          : null,
        row.returnTypeLabel,
        row.reason,
      ]) ?? undefined,
    [row.originOrderNumber, row.returnTypeLabel, row.reason, t],
  );

  const footerSecondary = useMemo(() => {
    if (!row.refundStatusLabel) {
      return undefined;
    }
    return t('returnOrders.list.refundStatusLine', {
      status: row.refundStatusLabel,
      defaultValue: `Hoàn tiền: ${row.refundStatusLabel}`,
    });
  }, [row.refundStatusLabel, t]);

  return (
    <OpsOrderListMobileCard
      orderNumber={row.returnCode}
      statusLabel={statusLabel(row.status)}
      statusTone={statusTone(row.status)}
      placeholderIcon="compare"
      productThumb={row.thumbUrl}
      productLabel={row.productName ?? undefined}
      productSecondLabel={row.productSecondLabel}
      moreProductsCount={row.moreProductsCount}
      metaLine={metaLine}
      footerPrimary={row.refundDisplay ?? undefined}
      footerPrimaryColor={moneyColor}
      footerSecondary={footerSecondary}
      onPress={onPress}
    />
  );
}

export const ReturnOrderListMobileCard = React.memo(ReturnOrderListMobileCardImpl);
