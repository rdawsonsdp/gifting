export function calculateFulfillmentFee(recipientCount: number): number {
  if (recipientCount <= 25) return 8;
  if (recipientCount <= 50) return 6;
  if (recipientCount <= 100) return 5;
  return 4; // 100+ recipients
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
  const perRecipientFee = calculateFulfillmentFee(recipientCount);
  const giftSubtotal = giftTotal * recipientCount;
  const fulfillmentSubtotal = perRecipientFee * recipientCount;
  
  return {
    giftSubtotal,
    fulfillmentSubtotal,
    total: giftSubtotal + fulfillmentSubtotal,
    perRecipientFee
  };
}
