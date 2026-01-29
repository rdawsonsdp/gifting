'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import { BuyerInfo, AppliedDiscount } from '@/lib/types';
import { calculateOrderTotal } from '@/lib/pricing';
import OrderSummary from '@/components/checkout/OrderSummary';
import BuyerForm from '@/components/checkout/BuyerForm';
import PreferredVendorSection, { VendorDoc } from '@/components/checkout/PreferredVendorSection';
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
  const [invoiceData, setInvoiceData] = useState<{
    orderNumber: string;
    buyerInfo: BuyerInfo;
    products: typeof state.selectedProducts;
    recipients: typeof state.recipients;
    pricing: typeof pricing;
    tier?: string;
    deliveryMethod?: typeof state.deliveryMethod;
  } | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [vendorDocs, setVendorDocs] = useState<VendorDoc[]>([]);
  const [vendorNotes, setVendorNotes] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

  // Calculate gift total based on package or custom build
  const giftTotal = state.selectedPackage
    ? state.selectedPackage.price
    : getCurrentTotal();
  const recipientCount = state.recipients.length;
  // Pass products for per-item shipping calculation
  const pricing = calculateOrderTotal(giftTotal, recipientCount, state.selectedProducts);

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

    // Basic validation - check for package or products
    if (!state.selectedPackage && state.selectedProducts.length === 0) {
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
          selectedPackage: state.selectedPackage || undefined,
          recipients: state.recipients,
          buyerInfo: state.buyerInfo,
          pricing: {
            fulfillmentSubtotal: pricing.fulfillmentSubtotal,
            perRecipientFee: pricing.perRecipientFee,
          },
          deliveryMethod: state.deliveryMethod,
          tier: state.selectedTier?.name || 'Unknown',
          vendorDocs: vendorDocs.length > 0 ? vendorDocs : undefined,
          vendorNotes: vendorNotes.trim() || undefined,
          discount: appliedDiscount || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Success - store order data for invoice generation before clearing cart
      const orderNumber = data.draftOrderNumber || data.draftOrderId;

      setOrderData({
        orderId: data.draftOrderId,
        orderNumber: orderNumber,
      });

      // Save invoice data before clearing cart
      setInvoiceData({
        orderNumber: orderNumber,
        buyerInfo: state.buyerInfo!,
        products: [...state.selectedProducts],
        recipients: [...state.recipients],
        pricing: {
          giftSubtotal: pricing.giftSubtotal,
          fulfillmentSubtotal: pricing.fulfillmentSubtotal,
          shippingCost: pricing.shippingCost,
          total: pricing.total,
        },
        tier: state.selectedTier?.name,
        deliveryMethod: state.deliveryMethod || undefined,
      });

      setOrderCompleted(true);
      setShowOrderCompleteModal(true);
      setSubmitting(false);

      // Clear the cart after successful order
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
      setSubmitting(false);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceData) {
      setInvoiceError('Invoice data not available');
      return;
    }

    setDownloadingInvoice(true);
    setInvoiceError(null);

    try {
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: invoiceData.orderNumber,
          buyerInfo: invoiceData.buyerInfo,
          products: invoiceData.products,
          recipients: invoiceData.recipients,
          pricing: invoiceData.pricing,
          tier: invoiceData.tier,
          deliveryMethod: invoiceData.deliveryMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BSB-Invoice-${invoiceData.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setInvoiceError('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // Check if we have a valid order (either package or tier with products)
  // Skip these checks if an order has been completed (cart was cleared after order)
  const hasValidOrder = state.selectedPackage || state.selectedProducts.length > 0;

  if (!hasValidOrder && !orderCompleted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="error">
          Please select a package or build your gift first.
        </Alert>
        <Button onClick={() => router.push('/')} className="mt-4">
          Go to Home
        </Button>
      </div>
    );
  }

  if (state.recipients.length === 0 && !orderCompleted) {
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
        {state.selectedTier && (
          <Badge variant={state.selectedTier.id as 'bronze' | 'silver' | 'gold' | 'platinum'} className="mb-3 sm:mb-4">
            {state.selectedTier.name} Tier
          </Badge>
        )}
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
            selectedPackage={state.selectedPackage}
            recipientCount={recipientCount}
            pricing={pricing}
            deliveryMethod={state.deliveryMethod}
            discount={appliedDiscount}
            onDiscountApplied={setAppliedDiscount}
            discountDisabled={submitting || orderCompleted}
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

      {/* Preferred Vendor Section */}
      <div className="mt-6 sm:mt-8">
        <PreferredVendorSection
          vendorDocs={vendorDocs}
          vendorNotes={vendorNotes}
          onDocsChange={setVendorDocs}
          onNotesChange={setVendorNotes}
        />
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
            Thank You for Your Order!
          </p>
          <p className="text-sm sm:text-base text-[#8B7355] mb-4">
            Your invoice has been sent to your email address. Please check your inbox for payment details and order confirmation.
          </p>

          {/* Download Invoice Button */}
          <div className="mb-4">
            <Button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice || !invoiceData}
              className="w-full sm:w-auto"
            >
              {downloadingInvoice ? 'Downloading...' : 'Download Invoice (PDF)'}
            </Button>
            {invoiceError && (
              <p className="text-xs text-red-500 mt-2">{invoiceError}</p>
            )}
          </div>

          <div className="bg-[#FFF8F0] border border-[#E98D3D]/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-[#333333] font-medium mb-2">
              Questions? We're here to help!
            </p>
            <p className="text-sm text-[#8B7355]">
              <span className="font-semibold">Phone:</span>{' '}
              <a href="tel:773-570-7676" className="text-[#E98D3D] hover:underline">773-570-7676</a>
            </p>
            <p className="text-sm text-[#8B7355]">
              <span className="font-semibold">Email:</span>{' '}
              <a href="mailto:brownsugarbakery75@gmail.com" className="text-[#E98D3D] hover:underline">brownsugarbakery75@gmail.com</a>
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
}
