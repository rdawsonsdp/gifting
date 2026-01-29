'use client';

import React, { useState } from 'react';
import { AppliedDiscount } from '@/lib/types';

interface DiscountCodeInputProps {
  orderSubtotal: number;
  onDiscountApplied: (discount: AppliedDiscount | null) => void;
  disabled?: boolean;
}

export default function DiscountCodeInput({
  orderSubtotal,
  onDiscountApplied,
  disabled = false,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

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
        setAppliedDiscount(discount);
        setStatus('success');
        onDiscountApplied(discount);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Invalid discount code');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Failed to validate discount code. Please try again.');
    }
  };

  const handleRemove = () => {
    setAppliedDiscount(null);
    setCode('');
    setStatus('idle');
    setErrorMessage('');
    onDiscountApplied(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  if (status === 'success' && appliedDiscount) {
    return (
      <div className="mt-4 p-3 sm:p-4 bg-[#E8F5E9] border border-[#4CAF50] rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-5 h-5 text-[#2E7D32] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2E7D32] truncate">
                {appliedDiscount.code}
              </p>
              <p className="text-xs text-[#2E7D32]">
                {appliedDiscount.valueType === 'PERCENTAGE'
                  ? `${appliedDiscount.value}% off`
                  : `$${appliedDiscount.value.toFixed(2)} off`}
                {' '}&mdash; saves ${appliedDiscount.discountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="text-xs font-semibold text-[#E53935] hover:text-[#C62828] ml-3 flex-shrink-0 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <label className="block text-xs sm:text-sm font-semibold text-[#333333] mb-1.5">
        Discount Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status === 'error') {
              setStatus('idle');
              setErrorMessage('');
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter code"
          disabled={disabled || status === 'validating'}
          className={`
            flex-1 px-3 py-2 rounded-lg border-2 text-sm
            ${status === 'error'
              ? 'border-[#E53935] focus:border-[#E53935] focus:ring-[#E53935]'
              : 'border-[#8B7355]/30 focus:border-[#E98D3D] focus:ring-[#E98D3D]'
            }
            bg-white text-[#333333]
            focus:outline-none focus:ring-2 focus:ring-offset-1
            transition-all duration-200
            disabled:bg-gray-100 disabled:cursor-not-allowed
            min-h-[44px]
          `}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={disabled || status === 'validating' || !code.trim()}
          className="px-4 py-2 rounded-lg font-semibold text-sm bg-[#E98D3D] text-white hover:bg-[#D67A2E] active:bg-[#C86F28] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[80px] flex items-center justify-center"
        >
          {status === 'validating' ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            'Apply'
          )}
        </button>
      </div>
      {status === 'error' && errorMessage && (
        <p className="mt-1.5 text-xs text-[#E53935]">{errorMessage}</p>
      )}
    </div>
  );
}
