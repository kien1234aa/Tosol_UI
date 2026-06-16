export { SellerChromeScreenHeader } from './SellerChromeScreenHeader';
export type { SellerChromeScreenHeaderProps } from './SellerChromeScreenHeader';
export {
  SellerChromeFeatureGrid,
  type SellerChromeFeature,
} from './SellerChromeFeatureGrid';
export { SellerChromeListCard } from './SellerChromeListCard';
export { SellerChromeFilterChips } from './SellerChromeFilterChips';
export {
  createSellerChromeStyles,
  useSellerChromeStyles,
} from './useSellerChromeStyles';

/** Padding scroll chuẩn seller (20px). */
export function sellerChromeScrollContent(extra?: object) {
  return {
    padding: 20,
    paddingBottom: 28,
    gap: 4,
    ...extra,
  };
}
