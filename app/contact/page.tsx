'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().optional(),
  estimatedRecipients: z.string().min(1, 'Please provide an estimate'),
  budgetRange: z.string().min(1, 'Please select a budget range'),
  preferredTier: z.string().optional(),
  eventDate: z.string().optional(),
  message: z.string().min(10, 'Please provide more details (at least 10 characters)'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);
    setShowSuccess(false);

    // Dismiss keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message. Please try again.');
      }

      // Show success message
      setShowSuccess(true);
      reset();
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-brown mb-2 sm:mb-4 font-display">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-charcoal/70">
            Get in touch with our corporate gifting team. We'll help you create the perfect gift program.
          </p>
        </div>

        {showSuccess && (
          <Alert variant="success" className="mb-6 sm:mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h3 className="font-semibold mb-1">Thank you!</h3>
                <p>Someone will contact you shortly.</p>
              </div>
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="error" className="mb-6 sm:mb-8">
            {error}
          </Alert>
        )}

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Full Name *"
                {...register('name')}
                error={errors.name?.message}
                placeholder="John Doe"
                autoComplete="name"
                inputMode="text"
                required
              />
              <Input
                label="Email Address *"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="john@company.com"
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Phone Number *"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder="(555) 123-4567"
                autoComplete="tel"
                inputMode="tel"
                required
              />
              <Input
                label="Company Name *"
                {...register('company')}
                error={errors.company?.message}
                placeholder="Acme Corporation"
                autoComplete="organization"
                inputMode="text"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Job Title"
                {...register('jobTitle')}
                error={errors.jobTitle?.message}
                placeholder="Marketing Director"
                autoComplete="organization-title"
                inputMode="text"
              />
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-charcoal mb-1.5 sm:mb-2">
                  Estimated Number of Recipients *
                </label>
                <select
                  {...register('estimatedRecipients')}
                  className={`
                    w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm sm:text-base
                    ${errors.estimatedRecipients
                      ? 'border-error-red focus:border-error-red focus:ring-error-red'
                      : 'border-light-brown/30 focus:border-primary-brown focus:ring-primary-brown'
                    }
                    bg-white text-charcoal
                    focus:outline-none focus:ring-2 focus:ring-offset-1
                    transition-all duration-200
                    min-h-[44px]
                  `}
                  required
                >
                  <option value="">Select range...</option>
                  <option value="1-25">1-25 recipients</option>
                  <option value="26-50">26-50 recipients</option>
                  <option value="51-100">51-100 recipients</option>
                  <option value="101-250">101-250 recipients</option>
                  <option value="251-500">251-500 recipients</option>
                  <option value="500+">500+ recipients</option>
                </select>
                {errors.estimatedRecipients && (
                  <p className="mt-1 text-xs sm:text-sm text-error-red" role="alert">
                    {errors.estimatedRecipients.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-charcoal mb-1.5 sm:mb-2">
                  Budget Range *
                </label>
                <select
                  {...register('budgetRange')}
                  className={`
                    w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm sm:text-base
                    ${errors.budgetRange
                      ? 'border-error-red focus:border-error-red focus:ring-error-red'
                      : 'border-light-brown/30 focus:border-primary-brown focus:ring-primary-brown'
                    }
                    bg-white text-charcoal
                    focus:outline-none focus:ring-2 focus:ring-offset-1
                    transition-all duration-200
                    min-h-[44px]
                  `}
                  required
                >
                  <option value="">Select budget range...</option>
                  <option value="$15-$25">$15 - $25 per gift (Bronze)</option>
                  <option value="$35-$50">$35 - $50 per gift (Silver)</option>
                  <option value="$75-$100">$75 - $100 per gift (Gold)</option>
                  <option value="$150-$250">$150 - $250 per gift (Platinum)</option>
                  <option value="custom">Custom budget</option>
                </select>
                {errors.budgetRange && (
                  <p className="mt-1 text-xs sm:text-sm text-error-red" role="alert">
                    {errors.budgetRange.message}
                  </p>
                )}
              </div>
              <Input
                label="Event Date (if applicable)"
                type="date"
                {...register('eventDate')}
                error={errors.eventDate?.message}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-charcoal mb-1.5 sm:mb-2">
                Message / Additional Details *
              </label>
              <textarea
                {...register('message')}
                rows={5}
                className={`
                  w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 text-sm sm:text-base
                  ${errors.message
                    ? 'border-error-red focus:border-error-red focus:ring-error-red'
                    : 'border-light-brown/30 focus:border-primary-brown focus:ring-primary-brown'
                  }
                  bg-white text-charcoal
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                  transition-all duration-200
                  resize-y
                `}
                placeholder="Tell us about your corporate gifting needs, special requirements, or any questions you have..."
                required
              />
              {errors.message && (
                <p className="mt-1 text-xs sm:text-sm text-error-red" role="alert">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="pt-2 sm:pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-charcoal/60 text-center">
              * Required fields
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
