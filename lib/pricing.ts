// Default flat delivery fee for all orders
export const DEFAULT_DELIVERY_FEE = 40.00;

export function calculateFulfillmentFee(recipientCount: number): number {
  // Flat delivery fee - returns per-order amount (not per recipient)
  return DEFAULT_DELIVERY_FEE;
}

export function calculateOrderTotal(
  giftTotal: number,
  recipientCount: number
): {
  giftSubtotal: number;
  fulfillmentSubtotal: number;
  total: number;
  perRecipientFee: number;
} {
  const deliveryFee = DEFAULT_DELIVERY_FEE;
  const giftSubtotal = giftTotal * recipientCount;
  const fulfillmentSubtotal = deliveryFee; // Flat fee per order

  return {
    giftSubtotal,
    fulfillmentSubtotal,
    total: giftSubtotal + fulfillmentSubtotal,
    perRecipientFee: deliveryFee / recipientCount // For display purposes
  };
}
