'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import Image from 'next/image';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state } = useGift();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('orderId');
    const number = searchParams.get('orderNumber');
    setOrderId(id);
    setOrderNumber(number);
  }, [searchParams]);

  if (!state.selectedTier || state.selectedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <h1 className="text-2xl font-bold text-[#E98D3D] mb-4 font-[var(--font-playfair)]">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E98D3D] mb-2 font-[var(--font-playfair)]">
            Order Submitted Successfully!
          </h1>
          {orderNumber && (
            <p className="text-sm sm:text-base text-[#8B7355] mb-2 font-semibold">
              Order Number: {orderNumber}
            </p>
          )}
          {orderId && !orderNumber && (
            <p className="text-sm sm:text-base text-[#8B7355] mb-2 font-semibold">
              Order ID: {orderId}
            </p>
          )}
          <p className="text-xs sm:text-sm text-[#8B7355] mb-4 sm:mb-6">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </Card>

        <Card className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#E98D3D] mb-3 sm:mb-4 font-[var(--font-playfair)]">
            Order Summary
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Badge variant={state.selectedTier.id as 'bronze' | 'silver' | 'gold' | 'platinum'} className="mb-2">
                {state.selectedTier.name} Tier
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold text-[#E98D3D] mb-2 text-sm sm:text-base">Gift Contents</h3>
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
              <div className="flex justify-between font-semibold text-sm sm:text-base text-[#E98D3D]">
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
          <h2 className="text-lg sm:text-xl font-bold text-[#E98D3D] mb-3 sm:mb-4 font-[var(--font-playfair)]">
            What Happens Next?
          </h2>
          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-[#333333]">
            <div className="flex items-start gap-3">
              <span className="text-[#E98D3D] font-bold text-lg">1.</span>
              <p>
                <strong>You will receive an invoice</strong> via email within 24 hours with your order details and payment instructions.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#E98D3D] font-bold text-lg">2.</span>
              <p>
                <strong>Our team will call you</strong> to confirm the order details and answer any questions you may have.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#E98D3D] font-bold text-lg">3.</span>
              <p>
                <strong>Once confirmed and paid</strong>, we'll begin preparing your gifts with the same care and attention we put into every batch.
              </p>
            </div>
            <p className="text-xs sm:text-sm text-[#8B7355] italic mt-4 pt-4 border-t border-[#8B7355]/20">
              From our kitchen to yours. Small batches made daily with the freshest ingredients.
            </p>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button onClick={() => router.push('/')} className="w-full sm:w-auto">
            Start New Order
          </Button>
          <Link href="https://www.brownsugarbakerychicago.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto flex items-center justify-center gap-2 hover:opacity-90">
              <Image
                src="/images/bsb-horizontal-logo-full-color-rgb_600x.svg"
                alt="Brown Sugar Bakery"
                width={150}
                height={50}
                className="h-6 sm:h-8 w-auto object-contain"
              />
            </Button>
          </Link>
        </div>

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#8B7355] px-2">
          <p>Life is Sweeter with Brown Sugar Bakery</p>
          <p className="mt-2">
            Questions? Contact us at{' '}
            <a href="tel:773-570-7676" className="text-[#E98D3D] hover:underline">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E98D3D] mx-auto mb-4"></div>
            <p className="text-[#333333]">Loading order confirmation...</p>
          </div>
        </Card>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
