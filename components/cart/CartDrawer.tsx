'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import { AppliedDiscount } from '@/lib/types';
import GiftCardAddon from './GiftCardAddon';

// Compact discount code input for cart drawer
function CartDiscountCode({
  orderSubtotal,
  appliedDiscount,
  onDiscountChange,
}: {
  orderSubtotal: number;
  appliedDiscount: AppliedDiscount | null;
  onDiscountChange: (discount: AppliedDiscount | null) => void;
}) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setStatus('validating');
    setErrorMessage('');

    try {
      const res = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, orderSubtotal }),
      });

      const data = await res.json();

      if (data.valid) {
        const discount: AppliedDiscount = {
          code: data.code,
          title: data.title,
          valueType: data.valueType,
          value: data.value,
          discountAmount: data.discountAmount,
        };
        onDiscountChange(discount);
        setStatus('idle');
        setCode('');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Invalid code');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Failed to validate');
    }
  };

  const handleRemove = () => {
    onDiscountChange(null);
    setCode('');
    setStatus('idle');
    setErrorMessage('');
  };

  // If discount is applied, show success state
  if (appliedDiscount) {
    return (
      <div className="mt-4 pt-4 border-t border-light-brown/20">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-green-700 truncate">
                  {appliedDiscount.code}
                </p>
                <p className="text-xs text-green-600">
                  -{appliedDiscount.valueType === 'PERCENTAGE' ? `${appliedDiscount.value}%` : `$${appliedDiscount.value.toFixed(2)}`}
                  {' '}(saves ${appliedDiscount.discountAmount.toFixed(2)})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-red-600 hover:text-red-700 ml-2"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-light-brown/20">
      <label className="block text-xs font-semibold text-primary-brown mb-2">
        Discount Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (status === 'error') {
              setStatus('idle');
              setErrorMessage('');
            }
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Enter code"
          disabled={status === 'validating'}
          className={`
            flex-1 px-3 py-2 rounded-lg border text-sm
            ${status === 'error' ? 'border-red-400' : 'border-light-brown/30'}
            focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={status === 'validating' || !code.trim()}
          className="px-3 py-2 rounded-lg font-semibold text-xs bg-primary-brown text-white hover:bg-[#D67A2E] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[60px]"
        >
          {status === 'validating' ? '...' : 'Apply'}
        </button>
      </div>
      {status === 'error' && errorMessage && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const router = useRouter();
  const { state, dispatch, getCurrentTotal, isCartOpen, setCartOpen } = useGift();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isCartOpen, setCartOpen]);

  const hasPackage = !!state.selectedPackage;
  const hasProducts = state.selectedProducts.length > 0;
  const isEmpty = !hasPackage && !hasProducts;

  const giftSubtotal = hasPackage
    ? state.selectedPackage!.price
    : getCurrentTotal();

  const recipientCount = state.plannedRecipientCount;

  // Calculate weight: use product weight if available, otherwise default to 18oz (1.125 lbs) per item
  const DEFAULT_WEIGHT_OZ = 18; // 18 ounces per box
  const weightPerRecipientOz = hasPackage
    ? DEFAULT_WEIGHT_OZ // Package default weight
    : state.selectedProducts.reduce((sum, sp) => {
        const itemWeightOz = sp.product.weight
          ? sp.product.weight / 28.35 // Convert grams to ounces if weight exists
          : DEFAULT_WEIGHT_OZ;
        return sum + itemWeightOz * sp.quantity;
      }, 0);
  const totalWeightOz = weightPerRecipientOz * recipientCount;
  const totalWeightLbs = totalWeightOz / 16;

  const handleCTA = () => {
    setCartOpen(false);
    router.push('/recipients');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-brown/20">
          <h2 className="text-lg font-bold text-primary-brown font-display">Your Gift Selection</h2>
          <div className="flex items-center gap-1">
            {!isEmpty && (
              <button
                onClick={() => dispatch({ type: 'CLEAR_CART' })}
                className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                aria-label="Clear cart"
              >
                Clear Cart
              </button>
            )}
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 hover:bg-cream rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4">
                <svg className="w-16 h-16 text-charcoal/20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <p className="text-charcoal/60 font-medium mb-1">Your cart is empty</p>
              <p className="text-sm text-charcoal/40 mb-6">Start building your perfect gift</p>
              <button
                onClick={() => {
                  setCartOpen(false);
                  router.push('/');
                }}
                className="text-sm font-semibold text-primary-brown hover:text-accent-gold transition-colors underline underline-offset-2"
              >
                Browse Gifts
              </button>
            </div>
          ) : (
            <div>
              {/* Number of Recipients Selector */}
              <div className="pb-4 mb-4 border-b border-light-brown/20">
                <h3 className="font-semibold text-primary-brown mb-2 text-sm">Number of Recipients</h3>
                <p className="text-xs text-charcoal/60 mb-3">How many gift packages do you need?</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-light-brown/30 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => dispatch({ type: 'SET_RECIPIENT_COUNT', payload: state.plannedRecipientCount - 10 })}
                      className="px-2 py-2 hover:bg-cream transition-colors text-primary-brown/70 text-xs font-medium border-r border-light-brown/20"
                    >
                      −10
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'SET_RECIPIENT_COUNT', payload: state.plannedRecipientCount - 1 })}
                      className="px-3 py-2 hover:bg-cream transition-colors text-primary-brown font-bold border-r border-light-brown/20"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={state.plannedRecipientCount}
                      onChange={(e) => dispatch({ type: 'SET_RECIPIENT_COUNT', payload: parseInt(e.target.value) || 1 })}
                      className="w-14 py-2 font-bold text-primary-brown text-center focus:outline-none text-sm"
                      min={1}
                    />
                    <button
                      onClick={() => dispatch({ type: 'SET_RECIPIENT_COUNT', payload: state.plannedRecipientCount + 1 })}
                      className="px-3 py-2 hover:bg-cream transition-colors text-primary-brown font-bold border-l border-light-brown/20"
                    >
                      +
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'SET_RECIPIENT_COUNT', payload: state.plannedRecipientCount + 10 })}
                      className="px-2 py-2 hover:bg-cream transition-colors text-primary-brown/70 text-xs font-medium border-l border-light-brown/20"
                    >
                      +10
                    </button>
                  </div>
                  <span className="text-xs text-charcoal/60">
                    {state.plannedRecipientCount === 1 ? 'gift package' : 'gift packages'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[10, 25, 50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => dispatch({ type: 'SET_RECIPIENT_COUNT', payload: preset })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        state.plannedRecipientCount === preset
                          ? 'bg-primary-brown text-white'
                          : 'bg-cream text-primary-brown hover:bg-primary-brown/10'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Package item */}
              {hasPackage && state.selectedPackage && (
                <div className="flex gap-3 pb-4 border-b border-light-brown/10">
                  {state.selectedPackage.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-cream">
                      <img
                        src={state.selectedPackage.image}
                        alt={state.selectedPackage.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-primary-brown truncate">
                          {state.selectedPackage.name}
                        </h3>
                        <p className="text-xs text-charcoal/60 mt-0.5">Signature Package</p>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'CLEAR_CART' })}
                        className="p-1.5 text-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors ml-2"
                        aria-label="Remove package"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-primary-brown">
                        ${state.selectedPackage.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-charcoal/50">
                        Qty: {state.selectedPackage.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Product items */}
              {hasProducts && (
                <div className="space-y-3">
                  {state.selectedProducts.map((sp) => (
                    <div key={sp.product.id} className="flex gap-3 pb-3 border-b border-light-brown/10 last:border-0">
                      {sp.product.image && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-cream">
                          <img
                            src={sp.product.image}
                            alt={sp.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium text-primary-brown truncate flex-1">
                            {sp.product.title}
                          </h3>
                          <button
                            onClick={() => dispatch({ type: 'REMOVE_PRODUCT', payload: sp.product.id })}
                            className="p-1 text-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-1"
                            aria-label={`Remove ${sp.product.title}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-charcoal/60 mt-0.5">
                          ${sp.product.price.toFixed(2)} each
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'UPDATE_QUANTITY',
                                  payload: { productId: sp.product.id, quantity: sp.quantity - 1 },
                                })
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-light-brown/30 text-charcoal/70 hover:bg-cream transition-colors text-sm"
                              aria-label={`Decrease ${sp.product.title} quantity`}
                            >
                              -
                            </button>
                            <span className="w-7 text-center text-sm font-semibold text-primary-brown">
                              {sp.quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch({ type: 'ADD_PRODUCT', payload: sp.product })
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-light-brown/30 text-charcoal/70 hover:bg-cream transition-colors text-sm"
                              aria-label={`Increase ${sp.product.title} quantity`}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-bold text-primary-brown">
                            ${(sp.product.price * sp.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Gift Card Add-on Placeholder */}
              <GiftCardAddon />

              {/* Discount Code Section */}
              <CartDiscountCode
                orderSubtotal={giftSubtotal * recipientCount}
                appliedDiscount={state.appliedDiscount}
                onDiscountChange={(discount) => dispatch({ type: 'SET_DISCOUNT', payload: discount })}
              />
            </div>
          )}
        </div>

        {/* Footer with pricing & CTA */}
        {!isEmpty && (
          <div className="border-t border-light-brown/20 px-5 py-4 bg-cream/30">
            {/* Per-person subtotal */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">Gift cost per recipient</span>
                <span className="font-semibold text-primary-brown">
                  ${giftSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/70">
                  {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} × ${giftSubtotal.toFixed(2)}
                </span>
                <span className="font-bold text-primary-brown text-base">
                  ${(giftSubtotal * recipientCount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Weight estimate */}
            <div className="mb-3 p-2 bg-cream/50 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-charcoal/60 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  Est. shipping weight
                </span>
                <span className="font-semibold text-primary-brown">
                  {totalWeightLbs < 1
                    ? `${Math.round(totalWeightOz)} oz`
                    : `${totalWeightLbs.toFixed(1)} lbs`}
                </span>
              </div>
              {totalWeightLbs > 15.625 && (
                <p className="text-xs text-amber-600 mt-1">
                  Large order - special shipping may apply
                </p>
              )}
            </div>

            <button
              onClick={handleCTA}
              className="w-full bg-primary-brown text-white font-semibold py-3 rounded-xl hover:bg-[#D67A2E] transition-colors text-sm"
            >
              Continue to Delivery
            </button>

            <button
              onClick={() => {
                setCartOpen(false);
                const tierSlug = state.selectedTier?.slug;
                router.push(tierSlug ? `/build/${tierSlug}` : '/');
              }}
              className="w-full text-center text-sm font-semibold text-primary-brown hover:text-accent-gold transition-colors mt-3 py-1"
            >
              + Add More Products
            </button>
          </div>
        )}
      </div>
    </>
  );
}
