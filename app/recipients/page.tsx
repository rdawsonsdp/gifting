'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import { Recipient, DeliveryMethod as DeliveryMethodType } from '@/lib/types';
import { calculateOrderTotal, getDeliveryTierInfo } from '@/lib/pricing';
import { removeDuplicates, findDuplicates, areRecipientsDuplicate } from '@/lib/csv-utils';
import CSVUploader from '@/components/recipients/CSVUploader';
import RecipientTable from '@/components/recipients/RecipientTable';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';

type DeliveryMethod = 'one-location' | 'usps' | 'ups-ground' | 'ups-2day' | null;

interface ShippingRate {
  id: string;
  name: string;
  price: number;
  currency: string;
  estimatedDays?: string;
}

const DEFAULT_DELIVERY_OPTIONS = [
  {
    id: 'one-location' as DeliveryMethod,
    name: 'One-Location Delivery',
    description: 'All gifts delivered to a single address',
    icon: '🏢',
    price: 0,
    estimatedDays: '3-5 business days',
  },
  {
    id: 'usps' as DeliveryMethod,
    name: 'USPS',
    description: 'Standard postal shipping to multiple addresses',
    icon: '📬',
    price: 8.99,
    estimatedDays: '5-7 business days',
  },
  {
    id: 'ups-ground' as DeliveryMethod,
    name: 'UPS Ground',
    description: 'Ground shipping to multiple addresses',
    icon: '📦',
    price: 12.99,
    estimatedDays: '3-5 business days',
  },
  {
    id: 'ups-2day' as DeliveryMethod,
    name: 'UPS 2nd Day Air',
    description: 'Express shipping to multiple addresses',
    icon: '✈️',
    price: 24.99,
    estimatedDays: '2 business days',
  },
];

export default function RecipientsPage() {
  const router = useRouter();
  const { state, dispatch, getCurrentTotal } = useGift();
  const [recipients, setRecipients] = useState<Recipient[]>(state.recipients);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);

  // Delivery address form state
  const [deliveryForm, setDeliveryForm] = useState({
    companyName: '',
    contactName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    quantity: 1,
    giftMessage: '',
  });

  // Customer address form state
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    contactName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
  });

  // Same as delivery address checkbox
  const [sameAsDelivery, setSameAsDelivery] = useState(false);

  // Legacy alias for backward compatibility
  const oneLocationForm = deliveryForm;

  // Fetch shipping rates on mount
  useEffect(() => {
    async function fetchShippingRates() {
      try {
        const response = await fetch('/api/shipping-rates');
        if (response.ok) {
          const data = await response.json();
          if (data.rates && data.rates.length > 0) {
            setShippingRates(data.rates);
          }
        }
      } catch (error) {
        console.error('Error fetching shipping rates:', error);
      } finally {
        setLoadingRates(false);
      }
    }

    fetchShippingRates();
  }, []);

  // Merge fetched rates with default options
  const deliveryOptions = DEFAULT_DELIVERY_OPTIONS.map((option) => {
    const fetchedRate = shippingRates.find((r) => r.id === option.id);
    return {
      ...option,
      price: fetchedRate?.price ?? option.price,
      estimatedDays: fetchedRate?.estimatedDays ?? option.estimatedDays,
    };
  });

  // Get the current selected shipping rate
  const selectedShippingRate = deliveryOptions.find((o) => o.id === deliveryMethod);

  // Check if we have a valid order (either package or tier with products)
  const hasValidOrder = state.selectedPackage || (state.selectedTier && state.selectedProducts.length > 0);

  // Calculate gift total based on package or custom build
  const giftTotal = state.selectedPackage
    ? state.selectedPackage.price
    : getCurrentTotal();

  const recipientCount = deliveryMethod === 'one-location'
    ? oneLocationForm.quantity
    : recipients.length;

  const validRecipients = recipients.filter(r => r.isValid);

  // Validate email format
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate phone (at least 10 digits)
  const isValidPhone = (phone: string) => phone.replace(/\D/g, '').length >= 10;

  // Check if customer form is valid (all fields required)
  const isCustomerFormValid =
    customerForm.contactName.trim() !== '' &&
    customerForm.companyName.trim() !== '' &&
    customerForm.address1.trim() !== '' &&
    customerForm.city.trim() !== '' &&
    customerForm.state.trim() !== '' &&
    customerForm.zip.trim() !== '' &&
    customerForm.phone.trim() !== '' &&
    isValidPhone(customerForm.phone) &&
    customerForm.email.trim() !== '' &&
    isValidEmail(customerForm.email);

  // Check if delivery form is valid (for one-location delivery - all fields required)
  const isDeliveryFormValid =
    deliveryForm.companyName.trim() !== '' &&
    deliveryForm.contactName.trim() !== '' &&
    deliveryForm.address1.trim() !== '' &&
    deliveryForm.city.trim() !== '' &&
    deliveryForm.state.trim() !== '' &&
    deliveryForm.zip.trim() !== '' &&
    deliveryForm.phone.trim() !== '' &&
    isValidPhone(deliveryForm.phone) &&
    deliveryForm.email.trim() !== '' &&
    isValidEmail(deliveryForm.email);

  const canProceed = deliveryMethod === 'one-location'
    ? isDeliveryFormValid && isCustomerFormValid
    : validRecipients.length > 0 && validRecipients.length === recipients.length && isCustomerFormValid;

  // Pass products for per-item shipping calculation
  const pricing = calculateOrderTotal(giftTotal, recipientCount, state.selectedProducts);

  // Calculate shipping costs
  const shippingPerRecipient = selectedShippingRate?.price ?? 0;
  const totalShipping = deliveryMethod === 'one-location'
    ? shippingPerRecipient // Flat rate for one-location
    : shippingPerRecipient * recipientCount; // Per recipient for shipping methods

  const grandTotal = pricing.total + totalShipping;

  const handleUpload = (newRecipients: Recipient[]) => {
    setError(null);
    setWarning(null);

    // Check for duplicates within the uploaded file
    const duplicatesInFile = findDuplicates(newRecipients);
    const duplicateCount = Array.from(duplicatesInFile.values()).reduce((sum, group) => sum + group.length - 1, 0);

    if (duplicateCount > 0) {
      setWarning(`Found ${duplicateCount} duplicate recipient(s) in the uploaded file. Duplicates will be removed.`);
      newRecipients = removeDuplicates(newRecipients);
    }

    // Check for duplicates against existing recipients
    if (recipients.length > 0) {
      const existingDuplicates: Recipient[] = [];
      const uniqueNewRecipients: Recipient[] = [];

      newRecipients.forEach(newRecipient => {
        const isDuplicate = recipients.some(existing => areRecipientsDuplicate(existing, newRecipient));
        if (isDuplicate) {
          existingDuplicates.push(newRecipient);
        } else {
          uniqueNewRecipients.push(newRecipient);
        }
      });

      if (existingDuplicates.length > 0) {
        const duplicateNames = existingDuplicates
          .slice(0, 3)
          .map(r => `${r.firstName} ${r.lastName}`)
          .join(', ');
        const moreText = existingDuplicates.length > 3 ? ` and ${existingDuplicates.length - 3} more` : '';
        setWarning(
          `Found ${existingDuplicates.length} duplicate recipient(s) that already exist: ${duplicateNames}${moreText}. These will not be added.`
        );
      }

      const mergedRecipients = [...recipients, ...uniqueNewRecipients];
      setRecipients(mergedRecipients);
      dispatch({ type: 'SET_RECIPIENTS', payload: mergedRecipients });
    } else {
      setRecipients(newRecipients);
      dispatch({ type: 'SET_RECIPIENTS', payload: newRecipients });
    }
  };

  const handleUpdate = (updatedRecipients: Recipient[]) => {
    setRecipients(updatedRecipients);
    dispatch({ type: 'SET_RECIPIENTS', payload: updatedRecipients });
  };

  const handleContinue = () => {
    if (deliveryMethod === 'one-location' && canProceed) {
      // Create a single recipient from the delivery form
      const singleRecipient: Recipient = {
        id: 'one-location-1',
        firstName: deliveryForm.contactName.split(' ')[0] || 'Contact',
        lastName: deliveryForm.contactName.split(' ').slice(1).join(' ') || '',
        company: deliveryForm.companyName,
        address1: deliveryForm.address1,
        address2: deliveryForm.address2,
        city: deliveryForm.city,
        state: deliveryForm.state,
        zip: deliveryForm.zip,
        phone: deliveryForm.phone,
        email: deliveryForm.email,
        giftMessage: deliveryForm.giftMessage,
        isValid: true,
        errors: [],
      };

      // Create array with quantity of recipients (all same address)
      const recipientsArray = Array(deliveryForm.quantity).fill(null).map((_, i) => ({
        ...singleRecipient,
        id: `one-location-${i + 1}`,
      }));

      dispatch({ type: 'SET_RECIPIENTS', payload: recipientsArray });

      // Store delivery method
      if (selectedShippingRate) {
        const deliveryMethodData: DeliveryMethodType = {
          id: selectedShippingRate.id as DeliveryMethodType['id'],
          name: selectedShippingRate.name,
          price: selectedShippingRate.price,
          estimatedDays: selectedShippingRate.estimatedDays,
        };
        dispatch({ type: 'SET_DELIVERY_METHOD', payload: deliveryMethodData });
      }

      // Store customer info for later use
      const buyerInfo = {
        name: customerForm.contactName,
        email: customerForm.email,
        phone: customerForm.phone,
        company: customerForm.companyName,
        deliveryDate: '',
      };
      dispatch({ type: 'SET_BUYER_INFO', payload: buyerInfo });

      router.push('/review');
    } else if (canProceed) {
      // Store delivery method for shipping methods
      if (selectedShippingRate) {
        const deliveryMethodData: DeliveryMethodType = {
          id: selectedShippingRate.id as DeliveryMethodType['id'],
          name: selectedShippingRate.name,
          price: selectedShippingRate.price,
          estimatedDays: selectedShippingRate.estimatedDays,
        };
        dispatch({ type: 'SET_DELIVERY_METHOD', payload: deliveryMethodData });
      }

      // Store customer info for shipping methods
      const buyerInfo = {
        name: customerForm.contactName,
        email: customerForm.email,
        phone: customerForm.phone,
        company: customerForm.companyName,
        deliveryDate: '',
      };
      dispatch({ type: 'SET_BUYER_INFO', payload: buyerInfo });

      router.push('/review');
    }
  };

  const handleDeliveryChange = (field: string, value: string | number) => {
    setDeliveryForm(prev => ({ ...prev, [field]: value }));
    // If same as delivery is checked, also update customer form (except quantity and giftMessage)
    if (sameAsDelivery && field !== 'quantity' && field !== 'giftMessage') {
      setCustomerForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCustomerChange = (field: string, value: string) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSameAsDeliveryChange = (checked: boolean) => {
    setSameAsDelivery(checked);
    if (checked) {
      // Copy delivery address to customer address
      setCustomerForm({
        companyName: deliveryForm.companyName,
        contactName: deliveryForm.contactName,
        address1: deliveryForm.address1,
        address2: deliveryForm.address2,
        city: deliveryForm.city,
        state: deliveryForm.state,
        zip: deliveryForm.zip,
        phone: deliveryForm.phone,
        email: deliveryForm.email,
      });
    }
  };

  // Legacy alias for backward compatibility
  const handleOneLocationChange = handleDeliveryChange;

  if (!hasValidOrder) {
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

  const isShippingMethod = deliveryMethod && deliveryMethod !== 'one-location';

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        {state.selectedPackage ? (
          <Badge variant="gold" className="mb-3 sm:mb-4">
            {state.selectedPackage.name}
          </Badge>
        ) : state.selectedTier && (
          <Badge variant={state.selectedTier.id as 'bronze' | 'silver' | 'gold' | 'platinum'} className="mb-3 sm:mb-4">
            {state.selectedTier.name} Tier
          </Badge>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown mb-2 font-display">
          Delivery Options
        </h1>
        <p className="text-sm sm:text-base text-charcoal/70">
          Choose how you'd like your gifts delivered
        </p>
      </div>

      {/* Delivery Method Selection */}
      <Card className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-4 font-display">
          Select Delivery Method
        </h2>
        {loadingRates ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-light-brown/20 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {deliveryOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setDeliveryMethod(option.id);
                  setError(null);
                  setWarning(null);
                  if (option.id === 'one-location') {
                    setRecipients([]);
                  }
                }}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${deliveryMethod === option.id
                    ? 'border-primary-brown bg-primary-brown/5 shadow-md'
                    : 'border-light-brown/30 hover:border-primary-brown/50 hover:bg-cream/50'
                  }
                `}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <h3 className="font-semibold text-primary-brown text-sm sm:text-base">
                  {option.name}
                </h3>
                <p className="text-xs text-charcoal/60 mt-1">
                  {option.description}
                </p>
                <div className="mt-3 pt-3 border-t border-light-brown/20">
                  <p className="text-sm font-bold text-primary-brown">
                    {option.price === 0 ? (
                      'Free'
                    ) : option.id === 'one-location' ? (
                      `$${option.price.toFixed(2)}`
                    ) : (
                      `$${option.price.toFixed(2)}/recipient`
                    )}
                  </p>
                  {option.estimatedDays && (
                    <p className="text-xs text-charcoal/50 mt-0.5">
                      Est. {option.estimatedDays}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Number of Recipients for One-Location */}
      {deliveryMethod === 'one-location' && (
        <Card className="mb-6 sm:mb-8 animate-fade-up">
          <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-4 font-display">
            Number of Recipients
          </h2>
          <p className="text-sm text-charcoal/70 mb-4">
            How many gift packages would you like delivered to this location?
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-primary-brown/30 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => handleOneLocationChange('quantity', Math.max(1, oneLocationForm.quantity - 10))}
                className="px-3 py-3 hover:bg-cream transition-colors text-primary-brown font-medium text-sm border-r border-primary-brown/20"
              >
                −10
              </button>
              <button
                onClick={() => handleOneLocationChange('quantity', Math.max(1, oneLocationForm.quantity - 1))}
                className="px-4 py-3 hover:bg-cream transition-colors text-primary-brown font-bold text-lg border-r border-primary-brown/20"
              >
                −
              </button>
              <input
                type="number"
                value={oneLocationForm.quantity}
                onChange={(e) => handleOneLocationChange('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 py-3 font-bold text-primary-brown text-center text-lg focus:outline-none"
                min={1}
              />
              <button
                onClick={() => handleOneLocationChange('quantity', oneLocationForm.quantity + 1)}
                className="px-4 py-3 hover:bg-cream transition-colors text-primary-brown font-bold text-lg border-l border-primary-brown/20"
              >
                +
              </button>
              <button
                onClick={() => handleOneLocationChange('quantity', oneLocationForm.quantity + 10)}
                className="px-3 py-3 hover:bg-cream transition-colors text-primary-brown font-medium text-sm border-l border-primary-brown/20"
              >
                +10
              </button>
            </div>
            <span className="text-sm text-charcoal/70">
              {oneLocationForm.quantity === 1 ? 'gift package' : 'gift packages'}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[10, 25, 50, 100, 250, 500].map((preset) => (
              <button
                key={preset}
                onClick={() => handleOneLocationChange('quantity', preset)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  oneLocationForm.quantity === preset
                    ? 'bg-primary-brown text-white'
                    : 'bg-cream text-primary-brown hover:bg-primary-brown/10'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Delivery Address Form (for one-location delivery) */}
      {deliveryMethod === 'one-location' && (
        <Card className="mb-6 sm:mb-8 animate-fade-up">
          <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-4 font-display">
            Delivery Address
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={deliveryForm.companyName}
                onChange={(e) => handleDeliveryChange('companyName', e.target.value)}
                className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                value={deliveryForm.contactName}
                onChange={(e) => handleDeliveryChange('contactName', e.target.value)}
                className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                placeholder="Contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={deliveryForm.phone}
                onChange={(e) => handleDeliveryChange('phone', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  deliveryForm.phone && !isValidPhone(deliveryForm.phone) ? 'border-red-400' : 'border-light-brown/30'
                }`}
                placeholder="(555) 555-5555"
              />
              {deliveryForm.phone && !isValidPhone(deliveryForm.phone) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid phone number</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={deliveryForm.email}
                onChange={(e) => handleDeliveryChange('email', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  deliveryForm.email && !isValidEmail(deliveryForm.email) ? 'border-red-400' : 'border-light-brown/30'
                }`}
                placeholder="email@company.com"
              />
              {deliveryForm.email && !isValidEmail(deliveryForm.email) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={deliveryForm.address1}
                onChange={(e) => handleDeliveryChange('address1', e.target.value)}
                className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                placeholder="Street address"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={deliveryForm.address2}
                onChange={(e) => handleDeliveryChange('address2', e.target.value)}
                className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                placeholder="Suite, floor, etc. (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                City *
              </label>
              <input
                type="text"
                value={deliveryForm.city}
                onChange={(e) => handleDeliveryChange('city', e.target.value)}
                className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                placeholder="City"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={deliveryForm.state}
                  onChange={(e) => handleDeliveryChange('state', e.target.value.toUpperCase().slice(0, 2))}
                  className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                  placeholder="IL"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={deliveryForm.zip}
                  onChange={(e) => handleDeliveryChange('zip', e.target.value)}
                  className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                  placeholder="60601"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Gift Message (optional)
              </label>
              <textarea
                value={deliveryForm.giftMessage}
                onChange={(e) => handleDeliveryChange('giftMessage', e.target.value)}
                className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                rows={3}
                placeholder="Add a personalized message (max 200 characters)"
                maxLength={200}
              />
              <p className="text-xs text-charcoal/50 mt-1">
                {deliveryForm.giftMessage.length}/200 characters
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Customer/Billing Address Form */}
      {deliveryMethod && (
        <Card className="mb-6 sm:mb-8 animate-fade-up">
          <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-4 font-display">
            Customer Information
          </h2>
          <p className="text-sm text-charcoal/70 mb-4">
            Your contact and billing information
          </p>

          {/* Copy from delivery address checkbox (only for one-location) */}
          {deliveryMethod === 'one-location' && (
            <div className="mb-4 pb-4 border-b border-light-brown/30">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsDelivery}
                  onChange={(e) => handleSameAsDeliveryChange(e.target.checked)}
                  className="w-5 h-5 text-primary-brown border-light-brown/30 rounded focus:ring-primary-brown/30"
                />
                <span className="text-sm text-charcoal/70">
                  Same as delivery address
                </span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerForm.contactName}
                onChange={(e) => handleCustomerChange('contactName', e.target.value)}
                disabled={sameAsDelivery}
                className={`w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={customerForm.companyName}
                onChange={(e) => handleCustomerChange('companyName', e.target.value)}
                disabled={sameAsDelivery}
                className={`w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerForm.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                disabled={sameAsDelivery}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${customerForm.phone && !isValidPhone(customerForm.phone) ? 'border-red-400' : 'border-light-brown/30'}`}
                placeholder="(555) 555-5555"
              />
              {customerForm.phone && !isValidPhone(customerForm.phone) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid phone number</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
                disabled={sameAsDelivery}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${customerForm.email && !isValidEmail(customerForm.email) ? 'border-red-400' : 'border-light-brown/30'}`}
                placeholder="email@company.com"
              />
              {customerForm.email && !isValidEmail(customerForm.email) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={customerForm.address1}
                onChange={(e) => handleCustomerChange('address1', e.target.value)}
                disabled={sameAsDelivery}
                className={`w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Street address"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={customerForm.address2}
                onChange={(e) => handleCustomerChange('address2', e.target.value)}
                disabled={sameAsDelivery}
                className={`w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Suite, floor, etc. (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1">
                City *
              </label>
              <input
                type="text"
                value={customerForm.city}
                onChange={(e) => handleCustomerChange('city', e.target.value)}
                disabled={sameAsDelivery}
                className={`w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                  sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="City"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={customerForm.state}
                  onChange={(e) => handleCustomerChange('state', e.target.value.toUpperCase().slice(0, 2))}
                  disabled={sameAsDelivery}
                  className={`w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                    sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="IL"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={customerForm.zip}
                  onChange={(e) => handleCustomerChange('zip', e.target.value)}
                  disabled={sameAsDelivery}
                  className={`w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
                    sameAsDelivery ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="60601"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* File Upload for Shipping Methods */}
      {isShippingMethod && (
        <div className="mb-8 animate-fade-up">
          <CSVUploader
            onUpload={handleUpload}
            onError={setError}
            onReset={() => {
              setRecipients([]);
              dispatch({ type: 'SET_RECIPIENTS', payload: [] });
              setWarning(null);
            }}
            hasRecipients={recipients.length > 0}
          />
          {error && (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          )}
          {warning && (
            <Alert variant="info" className="mt-4">
              {warning}
            </Alert>
          )}
        </div>
      )}

      {/* Recipient Table for Shipping Methods */}
      {isShippingMethod && recipients.length > 0 && (
        <div className="mb-8">
          <RecipientTable recipients={recipients} onUpdate={handleUpdate} />
        </div>
      )}

      {/* Order Summary */}
      {deliveryMethod && (
        <Card className="mb-6 sm:mb-8 animate-fade-up">
          <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-3 sm:mb-4 font-display">
            Order Summary
          </h2>
          <div className="space-y-2">
            {state.selectedPackage ? (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="truncate pr-2">{state.selectedPackage.name}</span>
                <span className="font-semibold whitespace-nowrap">${state.selectedPackage.price.toFixed(2)}</span>
              </div>
            ) : (
              state.selectedProducts.map((sp) => (
                <div key={sp.product.id} className="flex justify-between text-xs sm:text-sm">
                  <span className="truncate pr-2">{sp.product.title} × {sp.quantity}</span>
                  <span className="font-semibold whitespace-nowrap">${(sp.product.price * sp.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
            <div className="border-t border-light-brown/30 pt-2 mt-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Delivery Method:</span>
                <span className="font-medium">{selectedShippingRate?.name}</span>
              </div>
              {selectedShippingRate?.estimatedDays && (
                <div className="flex justify-between text-xs text-charcoal/60 mt-1">
                  <span>Estimated Delivery:</span>
                  <span>{selectedShippingRate.estimatedDays}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Pricing Summary */}
      {deliveryMethod && recipientCount > 0 && (
        <Card className="mb-6 sm:mb-8 animate-fade-up">
          <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-3 sm:mb-4 font-display">
            Pricing Summary
          </h2>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span>Gift cost per recipient:</span>
              <span className="whitespace-nowrap">${giftTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of recipients:</span>
              <span className="whitespace-nowrap">{recipientCount}</span>
            </div>
            <div className="border-t border-light-brown/30 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-xs sm:text-sm">
                <span className="pr-2">Gift Subtotal ({recipientCount} × ${giftTotal.toFixed(2)}):</span>
                <span className="whitespace-nowrap">${pricing.giftSubtotal.toFixed(2)}</span>
              </div>
              {deliveryMethod === 'one-location' && (
                <div className="flex justify-between font-semibold text-xs sm:text-sm mt-1">
                  <span className="pr-2">
                    Delivery Fee ({recipientCount < 500 ? '< 500' : recipientCount < 1500 ? '500-1,499' : '1,500+'} recipients):
                  </span>
                  <span className="whitespace-nowrap">${pricing.fulfillmentSubtotal.toFixed(2)}</span>
                </div>
              )}
              {deliveryMethod !== 'one-location' && (
                <div className="flex justify-between font-semibold text-xs sm:text-sm mt-1">
                  <span className="pr-2">
                    Shipping ({selectedShippingRate?.name} × {recipientCount}):
                  </span>
                  <span className="whitespace-nowrap">${totalShipping.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base sm:text-lg text-primary-brown mt-3 pt-2 border-t border-light-brown/30">
                <span>Estimated Total:</span>
                <span className="whitespace-nowrap">${(deliveryMethod === 'one-location' ? pricing.total : pricing.giftSubtotal + totalShipping).toFixed(2)}</span>
              </div>
              <p className="text-xs text-charcoal/50 mt-2">
                * Final shipping costs will be calculated at checkout based on destination
              </p>
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
          disabled={!deliveryMethod || !canProceed}
          className="w-full sm:min-w-[200px]"
        >
          {!deliveryMethod
            ? 'Select Delivery Method'
            : deliveryMethod === 'one-location'
              ? canProceed ? 'Continue to Review' : 'Complete Address'
              : canProceed
                ? 'Continue to Review'
                : recipients.length === 0
                  ? 'Upload Recipient List'
                  : `Fix ${recipients.length - validRecipients.length} Invalid`
          }
        </Button>
      </div>
    </div>
  );
}
