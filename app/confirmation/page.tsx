'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state } = useGift();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('orderId');
    setOrderId(id);
  }, [searchParams]);

  if (!state.selectedTier || state.selectedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <h1 className="text-2xl font-bold text-[#5D4037] mb-4 font-[var(--font-playfair)]">
            No Order Found
          </h1>
          <p className="text-[#333333] mb-6">
            We couldn't find your order. Please start a new order.
          </p>
          <Button onClick={() => router.push('/')}>
            Start New Order
          </Button>
        </Card>
      </div>
    );
  }

  const recipientCount = state.recipients.length;
  const giftTotal = state.selectedProducts.reduce(
    (sum, sp) => sum + sp.product.price * sp.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">✓</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#5D4037] mb-2 font-[var(--font-playfair)]">
            Order Confirmed!
          </h1>
          {orderId && (
            <p className="text-sm sm:text-base text-[#8B7355] mb-4 sm:mb-6">
              Order ID: {orderId}
            </p>
          )}
        </Card>

        <Card className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#5D4037] mb-3 sm:mb-4 font-[var(--font-playfair)]">
            Order Summary
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Badge variant={state.selectedTier.id as 'bronze' | 'silver' | 'gold' | 'platinum'} className="mb-2">
                {state.selectedTier.name} Tier
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold text-[#5D4037] mb-2 text-sm sm:text-base">Gift Contents</h3>
              <ul className="space-y-1 text-xs sm:text-sm">
                {state.selectedProducts.map((sp) => (
                  <li key={sp.product.id} className="flex justify-between">
                    <span className="truncate pr-2">{sp.product.title} × {sp.quantity}</span>
                    <span className="whitespace-nowrap">${(sp.product.price * sp.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[#8B7355]/30 pt-3 sm:pt-4">
              <div className="flex justify-between font-semibold text-sm sm:text-base text-[#5D4037]">
                <span>Gift Total:</span>
                <span className="whitespace-nowrap">${giftTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-[#8B7355] mt-1">
                <span>Number of Recipients:</span>
                <span className="whitespace-nowrap">{recipientCount}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#5D4037] mb-3 sm:mb-4 font-[var(--font-playfair)]">
            What's Next?
          </h2>
          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-[#333333]">
            <p>
              Thank you for your order! Our team will begin preparing your gifts with the same care and attention we put into every batch.
            </p>
            <p>
              You'll receive an email confirmation shortly with your order details and tracking information once your gifts are shipped.
            </p>
            <p className="text-xs sm:text-sm text-[#8B7355] italic">
              From our kitchen to yours. Small batches made daily with the freshest ingredients.
            </p>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button onClick={() => router.push('/')} className="w-full sm:w-auto">
            Start New Order
          </Button>
          <Link href="https://www.brownsugarbakerychicago.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Visit Main Site
            </Button>
          </Link>
        </div>

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#8B7355] px-2">
          <p>Life is Sweeter with Brown Sugar Bakery</p>
          <p className="mt-2">
            Questions? Contact us at{' '}
            <a href="tel:773-570-7676" className="text-[#5D4037] hover:underline">
              773-570-7676
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <Card>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D4037] mx-auto mb-4"></div>
            <p className="text-[#333333]">Loading order confirmation...</p>
          </div>
        </Card>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
