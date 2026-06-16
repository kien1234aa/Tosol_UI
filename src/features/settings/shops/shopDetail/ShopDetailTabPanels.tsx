import React from 'react';
import type { ShopDetailApi } from '@services/settings/shopResponseTypes';
import type { ShopDetailTabId } from './shopDetailTypes';
import { ShopDetailProductMappingsPanel } from './ShopDetailProductMappingsPanel';
import { ShopDetailBankAccountsPanel } from './ShopDetailBankAccountsPanel';
import { ShopDetailCarriersPanel } from './ShopDetailCarriersPanel';
import { ShopDetailPaymentsPanel } from './ShopDetailPaymentsPanel';
import { ShopDetailActivityLogPanel } from './ShopDetailActivityLogPanel';
import { ShopDetailInfoPanel } from './ShopDetailInfoPanel';

export type ShopDetailTabPanelsProps = {
  activeTab: ShopDetailTabId;
  shop: ShopDetailApi;
  reloadSignal?: number;
  onOpenProduct?: (productId: number) => void;
};

export function ShopDetailTabPanels({
  activeTab,
  shop,
  reloadSignal = 0,
  onOpenProduct,
}: ShopDetailTabPanelsProps) {
  if (activeTab === 'products') {
    return (
      <ShopDetailProductMappingsPanel
        shopId={shop.id}
        reloadSignal={reloadSignal}
        onOpenProduct={onOpenProduct}
      />
    );
  }
  if (activeTab === 'banks') {
    return (
      <ShopDetailBankAccountsPanel
        sellerId={shop.seller_id}
        shopDefaultBankAccountId={shop.default_bank_account_id}
        reloadSignal={reloadSignal}
      />
    );
  }
  if (activeTab === 'carriers') {
    return (
      <ShopDetailCarriersPanel
        sellerId={shop.seller_id}
        shopDefaultShippingPartnerSellerId={
          shop.default_shipping_partner_seller_id
        }
        reloadSignal={reloadSignal}
      />
    );
  }
  if (activeTab === 'payments') {
    return (
      <ShopDetailPaymentsPanel
        sellerId={shop.seller_id}
        shopPaymentGatewayId={shop.seller_payment_gateway_id}
        defaultPaymentMethod={shop.default_payment_method}
        onlinePaymentMethod={shop.online_payment_method}
        reloadSignal={reloadSignal}
      />
    );
  }
  if (activeTab === 'activity') {
    return (
      <ShopDetailActivityLogPanel
        shopId={shop.id}
        reloadSignal={reloadSignal}
      />
    );
  }

  if (activeTab !== 'info') {
    return null;
  }

  return <ShopDetailInfoPanel shop={shop} reloadSignal={reloadSignal} />;
}
