import { SelectedProduct } from './types';

// Tiered delivery fees based on recipient count
export const DELIVERY_TIERS = {
  small: { maxRecipients: 499, fee: 75, label: 'Small (< 500 recipients)' },
  medium: { maxRecipients: 1499, fee: 150, label: 'Medium (500-1,499 recipients)' },
  large: { maxRecipients: Infinity, fee: 250, label: 'Large (1,500+ recipients)' },
} as const;

export type DeliveryTier = 'small' | 'medium' | 'large';

/**
 * Get the delivery tier based on recipient count
 */
export function getDeliveryTier(recipientCount: number): DeliveryTier {
  if (recipientCount < 500) {
    return 'small';
  } else if (recipientCount < 1500) {
    return 'medium';
  } else {
    return 'large';
  }
}

/**
 * Calculate delivery fee based on recipient count tiers
 * < 500 recipients: $75
 * 500 - 1499 recipients: $150
 * 1500+ recipients: $250
 */
export function calculateDeliveryFee(recipientCount: number): number {
  const tier = getDeliveryTier(recipientCount);
  return DELIVERY_TIERS[tier].fee;
}

/**
 * Get delivery tier information for display
 */
export function getDeliveryTierInfo(recipientCount: number): {
  tier: DeliveryTier;
  fee: number;
  label: string;
} {
  const tier = getDeliveryTier(recipientCount);
  return {
    tier,
    fee: DELIVERY_TIERS[tier].fee,
    label: DELIVERY_TIERS[tier].label,
  };
}

/**
 * Calculate complete order total with tiered delivery fee
 */
export function calculateOrderTotal(
  giftTotal: number,
  recipientCount: number,
  products?: SelectedProduct[]
): {
  giftSubtotal: number;
  fulfillmentSubtotal: number;
  total: number;
  perRecipientFee: number;
  shippingPerRecipient: number;
  deliveryTier: DeliveryTier;
  deliveryTierLabel: string;
} {
  const giftSubtotal = giftTotal * recipientCount;

  // Delivery fee is based on recipient count tiers
  const tierInfo = getDeliveryTierInfo(recipientCount);
  const fulfillmentSubtotal = tierInfo.fee;

  return {
    giftSubtotal,
    fulfillmentSubtotal,
    total: giftSubtotal + fulfillmentSubtotal,
    perRecipientFee: 0, // Legacy field, kept for compatibility
    shippingPerRecipient: 0, // Legacy field, kept for compatibility
    deliveryTier: tierInfo.tier,
    deliveryTierLabel: tierInfo.label,
  };
}
