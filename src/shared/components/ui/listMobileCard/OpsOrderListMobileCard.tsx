import React, { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { SystemIconName } from '../../icons/SystemIcon';
import { StatusPill, type StatusPillTone } from '../StatusPill';
import { BRAND_HEX } from '../../../theme/designTokens';
import { useAppColors, useThemeMode } from '../../../theme/ThemeContext';
import { CompactListMobileCard } from './CompactListMobileCard';
import { ListCardThumb } from './ListCardThumb';

export type OpsOrderListMobileCardProps = {
  orderNumber: string;
  statusLabel: string;
  statusTone: StatusPillTone;
  headerExtra?: ReactNode;
  placeholderIcon: SystemIconName;
  productThumb?: string | null;
  productLabel?: string;
  /** Tên sản phẩm thứ 2 — hiển thị ngay dưới productLabel khi đơn có ≥2 dòng SP. */
  productSecondLabel?: string | null;
  /** Số sản phẩm dôi ra sau 2 dòng đầu — hiển thị «+N sản phẩm khác». */
  moreProductsCount?: number;
  metaLine?: string;
  progressLine?: string;
  footerPrimary?: string;
  footerPrimaryColor?: string;
  footerSecondary?: string;
  onPress?: () => void;
};

/** Thẻ đơn vận hành / kho — 4 thông tin: mã, SP, meta, tiền · ngày. */
function OpsOrderListMobileCardImpl({
  orderNumber,
  statusLabel,
  statusTone,
  headerExtra,
  placeholderIcon,
  productThumb,
  productLabel,
  productSecondLabel,
  moreProductsCount,
  metaLine,
  progressLine,
  footerPrimary,
  footerPrimaryColor,
  footerSecondary,
  onPress,
}: OpsOrderListMobileCardProps) {
  const c = useAppColors();
  const { mode } = useThemeMode();
  const { t } = useTranslation();
  const accent =
    footerPrimaryColor ?? (mode === 'dark' ? c.textLink : BRAND_HEX);

  const detailParts = [metaLine, progressLine].filter(
    (s): s is string => s != null && s.length > 0,
  );
  const detail =
    detailParts.length > 0 ? detailParts.join(' · ') : undefined;

  const moreText =
    moreProductsCount != null && moreProductsCount > 0
      ? t('common.moreProducts', { count: moreProductsCount })
      : null;
  const second = productSecondLabel?.trim();
  let subtitleSecondary: string | undefined;
  if (second && second.length > 0 && moreText != null) {
    subtitleSecondary = `${second} · ${moreText}`;
  } else if (second && second.length > 0) {
    subtitleSecondary = second;
  } else if (moreText != null) {
    subtitleSecondary = moreText;
  }

  const titleRight = useMemo(
    () => (
      <>
        {headerExtra}
        <StatusPill tone={statusTone} emphasized compact>
          {statusLabel}
        </StatusPill>
      </>
    ),
    [headerExtra, statusTone, statusLabel],
  );
  const leading = useMemo(
    () => <ListCardThumb uri={productThumb} icon={placeholderIcon} />,
    [productThumb, placeholderIcon],
  );

  return (
    <CompactListMobileCard
      title={orderNumber}
      titleRight={titleRight}
      leading={leading}
      subtitle={productLabel?.trim() ? productLabel : undefined}
      subtitleSecondary={subtitleSecondary}
      detail={detail}
      footerLeft={footerSecondary}
      footerRight={footerPrimary}
      footerRightAccent={footerPrimary != null}
      onPress={onPress}
    />
  );
}

export const OpsOrderListMobileCard = React.memo(OpsOrderListMobileCardImpl);
