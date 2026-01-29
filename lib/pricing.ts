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
 * Volume discount tiers based on order dollar amount
 * $500 - $999.99:  5% off
 * $1,000 - $2,499.99: 10% off
 * $2,500+: 15% off
 */
export const VOLUME_DISCOUNT_TIERS = [
  { min: 2500, rate: 0.15, label: '$2,500+', percent: '15%' },
  { min: 1000, rate: 0.10, label: '$1,000 – $2,500', percent: '10%' },
  { min: 500, rate: 0.05, label: '$500 – $1,000', percent: '5%' },
] as const;

/**
 * Calculate volume discount based on order subtotal
 */
export function getVolumeDiscount(subtotal: number): {
  rate: number;
  amount: number;
  label: string;
  percent: string;
} | null {
  for (const tier of VOLUME_DISCOUNT_TIERS) {
    if (subtotal >= tier.min) {
      return {
        rate: tier.rate,
        amount: subtotal * tier.rate,
        label: tier.label,
        percent: tier.percent,
      };
    }
  }
  return null;
}

/**
 * Calculate complete order total with tiered delivery fee and volume discount
 */
export function calculateOrderTotal(
  giftTotal: number,
  recipientCount: number,
  products?: SelectedProduct[]
): {
  giftSubtotal: number;
  fulfillmentSubtotal: number;
  volumeDiscount: { rate: number; amount: number; label: string; percent: string } | null;
  total: number;
  perRecipientFee: number;
  shippingPerRecipient: number;
  deliveryTier: DeliveryTier;
  deliveryTierLabel: string;
} {
  const giftSubtotal = giftTotal * recipientCount;

  // Volume discount based on gift subtotal
  const volumeDiscount = getVolumeDiscount(giftSubtotal);
  const discountAmount = volumeDiscount?.amount ?? 0;

  // Delivery fee is based on recipient count tiers
  const tierInfo = getDeliveryTierInfo(recipientCount);
  const fulfillmentSubtotal = tierInfo.fee;

  return {
    giftSubtotal,
    fulfillmentSubtotal,
    volumeDiscount,
    total: giftSubtotal - discountAmount + fulfillmentSubtotal,
    perRecipientFee: 0, // Legacy field, kept for compatibility
    shippingPerRecipient: 0, // Legacy field, kept for compatibility
    deliveryTier: tierInfo.tier,
    deliveryTierLabel: tierInfo.label,
  };
}
