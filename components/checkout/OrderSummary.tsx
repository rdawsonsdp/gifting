import { SelectedProduct } from '@/lib/types';
import Card from '@/components/ui/Card';

interface OrderSummaryProps {
  giftContents: SelectedProduct[];
  recipientCount: number;
  pricing: {
    giftSubtotal: number;
    fulfillmentSubtotal: number;
    total: number;
    perRecipientFee: number;
  };
}

export default function OrderSummary({
  giftContents,
  recipientCount,
  pricing,
}: OrderSummaryProps) {
  const giftTotal = giftContents.reduce(
    (sum, sp) => sum + sp.product.price * sp.quantity,
    0
  );

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
        <div className="flex justify-between text-xs sm:text-sm mt-1">
          <span>Fulfillment fee per recipient:</span>
          <span className="whitespace-nowrap">${pricing.perRecipientFee.toFixed(2)}</span>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span className="pr-2">Gift Subtotal ({recipientCount} × ${giftTotal.toFixed(2)}):</span>
          <span className="whitespace-nowrap">${pricing.giftSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="pr-2">Fulfillment ({recipientCount} × ${pricing.perRecipientFee.toFixed(2)}):</span>
          <span className="whitespace-nowrap">${pricing.fulfillmentSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#8B7355] text-xs mt-2">
          <span>Tax:</span>
          <span className="whitespace-nowrap">TBD (calculated at checkout)</span>
        </div>
        <div className="border-t border-[#8B7355]/30 pt-3 mt-3">
          <div className="flex justify-between font-bold text-base sm:text-lg text-[#E98D3D]">
            <span>Total:</span>
            <span className="whitespace-nowrap">${pricing.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
