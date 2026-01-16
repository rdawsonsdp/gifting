'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import { Recipient } from '@/lib/types';
import { calculateFulfillmentFee, calculateOrderTotal } from '@/lib/pricing';
import CSVUploader from '@/components/recipients/CSVUploader';
import RecipientTable from '@/components/recipients/RecipientTable';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';

export default function RecipientsPage() {
  const router = useRouter();
  const { state, dispatch, getCurrentTotal } = useGift();
  const [recipients, setRecipients] = useState<Recipient[]>(state.recipients);
  const [error, setError] = useState<string | null>(null);

  const giftTotal = getCurrentTotal();
  const recipientCount = recipients.length;
  const validRecipients = recipients.filter(r => r.isValid);
  const canProceed = validRecipients.length > 0 && validRecipients.length === recipients.length;

  const pricing = calculateOrderTotal(giftTotal, recipientCount);

  const handleUpload = (newRecipients: Recipient[]) => {
    setRecipients(newRecipients);
    dispatch({ type: 'SET_RECIPIENTS', payload: newRecipients });
    setError(null);
  };

  const handleUpdate = (updatedRecipients: Recipient[]) => {
    setRecipients(updatedRecipients);
    dispatch({ type: 'SET_RECIPIENTS', payload: updatedRecipients });
  };

  const handleContinue = () => {
    if (canProceed) {
      router.push('/review');
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <Badge variant={state.selectedTier.id as 'bronze' | 'silver' | 'gold' | 'platinum'} className="mb-3 sm:mb-4">
          {state.selectedTier.name} Tier
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#5D4037] mb-2 font-[var(--font-playfair)]">
          Add Recipients
        </h1>
        <p className="text-sm sm:text-base text-[#333333]">
          Upload a CSV file with your recipient list
        </p>
      </div>

      {/* Gift Summary */}
      <Card className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-[#5D4037] mb-3 sm:mb-4 font-[var(--font-playfair)]">
          Your Gift Summary
        </h2>
        <div className="space-y-2">
          {state.selectedProducts.map((sp) => (
            <div key={sp.product.id} className="flex justify-between text-xs sm:text-sm">
              <span className="truncate pr-2">{sp.product.title} × {sp.quantity}</span>
              <span className="font-semibold whitespace-nowrap">${(sp.product.price * sp.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-[#8B7355]/30 pt-2 mt-2">
            <div className="flex justify-between font-semibold text-sm sm:text-base text-[#5D4037]">
              <span>Gift Total:</span>
              <span>${giftTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* CSV Uploader */}
      <div className="mb-8">
        <CSVUploader onUpload={handleUpload} onError={setError} />
        {error && (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        )}
      </div>

      {/* Recipient Table */}
      {recipients.length > 0 && (
        <div className="mb-8">
          <RecipientTable recipients={recipients} onUpdate={handleUpdate} />
        </div>
      )}

      {/* Pricing Summary */}
      {recipients.length > 0 && (
        <Card className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-[#5D4037] mb-3 sm:mb-4 font-[var(--font-playfair)]">
            Pricing Summary
          </h2>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span>Gift cost per recipient:</span>
              <span className="whitespace-nowrap">${giftTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fulfillment fee per recipient:</span>
              <span className="whitespace-nowrap">${pricing.perRecipientFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of recipients:</span>
              <span className="whitespace-nowrap">{recipientCount}</span>
            </div>
            <div className="border-t border-[#8B7355]/30 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-xs sm:text-sm">
                <span className="pr-2">Gift Subtotal ({recipientCount} × ${giftTotal.toFixed(2)}):</span>
                <span className="whitespace-nowrap">${pricing.giftSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-xs sm:text-sm mt-1">
                <span className="pr-2">Fulfillment ({recipientCount} × ${pricing.perRecipientFee.toFixed(2)}):</span>
                <span className="whitespace-nowrap">${pricing.fulfillmentSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base sm:text-lg text-[#5D4037] mt-2">
                <span>Total:</span>
                <span className="whitespace-nowrap">${pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canProceed}
          className="w-full sm:min-w-[200px]"
        >
          {canProceed ? 'Continue to Review' : `Fix ${recipients.length - validRecipients.length} Invalid`}
        </Button>
      </div>
    </div>
  );
}
