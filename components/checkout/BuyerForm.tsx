'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BuyerInfo } from '@/lib/types';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const buyerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  company: z.string().min(1, 'Company name is required'),
});

type BuyerFormData = z.infer<typeof buyerSchema>;

interface BuyerFormProps {
  onSubmit: (data: BuyerInfo) => void;
  initialData?: BuyerInfo;
}

export default function BuyerForm({ onSubmit, initialData }: BuyerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      company: initialData.company || '',
    } : {
      name: '',
      email: '',
      phone: '',
      company: '',
    },
  });

  const onFormSubmit = async (data: BuyerFormData) => {
    // Dismiss keyboard on mobile after submission
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    onSubmit({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
    });
  };

  return (
    <Card>
      <h2 className="text-lg sm:text-xl font-bold text-[#5D4037] mb-3 sm:mb-4 font-[var(--font-playfair)]">
        Your Information
      </h2>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 sm:space-y-4">
        <Input
          label="Full Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="John Doe"
          className="text-sm sm:text-base"
          autoComplete="name"
          inputMode="text"
        />
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="john@example.com"
          className="text-sm sm:text-base"
          autoComplete="email"
          inputMode="email"
        />
        <Input
          label="Phone"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="(555) 123-4567"
          className="text-sm sm:text-base"
          autoComplete="tel"
          inputMode="tel"
        />
        <Input
          label="Company"
          {...register('company')}
          error={errors.company?.message}
          placeholder="Acme Corporation"
          className="text-sm sm:text-base"
          autoComplete="organization"
          inputMode="text"
        />
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base bg-[#5D4037] text-white hover:bg-[#4A3329] active:bg-[#3D2E24] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-h-[44px] touch-manipulation"
            aria-label="Save buyer information"
          >
            {isSubmitting ? 'Saving...' : 'Save Information'}
          </button>
        </div>
      </form>
    </Card>
  );
}
