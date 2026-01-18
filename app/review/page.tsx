'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import { BuyerInfo } from '@/lib/types';
import { calculateOrderTotal } from '@/lib/pricing';
import OrderSummary from '@/components/checkout/OrderSummary';
import BuyerForm from '@/components/checkout/BuyerForm';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

export default function ReviewPage() {
  const router = useRouter();
  const { state, dispatch, getCurrentTotal } = useGift();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const giftTotal = getCurrentTotal();
  const recipientCount = state.recipients.length;
  const pricing = calculateOrderTotal(giftTotal, recipientCount);

  const handleBuyerSubmit = (data: BuyerInfo) => {
    dispatch({ type: 'SET_BUYER_INFO', payload: data });
    setError(null);
  };

  const handlePlaceOrder = async () => {
    // Prevent double submission
    if (submitting) {
      return;
    }

    // Basic validation
    if (state.selectedProducts.length === 0) {
      setError('No products selected');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }

    if (state.recipients.length === 0) {
      setError('No recipients added');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }

    setSubmitting(true);
    setError(null);
    
    // Dismiss keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Show informational modal for MVP
    setShowPaymentModal(true);
    setSubmitting(false);
  };

  if (!state.selectedTier || state.selectedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="error">
          Please select a tier and build your gift first.
        </Alert>
        <Button onClick={() => router.push('/')} className="mt-4">
          Go to Home
        </Button>
      </div>
    );
  }

  if (state.recipients.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="error">
          Please add recipients before reviewing your order.
        </Alert>
        <Button onClick={() => router.push('/recipients')} className="mt-4">
          Add Recipients
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <Badge variant={state.selectedTier.id as 'bronze' | 'silver' | 'gold' | 'platinum'} className="mb-3 sm:mb-4">
          {state.selectedTier.name} Tier
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#E98D3D] mb-2 font-[var(--font-playfair)]">
          Review Your Order
        </h1>
        <p className="text-sm sm:text-base text-[#333333]">
          Please review your order details and complete your information
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4 sm:mb-6">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Order Summary */}
        <div className="order-2 lg:order-1">
          <OrderSummary
            giftContents={state.selectedProducts}
            recipientCount={recipientCount}
            pricing={pricing}
          />
        </div>

        {/* Buyer Form */}
        <div className="order-1 lg:order-2">
          <BuyerForm
            onSubmit={handleBuyerSubmit}
            initialData={state.buyerInfo || undefined}
          />
          {state.buyerInfo && (
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#4CAF50]">
              ✓ Information saved
            </div>
          )}
        </div>
      </div>

      {/* Place Order Button */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          Back
        </Button>
        <Button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full sm:min-w-[200px]"
        >
          {submitting ? 'Processing...' : 'Place Order'}
        </Button>
      </div>

      {/* Payment Processing Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Processing"
      >
        <div className="space-y-3 sm:space-y-4">
          <p className="text-base sm:text-lg font-semibold text-[#E98D3D]">
            Payment Processing Next
          </p>
          <p className="text-sm sm:text-base text-[#333333]">
            This is an MVP version of the application. Payment processing integration will be added in a future update.
          </p>
          <p className="text-xs sm:text-sm text-[#8B7355] italic">
            Your order details have been saved. Thank you for your interest in Brown Sugar Bakery corporate gifting!
          </p>
        </div>
      </Modal>
    </div>
  );
}
