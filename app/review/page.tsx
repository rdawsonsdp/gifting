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
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showOrderCompleteModal, setShowOrderCompleteModal] = useState(false);
  const [orderData, setOrderData] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const giftTotal = getCurrentTotal();
  const recipientCount = state.recipients.length;
  const pricing = calculateOrderTotal(giftTotal, recipientCount);

  const handleBuyerSubmit = (data: BuyerInfo) => {
    dispatch({ type: 'SET_BUYER_INFO', payload: data });
    setError(null);
    setFormValidationErrors([]);
    setIsFormValid(true);
  };

  const handleFormValidationCheck = (isValid: boolean, errors: string[]) => {
    setIsFormValid(isValid);
    setFormValidationErrors(errors);
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

    // Validate buyer information with specific field checks
    if (!state.buyerInfo) {
      setError('Please complete your buyer information and click "Save Information" before placing your order. All fields marked with * are required.');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }
    
    // Check if form has been saved (indicated by isFormValid being true when buyerInfo exists)
    if (state.buyerInfo && !isFormValid && formValidationErrors.length > 0) {
      setError(`Please update the following fields and click "Save Information": ${formValidationErrors.join(', ')}`);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }

    // Check each required field and provide specific feedback
    const missingFields: string[] = [];
    
    if (!state.buyerInfo.name || state.buyerInfo.name.trim().length === 0) {
      missingFields.push('Full Name');
    }
    
    if (!state.buyerInfo.email || state.buyerInfo.email.trim().length === 0) {
      missingFields.push('Email');
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(state.buyerInfo.email.trim())) {
        missingFields.push('Email (invalid format)');
      }
    }
    
    if (!state.buyerInfo.phone || state.buyerInfo.phone.trim().length < 10) {
      missingFields.push('Phone (must be at least 10 digits)');
    }
    
    if (!state.buyerInfo.company || state.buyerInfo.company.trim().length === 0) {
      missingFields.push('Company');
    }
    
    // Check deliveryDate - handle both empty string and undefined
    const deliveryDateValue = state.buyerInfo.deliveryDate;
    if (!deliveryDateValue || (typeof deliveryDateValue === 'string' && deliveryDateValue.trim().length === 0)) {
      missingFields.push('Delivery Date');
    } else {
      // Validate that delivery date is today or in the future
      try {
        const selectedDate = new Date(deliveryDateValue);
        // Check if date is valid
        if (isNaN(selectedDate.getTime())) {
          missingFields.push('Delivery Date (invalid date format)');
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          selectedDate.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            missingFields.push('Delivery Date (must be today or in the future)');
          }
        }
      } catch (error) {
        console.error('Error parsing delivery date:', error, 'Value:', deliveryDateValue);
        missingFields.push('Delivery Date (invalid date)');
      }
    }

    if (missingFields.length > 0) {
      setError(`Please complete the following required fields: ${missingFields.join(', ')}. Make sure to click "Save Information" after updating any fields.`);
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

    try {
      // Call API to create draft order
      const response = await fetch('/api/create-draft-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: state.selectedProducts,
          recipients: state.recipients,
          buyerInfo: state.buyerInfo,
          pricing: {
            fulfillmentSubtotal: pricing.fulfillmentSubtotal,
            perRecipientFee: pricing.perRecipientFee,
          },
          tier: state.selectedTier?.name || 'Unknown',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Success - show order complete modal
      setOrderData({
        orderId: data.draftOrderId,
        orderNumber: data.draftOrderNumber || data.draftOrderId,
      });
      setOrderCompleted(true);
      setShowOrderCompleteModal(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
      setSubmitting(false);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
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
            onValidationCheck={handleFormValidationCheck}
          />
          {state.buyerInfo && isFormValid && (
            <div className="mt-3 sm:mt-4 p-3 bg-[#E8F5E9] border border-[#4CAF50] rounded-lg">
              <p className="text-xs sm:text-sm text-[#2E7D32] font-semibold">
                ✓ Information saved successfully
              </p>
            </div>
          )}
          {state.buyerInfo && !isFormValid && formValidationErrors.length > 0 && (
            <div className="mt-3 sm:mt-4 p-3 bg-[#FFF3CD] border-2 border-[#FFC107] rounded-lg">
              <p className="text-xs sm:text-sm text-[#856404] font-semibold mb-1">
                ⚠️ Please update the following fields:
              </p>
              <ul className="text-xs text-[#856404] list-disc list-inside space-y-0.5">
                {formValidationErrors.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
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
          disabled={submitting || orderCompleted}
          className="w-full sm:min-w-[200px]"
        >
          {submitting ? 'Processing...' : orderCompleted ? 'Order Completed' : 'Place Order'}
        </Button>
      </div>

      {/* Order Complete Modal */}
      <Modal
        isOpen={showOrderCompleteModal}
        onClose={() => {
          setShowOrderCompleteModal(false);
          // Redirect to confirmation page after modal is closed
          if (orderData) {
            router.push(`/confirmation?orderId=${orderData.orderId}&orderNumber=${orderData.orderNumber}`);
          }
        }}
        title="Order Complete!"
        showCloseButton={true}
      >
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-4">✓</div>
          <p className="text-base sm:text-lg text-[#333333] mb-2 font-semibold">
            Your Corporate Gifting Order is Complete.
          </p>
          <p className="text-sm sm:text-base text-[#8B7355]">
            A member of Our Brown Sugar Bakery Staff will Contact you for Payment and Order Confirmation.
          </p>
        </div>
      </Modal>

    </div>
  );
}
