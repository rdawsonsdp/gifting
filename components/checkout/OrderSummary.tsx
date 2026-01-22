import { SelectedProduct, DeliveryMethod } from '@/lib/types';
import Card from '@/components/ui/Card';
import { DELIVERY_TIERS, DeliveryTier } from '@/lib/pricing';

interface OrderSummaryProps {
  giftContents: SelectedProduct[];
  recipientCount: number;
  pricing: {
    giftSubtotal: number;
    fulfillmentSubtotal: number;
    total: number;
    perRecipientFee: number;
    shippingPerRecipient?: number;
    deliveryTier?: DeliveryTier;
    deliveryTierLabel?: string;
  };
  deliveryMethod?: DeliveryMethod | null;
}

export default function OrderSummary({
  giftContents,
  recipientCount,
  pricing,
  deliveryMethod,
}: OrderSummaryProps) {
  const giftTotal = giftContents.reduce(
    (sum, sp) => sum + sp.product.price * sp.quantity,
    0
  );

  // Calculate shipping cost for shipped orders (not one-location)
  const isShippedOrder = deliveryMethod && deliveryMethod.id !== 'one-location';
  const isDeliveryOrder = !deliveryMethod || deliveryMethod.id === 'one-location';
  const shippingCostPerRecipient = isShippedOrder ? deliveryMethod.price : 0;
  const totalShippingCost = shippingCostPerRecipient * recipientCount;

  // Delivery fee only applies to one-location delivery, not shipped orders
  const deliveryFee = isDeliveryOrder ? pricing.fulfillmentSubtotal : 0;
  const grandTotal = pricing.giftSubtotal + deliveryFee + totalShippingCost;

  // Get delivery tier label for display
  const deliveryTierDisplay = pricing.deliveryTier
    ? `${recipientCount < 500 ? '< 500' : recipientCount < 1500 ? '500-1,499' : '1,500+'} recipients`
    : '';

  return (
    <Card>
      <h2 className="text-lg sm:text-xl font-bold text-[#E98D3D] mb-3 sm:mb-4 font-[var(--font-playfair)]">
        Order Summary
      </h2>

      {/* Gift Contents */}
      <div className="mb-4 sm:mb-6">
        <h3 className="font-semibold text-[#E98D3D] mb-2 text-sm sm:text-base">Gift Contents</h3>
        <div className="space-y-2">
          {giftContents.map((sp) => (
            <div key={sp.product.id} className="flex justify-between text-xs sm:text-sm">
              <span className="truncate pr-2">{sp.product.title} × {sp.quantity}</span>
              <span className="whitespace-nowrap">${(sp.product.price * sp.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recipient Info */}
      <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[#8B7355]/30">
        <div className="flex justify-between text-xs sm:text-sm">
          <span>Number of Recipients:</span>
          <span className="font-semibold whitespace-nowrap">{recipientCount}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm mt-1">
          <span>Gift cost per recipient:</span>
          <span className="whitespace-nowrap">${giftTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span className="pr-2">Gift Subtotal ({recipientCount} × ${giftTotal.toFixed(2)}):</span>
          <span className="whitespace-nowrap">${pricing.giftSubtotal.toFixed(2)}</span>
        </div>
        {isDeliveryOrder && (
          <div className="flex justify-between">
            <span className="pr-2">Delivery Fee ({deliveryTierDisplay}):</span>
            <span className="whitespace-nowrap">${deliveryFee.toFixed(2)}</span>
          </div>
        )}
        {isShippedOrder && (
          <div className="flex justify-between">
            <span className="pr-2">Shipping ({deliveryMethod.name} × {recipientCount}):</span>
            <span className="whitespace-nowrap">${totalShippingCost.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[#8B7355] text-xs mt-2">
          <span>Tax:</span>
          <span className="whitespace-nowrap">TBD (calculated at checkout)</span>
        </div>
        <div className="border-t border-[#8B7355]/30 pt-3 mt-3">
          <div className="flex justify-between font-bold text-base sm:text-lg text-[#E98D3D]">
            <span>Total:</span>
            <span className="whitespace-nowrap">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
