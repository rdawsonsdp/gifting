'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import { Recipient, DeliveryMethod as DeliveryMethodType } from '@/lib/types';
import { removeDuplicates, findDuplicates, areRecipientsDuplicate } from '@/lib/csv-utils';
import CSVUploader from '@/components/recipients/CSVUploader';
import RecipientTable from '@/components/recipients/RecipientTable';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';

const FACTORY_ADDRESS = '7637 S. Western Ave, Chicago, IL';

type DeliveryOptionId = 'factory-pickup' | 'individual' | 'local-delivery' | 'heavy-order';
type ShippingSubOption = 'ups-ground' | 'ups-2day' | 'local';

const DELIVERY_OPTIONS: {
  id: DeliveryOptionId;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: 'factory-pickup',
    name: 'Factory Pickup',
    description: 'Pick up your gifts at our factory location',
    icon: '🏭',
  },
  {
    id: 'individual',
    name: 'Individual Deliveries',
    description: 'Ship gifts to multiple addresses via UPS',
    icon: '📦',
  },
  {
    id: 'local-delivery',
    name: 'Local Delivery',
    description: 'Delivery within 25 miles of our factory',
    icon: '🚛',
  },
  {
    id: 'heavy-order',
    name: 'Over 250 lbs — Call Us',
    description: 'For large orders, contact our team directly',
    icon: '📞',
  },
];

const SHIPPING_RATES: Record<ShippingSubOption, { name: string; price: number; estimatedDays: string }> = {
  'ups-ground': { name: 'UPS Ground', price: 12.99, estimatedDays: '3-5 business days' },
  'ups-2day': { name: 'UPS 2nd Day Air', price: 24.99, estimatedDays: '2 business days' },
  'local': { name: 'Local Delivery', price: 8.99, estimatedDays: '1-2 business days' },
};

export default function RecipientsPage() {
  const router = useRouter();
  const { state, dispatch, getCurrentTotal } = useGift();
  const [recipients, setRecipients] = useState<Recipient[]>(state.recipients);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Delivery option selection
  const [selectedOption, setSelectedOption] = useState<DeliveryOptionId | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingSubOption | null>(null);

  // Use planned recipient count from global state
  const quantity = state.plannedRecipientCount;
  const setQuantity = (q: number) => dispatch({ type: 'SET_RECIPIENT_COUNT', payload: q });

  // Local delivery address + distance check
  const [localAddress, setLocalAddress] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [distanceResult, setDistanceResult] = useState<{
    distanceMiles: number | null;
    durationText: string | null;
    withinRange: boolean;
    warning?: string;
  } | null>(null);
  const [checkingDistance, setCheckingDistance] = useState(false);

  // Customer info form
  const [customerForm, setCustomerForm] = useState({
    contactName: '',
    companyName: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  });

  // Check if we have a valid order
  const hasValidOrder = state.selectedPackage || state.selectedProducts.length > 0;

  // Gift total
  const giftTotal = state.selectedPackage
    ? state.selectedPackage.price
    : getCurrentTotal();

  // Weight estimation: 1 lb per product unit
  const weightPerRecipient = state.selectedProducts.reduce(
    (sum, sp) => sum + sp.quantity,
    0
  ) || (state.selectedPackage ? 1 : 0);

  const recipientCount =
    selectedOption === 'factory-pickup' || selectedOption === 'local-delivery'
      ? quantity
      : recipients.length;

  const totalWeight = weightPerRecipient * recipientCount;

  // Validation helpers
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => phone.replace(/\D/g, '').length >= 10;

  const isCustomerFormValid =
    customerForm.contactName.trim() !== '' &&
    customerForm.companyName.trim() !== '' &&
    customerForm.phone.trim() !== '' &&
    isValidPhone(customerForm.phone) &&
    customerForm.email.trim() !== '' &&
    isValidEmail(customerForm.email) &&
    customerForm.address1.trim() !== '' &&
    customerForm.city.trim() !== '' &&
    customerForm.state.trim() !== '' &&
    customerForm.zip.trim() !== '';

  const isLocalAddressComplete =
    localAddress.address1.trim() !== '' &&
    localAddress.city.trim() !== '' &&
    localAddress.state.trim() !== '' &&
    localAddress.zip.trim() !== '';

  const validRecipients = recipients.filter((r) => r.isValid);

  // Can proceed logic per option
  const canProceed = (() => {
    if (!selectedOption || selectedOption === 'heavy-order') return false;
    if (!isCustomerFormValid) return false;

    if (selectedOption === 'factory-pickup') {
      return quantity > 0;
    }

    if (selectedOption === 'individual') {
      return (
        shippingMethod !== null &&
        validRecipients.length > 0 &&
        validRecipients.length === recipients.length
      );
    }

    if (selectedOption === 'local-delivery') {
      return (
        isLocalAddressComplete &&
        distanceResult?.withinRange === true &&
        shippingMethod !== null &&
        quantity > 0
      );
    }

    return false;
  })();

  // Shipping cost calculation
  const shippingPerRecipient = shippingMethod ? SHIPPING_RATES[shippingMethod].price : 0;
  const totalShipping = selectedOption === 'factory-pickup'
    ? 0
    : shippingPerRecipient * recipientCount;

  const giftSubtotal = giftTotal * recipientCount;
  const grandTotal = giftSubtotal + totalShipping;

  // --- Handlers ---

  const handleOptionSelect = (id: DeliveryOptionId) => {
    setSelectedOption(id);
    setShippingMethod(null);
    setError(null);
    setWarning(null);
    setDistanceResult(null);
    if (id === 'factory-pickup' || id === 'local-delivery') {
      setRecipients([]);
    }
  };

  const handleCheckDistance = async () => {
    if (!isLocalAddressComplete) return;
    setCheckingDistance(true);
    setDistanceResult(null);
    try {
      const fullAddress = [
        localAddress.address1,
        localAddress.address2,
        localAddress.city,
        localAddress.state,
        localAddress.zip,
      ]
        .filter(Boolean)
        .join(', ');

      const response = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: fullAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to check distance');
        return;
      }

      setDistanceResult(data);
      if (!data.withinRange && data.distanceMiles !== null) {
        setError(
          `This address is ${data.distanceMiles} miles from our factory — outside our 25-mile local delivery range. Please choose Individual Deliveries or Factory Pickup instead.`
        );
      } else {
        setError(null);
      }
    } catch {
      setError('Failed to check distance. Please try again.');
    } finally {
      setCheckingDistance(false);
    }
  };

  const handleUpload = (newRecipients: Recipient[]) => {
    setError(null);
    setWarning(null);

    const duplicatesInFile = findDuplicates(newRecipients);
    const duplicateCount = Array.from(duplicatesInFile.values()).reduce(
      (sum, group) => sum + group.length - 1,
      0
    );

    if (duplicateCount > 0) {
      setWarning(
        `Found ${duplicateCount} duplicate recipient(s) in the uploaded file. Duplicates will be removed.`
      );
      newRecipients = removeDuplicates(newRecipients);
    }

    if (recipients.length > 0) {
      const existingDuplicates: Recipient[] = [];
      const uniqueNewRecipients: Recipient[] = [];

      newRecipients.forEach((newRecipient) => {
        const isDuplicate = recipients.some((existing) =>
          areRecipientsDuplicate(existing, newRecipient)
        );
        if (isDuplicate) {
          existingDuplicates.push(newRecipient);
        } else {
          uniqueNewRecipients.push(newRecipient);
        }
      });

      if (existingDuplicates.length > 0) {
        const duplicateNames = existingDuplicates
          .slice(0, 3)
          .map((r) => `${r.firstName} ${r.lastName}`)
          .join(', ');
        const moreText =
          existingDuplicates.length > 3
            ? ` and ${existingDuplicates.length - 3} more`
            : '';
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
    if (!canProceed || !selectedOption) return;

    // Build delivery method for state
    const deliveryMethodData: DeliveryMethodType = {
      id: selectedOption,
      name: DELIVERY_OPTIONS.find((o) => o.id === selectedOption)!.name,
      price: selectedOption === 'factory-pickup' ? 0 : shippingPerRecipient,
      estimatedDays: shippingMethod
        ? SHIPPING_RATES[shippingMethod].estimatedDays
        : undefined,
      shippingMethod: shippingMethod || undefined,
    };
    dispatch({ type: 'SET_DELIVERY_METHOD', payload: deliveryMethodData });

    // Build recipients for factory-pickup and local-delivery
    if (selectedOption === 'factory-pickup') {
      const factoryRecipients = Array(quantity)
        .fill(null)
        .map((_, i) => ({
          id: `factory-${i + 1}`,
          firstName: customerForm.contactName.split(' ')[0] || 'Pickup',
          lastName: customerForm.contactName.split(' ').slice(1).join(' ') || '',
          company: customerForm.companyName,
          address1: FACTORY_ADDRESS,
          city: 'Chicago',
          state: 'IL',
          zip: '60620',
          phone: customerForm.phone,
          email: customerForm.email,
          isValid: true,
          errors: [],
        }));
      dispatch({ type: 'SET_RECIPIENTS', payload: factoryRecipients });
    }

    if (selectedOption === 'local-delivery') {
      const localRecipients = Array(quantity)
        .fill(null)
        .map((_, i) => ({
          id: `local-${i + 1}`,
          firstName: customerForm.contactName.split(' ')[0] || 'Contact',
          lastName: customerForm.contactName.split(' ').slice(1).join(' ') || '',
          company: customerForm.companyName,
          address1: localAddress.address1,
          address2: localAddress.address2,
          city: localAddress.city,
          state: localAddress.state,
          zip: localAddress.zip,
          phone: customerForm.phone,
          email: customerForm.email,
          isValid: true,
          errors: [],
        }));
      dispatch({ type: 'SET_RECIPIENTS', payload: localRecipients });
    }

    // Store buyer info
    const buyerInfo = {
      name: customerForm.contactName,
      email: customerForm.email,
      phone: customerForm.phone,
      company: customerForm.companyName,
      deliveryDate: '',
    };
    dispatch({ type: 'SET_BUYER_INFO', payload: buyerInfo });

    router.push('/review');
  };

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

  // Available shipping sub-options per delivery option
  const shippingSubOptions: ShippingSubOption[] =
    selectedOption === 'individual'
      ? ['ups-ground', 'ups-2day']
      : selectedOption === 'local-delivery'
        ? ['ups-ground', 'ups-2day', 'local']
        : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {state.selectedPackage ? (
          <Badge variant="gold" className="mb-3 sm:mb-4">
            {state.selectedPackage.name}
          </Badge>
        ) : (
          state.selectedTier && (
            <Badge
              variant={
                state.selectedTier.id as 'bronze' | 'silver' | 'gold' | 'platinum'
              }
              className="mb-3 sm:mb-4"
            >
              {state.selectedTier.name} Tier
            </Badge>
          )
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-brown mb-2 font-display">
          Delivery Options
        </h1>
        <p className="text-sm sm:text-base text-charcoal/70">
          Choose how you&apos;d like your gifts delivered
        </p>
      </div>

      {/* Recipient Count Display - Only show for Factory Pickup and Local Delivery */}
      {(selectedOption === 'factory-pickup' || selectedOption === 'local-delivery' || !selectedOption) && (
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-primary-brown/5 to-accent-gold/10 border-2 border-primary-brown/20 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-brown font-display">
                <span className="text-3xl sm:text-4xl">{quantity}</span> Recipients Selected
              </h2>
              <p className="text-sm text-charcoal/60 mt-1">
                Gift packages to deliver
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-sm font-medium text-primary-brown hover:text-accent-gold transition-colors underline underline-offset-2"
            >
              Edit in Cart
            </button>
          </div>
        </div>
      )}

      {/* Recipient Count Display - For Individual Deliveries (shows uploaded count) */}
      {selectedOption === 'individual' && (
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-primary-brown/5 to-accent-gold/10 border-2 border-primary-brown/20 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-brown font-display">
                {recipients.length > 0 ? (
                  <>
                    <span className="text-3xl sm:text-4xl">{recipients.length}</span> Recipients Uploaded
                  </>
                ) : (
                  <span className="text-charcoal/40">No Recipients Yet</span>
                )}
              </h2>
              <p className="text-sm text-charcoal/60 mt-1">
                {recipients.length > 0
                  ? 'Addresses ready for delivery'
                  : 'Upload CSV to add recipient addresses'}
              </p>
            </div>
            {recipients.length > 0 && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                ✓ Ready
              </span>
            )}
          </div>
        </div>
      )}

      {/* Delivery Option Cards */}
      <Card className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-4 font-display">
          Select Delivery Method
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {DELIVERY_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                selectedOption === option.id
                  ? 'border-primary-brown bg-primary-brown/5 shadow-md'
                  : 'border-light-brown/30 hover:border-primary-brown/50 hover:bg-cream/50'
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h3 className="font-semibold text-primary-brown text-sm sm:text-base">
                {option.name}
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">{option.description}</p>
              <div className="mt-3 pt-3 border-t border-light-brown/20">
                <p className="text-sm font-bold text-primary-brown">
                  {option.id === 'factory-pickup' && 'Free'}
                  {option.id === 'individual' && 'From $12.99/recipient'}
                  {option.id === 'local-delivery' && 'From $8.99/recipient'}
                  {option.id === 'heavy-order' && 'Contact for pricing'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* ====== FACTORY PICKUP FLOW ====== */}
      {selectedOption === 'factory-pickup' && (
        <>
          {/* Factory Address */}
          <Card className="mb-6 sm:mb-8 animate-fade-up">
            <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-3 font-display">
              Pickup Location
            </h2>
            <div className="flex items-start gap-3 p-4 bg-cream/50 rounded-xl border border-light-brown/20">
              <div className="text-2xl flex-shrink-0">🏭</div>
              <div>
                <p className="font-semibold text-primary-brown text-sm sm:text-base">
                  Brown Sugar Bakery
                </p>
                <p className="text-sm text-charcoal/70 mt-1">{FACTORY_ADDRESS}</p>
                <p className="text-xs text-charcoal/50 mt-2">
                  Please coordinate pickup time with our team after placing your order.
                </p>
              </div>
            </div>
          </Card>

          {/* Customer Info */}
          <CustomerInfoForm
            form={customerForm}
            onChange={(field, value) =>
              setCustomerForm((prev) => ({ ...prev, [field]: value }))
            }
            isValidEmail={isValidEmail}
            isValidPhone={isValidPhone}
          />
        </>
      )}

      {/* ====== INDIVIDUAL DELIVERIES FLOW ====== */}
      {selectedOption === 'individual' && (
        <>
          {/* Shipping Method Sub-Select */}
          <ShippingMethodSelect
            options={shippingSubOptions}
            selected={shippingMethod}
            onSelect={setShippingMethod}
          />

          {/* CSV Upload */}
          <div className="mb-6 sm:mb-8 animate-fade-up">
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

          {/* Recipient Table */}
          {recipients.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <RecipientTable recipients={recipients} onUpdate={handleUpdate} />
            </div>
          )}

          {/* Weight Estimate */}
          {recipients.length > 0 && (
            <WeightEstimate
              weightPerRecipient={weightPerRecipient}
              recipientCount={recipients.length}
              totalWeight={totalWeight}
            />
          )}

          {/* Customer Info */}
          <CustomerInfoForm
            form={customerForm}
            onChange={(field, value) =>
              setCustomerForm((prev) => ({ ...prev, [field]: value }))
            }
            isValidEmail={isValidEmail}
            isValidPhone={isValidPhone}
          />
        </>
      )}

      {/* ====== LOCAL DELIVERY FLOW ====== */}
      {selectedOption === 'local-delivery' && (
        <>
          {/* Delivery Address */}
          <Card className="mb-6 sm:mb-8 animate-fade-up">
            <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-4 font-display">
              Delivery Address
            </h2>
            <p className="text-sm text-charcoal/70 mb-4">
              Enter the delivery address (must be within 25 miles of our factory)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-charcoal/70 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={localAddress.address1}
                  onChange={(e) =>
                    setLocalAddress((prev) => ({ ...prev, address1: e.target.value }))
                  }
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
                  value={localAddress.address2}
                  onChange={(e) =>
                    setLocalAddress((prev) => ({ ...prev, address2: e.target.value }))
                  }
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
                  value={localAddress.city}
                  onChange={(e) =>
                    setLocalAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
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
                    value={localAddress.state}
                    onChange={(e) =>
                      setLocalAddress((prev) => ({
                        ...prev,
                        state: e.target.value.toUpperCase().slice(0, 2),
                      }))
                    }
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
                    value={localAddress.zip}
                    onChange={(e) =>
                      setLocalAddress((prev) => ({ ...prev, zip: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
                    placeholder="60601"
                  />
                </div>
              </div>
            </div>

            {/* Check Distance Button */}
            <div className="mt-4">
              <Button
                onClick={handleCheckDistance}
                disabled={!isLocalAddressComplete || checkingDistance}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {checkingDistance ? 'Checking Distance...' : 'Check Distance'}
              </Button>
            </div>

            {/* Distance Result */}
            {distanceResult && (
              <div
                className={`mt-4 p-4 rounded-lg border ${
                  distanceResult.withinRange
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                {distanceResult.withinRange ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-700 font-semibold text-sm">
                      ✓ Within delivery range
                    </span>
                    {distanceResult.distanceMiles !== null && (
                      <span className="text-green-600 text-xs">
                        ({distanceResult.distanceMiles} miles
                        {distanceResult.durationText
                          ? `, ~${distanceResult.durationText}`
                          : ''}
                        )
                      </span>
                    )}
                    {distanceResult.warning && (
                      <span className="text-amber-600 text-xs block mt-1">
                        {distanceResult.warning}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-red-700 font-semibold text-sm">
                    ✗ Outside 25-mile delivery range
                    {distanceResult.distanceMiles !== null &&
                      ` (${distanceResult.distanceMiles} miles)`}
                  </p>
                )}
              </div>
            )}

            {error && selectedOption === 'local-delivery' && (
              <Alert variant="error" className="mt-4">
                {error}
              </Alert>
            )}
          </Card>

          {/* Shipping Sub-Select (only if within range) */}
          {distanceResult?.withinRange && (
            <ShippingMethodSelect
              options={shippingSubOptions}
              selected={shippingMethod}
              onSelect={setShippingMethod}
            />
          )}

          {/* Weight Estimate */}
          {distanceResult?.withinRange && shippingMethod && (
            <WeightEstimate
              weightPerRecipient={weightPerRecipient}
              recipientCount={quantity}
              totalWeight={weightPerRecipient * quantity}
            />
          )}

          {/* Customer Info */}
          {distanceResult?.withinRange && (
            <CustomerInfoForm
              form={customerForm}
              onChange={(field, value) =>
                setCustomerForm((prev) => ({ ...prev, [field]: value }))
              }
              isValidEmail={isValidEmail}
              isValidPhone={isValidPhone}
            />
          )}
        </>
      )}

      {/* ====== HEAVY ORDER FLOW ====== */}
      {selectedOption === 'heavy-order' && (
        <Card className="mb-6 sm:mb-8 animate-fade-up">
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📞</div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary-brown mb-3">
              Contact Us for Large Orders
            </h2>
            <p className="text-sm sm:text-base text-charcoal/70 mb-6 max-w-md mx-auto">
              For orders totaling over 250 lbs, our team will work with you to
              arrange delivery logistics and provide custom pricing.
            </p>
            <div className="inline-block bg-cream/50 border border-light-brown/20 rounded-xl p-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-xs text-charcoal/60">Phone</p>
                    <a
                      href="tel:773-570-7676"
                      className="text-sm font-semibold text-primary-brown hover:text-accent-gold transition-colors"
                    >
                      773-570-7676
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">✉️</span>
                  <div>
                    <p className="text-xs text-charcoal/60">Email</p>
                    <a
                      href="mailto:brownsugarbakery75@gmail.com"
                      className="text-sm font-semibold text-primary-brown hover:text-accent-gold transition-colors"
                    >
                      brownsugarbakery75@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button
                variant="secondary"
                onClick={() => router.push('/contact')}
              >
                Go to Contact Page
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ====== PRICING SUMMARY ====== */}
      {selectedOption &&
        selectedOption !== 'heavy-order' &&
        recipientCount > 0 && (
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
                  <span className="pr-2">
                    Gift Subtotal ({recipientCount} x ${giftTotal.toFixed(2)}):
                  </span>
                  <span className="whitespace-nowrap">
                    ${giftSubtotal.toFixed(2)}
                  </span>
                </div>
                {selectedOption === 'factory-pickup' ? (
                  <div className="flex justify-between font-semibold text-xs sm:text-sm mt-1">
                    <span>Shipping:</span>
                    <span className="text-green-700 whitespace-nowrap">Free</span>
                  </div>
                ) : (
                  shippingMethod && (
                    <div className="flex justify-between font-semibold text-xs sm:text-sm mt-1">
                      <span className="pr-2">
                        Shipping ({SHIPPING_RATES[shippingMethod].name} x{' '}
                        {recipientCount}):
                      </span>
                      <span className="whitespace-nowrap">
                        ${totalShipping.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
                <div className="flex justify-between font-bold text-base sm:text-lg text-primary-brown mt-3 pt-2 border-t border-light-brown/30">
                  <span>Estimated Total:</span>
                  <span className="whitespace-nowrap">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-charcoal/50 mt-2">
                  * Final shipping costs may vary based on destination
                </p>
              </div>
            </div>
          </Card>
        )}

      {/* ====== WEIGHT WARNING ====== */}
      {totalWeight > 250 &&
        selectedOption !== 'heavy-order' &&
        selectedOption !== null && (
          <Alert variant="error" className="mb-6 sm:mb-8">
            <div>
              <p className="font-semibold">
                Estimated total weight: {totalWeight} lbs
              </p>
              <p className="text-sm mt-1">
                Orders over 250 lbs require special shipping arrangements. Please
                consider selecting the{' '}
                <button
                  onClick={() => handleOptionSelect('heavy-order')}
                  className="font-bold underline hover:text-primary-brown"
                >
                  Over 250 lbs — Call Us
                </button>{' '}
                option for custom pricing and logistics.
              </p>
            </div>
          </Alert>
        )}

      {/* ====== CONTINUE / BACK BUTTONS ====== */}
      {selectedOption !== 'heavy-order' && (
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
            {!selectedOption
              ? 'Select Delivery Method'
              : canProceed
                ? 'Continue to Review'
                : selectedOption === 'individual' && recipients.length === 0
                  ? 'Upload Recipient List'
                  : 'Complete All Fields'}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---- Sub-Components ----

function ShippingMethodSelect({
  options,
  selected,
  onSelect,
}: {
  options: ShippingSubOption[];
  selected: ShippingSubOption | null;
  onSelect: (method: ShippingSubOption) => void;
}) {
  return (
    <Card className="mb-6 sm:mb-8 animate-fade-up">
      <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-4 font-display">
        Shipping Method
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const rate = SHIPPING_RATES[opt];
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                selected === opt
                  ? 'border-primary-brown bg-primary-brown/5 shadow-md'
                  : 'border-light-brown/30 hover:border-primary-brown/50 hover:bg-cream/50'
              }`}
            >
              <h3 className="font-semibold text-primary-brown text-sm">
                {rate.name}
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Est. {rate.estimatedDays}
              </p>
              <p className="text-sm font-bold text-primary-brown mt-2">
                ${rate.price.toFixed(2)}/recipient
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function WeightEstimate({
  weightPerRecipient,
  recipientCount,
  totalWeight,
}: {
  weightPerRecipient: number;
  recipientCount: number;
  totalWeight: number;
}) {
  return (
    <Card className="mb-6 sm:mb-8 animate-fade-up">
      <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-3 font-display">
        Weight Estimate
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 bg-cream/50 rounded-lg text-center">
          <p className="text-xs text-charcoal/60">Per Recipient</p>
          <p className="text-lg font-bold text-primary-brown">
            {weightPerRecipient} lb{weightPerRecipient !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="p-3 bg-cream/50 rounded-lg text-center">
          <p className="text-xs text-charcoal/60">Recipients</p>
          <p className="text-lg font-bold text-primary-brown">{recipientCount}</p>
        </div>
        <div
          className={`p-3 rounded-lg text-center ${
            totalWeight > 250
              ? 'bg-red-50 border border-red-200'
              : 'bg-cream/50'
          }`}
        >
          <p className="text-xs text-charcoal/60">Total Weight</p>
          <p
            className={`text-lg font-bold ${
              totalWeight > 250 ? 'text-red-700' : 'text-primary-brown'
            }`}
          >
            {totalWeight} lbs
          </p>
        </div>
      </div>
      {totalWeight > 250 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-semibold">
            ⚠ Order exceeds 250 lbs — consider the &quot;Over 250 lbs&quot; option for
            custom shipping arrangements.
          </p>
        </div>
      )}
    </Card>
  );
}

function CustomerInfoForm({
  form,
  onChange,
  isValidEmail,
  isValidPhone,
}: {
  form: {
    contactName: string;
    companyName: string;
    phone: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
  };
  onChange: (field: string, value: string) => void;
  isValidEmail: (email: string) => boolean;
  isValidPhone: (phone: string) => boolean;
}) {
  return (
    <Card className="mb-6 sm:mb-8 animate-fade-up">
      <h2 className="text-base sm:text-lg font-semibold text-primary-brown mb-4 font-display">
        Customer Information
      </h2>
      <p className="text-sm text-charcoal/70 mb-4">
        Your contact and billing information
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={form.contactName}
            onChange={(e) => onChange('contactName', e.target.value)}
            className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
            placeholder="Your company name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
              form.phone && !isValidPhone(form.phone)
                ? 'border-red-400'
                : 'border-light-brown/30'
            }`}
            placeholder="(555) 555-5555"
          />
          {form.phone && !isValidPhone(form.phone) && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a valid phone number
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown ${
              form.email && !isValidEmail(form.email)
                ? 'border-red-400'
                : 'border-light-brown/30'
            }`}
            placeholder="email@company.com"
          />
          {form.email && !isValidEmail(form.email) && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a valid email address
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal/70 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            value={form.address1}
            onChange={(e) => onChange('address1', e.target.value)}
            className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
            placeholder="123 Main Street"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal/70 mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            value={form.address2}
            onChange={(e) => onChange('address2', e.target.value)}
            className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
            placeholder="Suite, Apt, Floor (optional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1">
            City *
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
            placeholder="Chicago"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1">
              State *
            </label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => onChange('state', e.target.value)}
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
              value={form.zip}
              onChange={(e) => onChange('zip', e.target.value)}
              className="w-full px-4 py-2.5 border border-light-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-brown/30 focus:border-primary-brown"
              placeholder="60601"
              maxLength={10}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
