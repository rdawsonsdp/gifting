'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BuyerInfo } from '@/lib/types';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

// Simple schema - defaultValues will ensure values are always strings
const buyerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  company: z.string().min(1, 'Company name is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required').refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: 'Delivery date must be today or in the future' }
  ),
  notes: z.string().optional(),
  notifyByText: z.boolean().optional(),
});

type BuyerFormData = z.infer<typeof buyerSchema>;

interface BuyerFormProps {
  onSubmit: (data: BuyerInfo) => void;
  initialData?: BuyerInfo;
  onValidationCheck?: (isValid: boolean, errors: string[]) => void;
}

export default function BuyerForm({ onSubmit, initialData, onValidationCheck }: BuyerFormProps) {
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  
  // Ensure all values are strings, never undefined - this is critical
  const safeInitialData: BuyerFormData = {
    name: initialData?.name ? String(initialData.name) : '',
    email: initialData?.email ? String(initialData.email) : '',
    phone: initialData?.phone ? String(initialData.phone) : '',
    company: initialData?.company ? String(initialData.company) : '',
    deliveryDate: initialData?.deliveryDate ? String(initialData.deliveryDate) : '',
    notes: initialData?.notes ? String(initialData.notes) : '',
    notifyByText: initialData?.notifyByText ?? false,
  };

  const dateInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    mode: 'onSubmit', // Only validate on submit, not on change/blur
    reValidateMode: 'onSubmit',
    shouldUnregister: false,
    defaultValues: safeInitialData,
    shouldFocusError: false,
  });

  // Watch form values for real-time validation
  const watchedValues = watch();

  // Show errors if form has been submitted or if there's partial data
  const shouldShowErrors = hasSubmitted || (initialData && Object.values(initialData).some(v => v && String(v).trim().length > 0));

  // Get list of incomplete fields for summary
  const getIncompleteFields = React.useCallback((): string[] => {
    const incomplete: string[] = [];
    
    if (!watchedValues.name || watchedValues.name.trim().length === 0) {
      incomplete.push('Full Name');
    }
    if (!watchedValues.email || watchedValues.email.trim().length === 0) {
      incomplete.push('Email');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(watchedValues.email.trim())) {
        incomplete.push('Email (invalid format)');
      }
    }
    if (!watchedValues.phone || watchedValues.phone.trim().length < 10) {
      incomplete.push('Phone (must be at least 10 digits)');
    }
    if (!watchedValues.company || watchedValues.company.trim().length === 0) {
      incomplete.push('Company');
    }
    if (!watchedValues.deliveryDate || watchedValues.deliveryDate.trim().length === 0) {
      incomplete.push('Delivery Date');
    } else {
      const selectedDate = new Date(watchedValues.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        incomplete.push('Delivery Date (must be today or in the future)');
      }
    }
    
    return incomplete;
  }, [watchedValues]);

  const incompleteFields = shouldShowErrors ? getIncompleteFields() : [];

  // Expose validation methods - validation happens automatically via useEffect

  // Notify parent of validation status when errors change or form is submitted
  React.useEffect(() => {
    if (onValidationCheck && shouldShowErrors) {
      const incomplete = getIncompleteFields();
      onValidationCheck(incomplete.length === 0, incomplete);
    }
  }, [errors, shouldShowErrors, onValidationCheck, getIncompleteFields]);

  const onFormSubmit = async (data: BuyerFormData) => {
    setHasSubmitted(true);
    
    // Dismiss keyboard on mobile after submission
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    // Ensure deliveryDate is properly formatted (YYYY-MM-DD)
    let deliveryDateValue = data.deliveryDate || '';
    if (deliveryDateValue) {
      // If date is in a different format, try to normalize it
      const dateObj = new Date(deliveryDateValue);
      if (!isNaN(dateObj.getTime())) {
        // Format as YYYY-MM-DD
        deliveryDateValue = dateObj.toISOString().split('T')[0];
      }
    }
    
    const buyerInfo: BuyerInfo = {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      deliveryDate: deliveryDateValue,
      notes: data.notes || undefined,
      notifyByText: data.notifyByText || false,
    };
    
    console.log('Form submitted with buyerInfo:', buyerInfo);

    // Save to JSON file
    try {
      await fetch('/api/save-buyer-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buyerInfo),
      });
    } catch (error) {
      console.error('Error saving buyer info to file:', error);
      // Continue even if file save fails
    }
    
    onSubmit(buyerInfo);
  };

  return (
    <Card>
      <h2 className="text-lg sm:text-xl font-bold text-[#E98D3D] mb-3 sm:mb-4 font-[var(--font-playfair)]">
        Your Information
      </h2>
      <p className="text-xs sm:text-sm text-[#8B7355] mb-3 sm:mb-4">
        All fields marked with <span className="text-[#E53935]">*</span> are required. Please click "Save Information" before placing your order.
      </p>
      
      {/* Validation Summary */}
      {shouldShowErrors && incompleteFields.length > 0 && (
        <div className="mb-4 p-3 sm:p-4 bg-[#FFF3CD] border-2 border-[#FFC107] rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-[#856404] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#856404] mb-1">
                Please complete the following fields:
              </p>
              <ul className="text-xs sm:text-sm text-[#856404] list-disc list-inside space-y-0.5">
                {incompleteFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 sm:space-y-4">
        <Input
          label="Full Name"
          required
          {...register('name')}
          error={shouldShowErrors ? errors.name?.message : undefined}
          placeholder="John Doe"
          className="text-sm sm:text-base"
          autoComplete="name"
          inputMode="text"
        />
        <Input
          label="Email"
          type="email"
          required
          {...register('email')}
          error={shouldShowErrors ? errors.email?.message : undefined}
          placeholder="john@example.com"
          className="text-sm sm:text-base"
          autoComplete="email"
          inputMode="email"
        />
        <Input
          label="Phone"
          type="tel"
          required
          {...register('phone')}
          error={shouldShowErrors ? errors.phone?.message : undefined}
          placeholder="(555) 123-4567"
          className="text-sm sm:text-base"
          autoComplete="tel"
          inputMode="tel"
        />
        <Input
          label="Company"
          required
          {...register('company')}
          error={shouldShowErrors ? errors.company?.message : undefined}
          placeholder="Acme Corporation"
          className="text-sm sm:text-base"
          autoComplete="organization"
          inputMode="text"
        />
        <div
          onMouseEnter={() => {
            if (dateInputRef.current && window.matchMedia('(hover: hover)').matches) {
              try {
                dateInputRef.current.showPicker();
              } catch (_) {
                // showPicker not supported in all browsers
              }
            }
          }}
        >
          <Input
            label="Delivery Date"
            type="date"
            required
            {...(() => {
              const { ref, ...rest } = register('deliveryDate');
              return {
                ...rest,
                ref: (e: HTMLInputElement | null) => {
                  ref(e);
                  dateInputRef.current = e;
                },
              };
            })()}
            error={shouldShowErrors ? errors.deliveryDate?.message : undefined}
            className="text-sm sm:text-base"
            min={new Date().toISOString().split('T')[0]}
            inputMode="none"
          />
        </div>
        
        {/* Notes Field */}
        <div className="w-full">
          <label htmlFor="notes" className="block text-xs sm:text-sm font-semibold text-[#333333] mb-1.5 sm:mb-2">
            Order Notes
            <span className="text-xs text-[#8B7355] ml-1">(optional)</span>
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={4}
            className={`
              w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm sm:text-base
              ${errors.notes && shouldShowErrors
                ? 'border-[#E53935] focus:border-[#E53935] focus:ring-[#E53935]' 
                : 'border-[#8B7355]/30 focus:border-[#E98D3D] focus:ring-[#E98D3D]'
              }
              bg-white text-[#333333]
              focus:outline-none focus:ring-2 focus:ring-offset-1
              transition-all duration-200
              resize-y
              min-h-[88px]
            `}
            placeholder="Add any special instructions, delivery notes, or additional information..."
            aria-invalid={errors.notes && shouldShowErrors ? 'true' : 'false'}
            aria-describedby={errors.notes && shouldShowErrors ? 'notes-error' : undefined}
          />
          {errors.notes && shouldShowErrors && (
            <p id="notes-error" className="mt-1 text-xs sm:text-sm text-[#E53935]" role="alert">
              {errors.notes.message}
            </p>
          )}
        </div>

        {/* Text Notification Opt-in - DISABLED FOR NOW
        <div className="bg-[#FFF8F0] border border-[#E98D3D]/30 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('notifyByText')}
              className="mt-1 w-5 h-5 text-[#E98D3D] border-[#8B7355]/30 rounded focus:ring-[#E98D3D]/30 cursor-pointer"
            />
            <div>
              <span className="text-sm font-semibold text-[#333333]">
                Notify me by text message
              </span>
              <p className="text-xs text-[#8B7355] mt-1">
                Receive a text message with your invoice link for easy payment. Standard messaging rates may apply.
              </p>
            </div>
          </label>
        </div>
        */}

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base bg-[#E98D3D] text-white hover:bg-[#D67A2E] active:bg-[#C86F28] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-h-[44px] touch-manipulation"
            aria-label="Save buyer information"
          >
            {isSubmitting ? 'Saving...' : 'Save Information'}
          </button>
        </div>
      </form>
    </Card>
  );
}
