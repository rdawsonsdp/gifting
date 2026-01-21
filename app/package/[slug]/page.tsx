'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPackageBySlug } from '@/lib/packages';
import { useGift } from '@/context/GiftContext';
import { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function PackagePage() {
  const params = useParams();
  const router = useRouter();
  const { dispatch } = useGift();
  const [packageImage, setPackageImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const packageSlug = params.slug as string;
  const pkg = getPackageBySlug(packageSlug);

  useEffect(() => {
    async function fetchProductImage() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          if (data.products && Array.isArray(data.products)) {
            const productWithImage = data.products.find((p: Product) => p.image && p.image.trim() !== '');
            if (productWithImage) {
              setPackageImage(productWithImage.image);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product image:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductImage();
  }, []);

  if (!pkg) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Alert variant="error">Package not found. Please choose a package from the home page.</Alert>
        <Button onClick={() => router.push('/')} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Proceed to recipients with this package selected (quantity will be set on recipients page)
    dispatch({ type: 'SELECT_PACKAGE', payload: { package: pkg, quantity: 1 } });
    router.push('/recipients');
  };

  const displayImage = pkg.image || packageImage;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8 animate-fade-in">
        <ol className="flex items-center space-x-2 text-sm text-charcoal/60">
          <li>
            <button onClick={() => router.push('/')} className="hover:text-primary-brown transition-colors">
              Home
            </button>
          </li>
          <li>/</li>
          <li>
            <button onClick={() => router.push('/')} className="hover:text-primary-brown transition-colors">
              Signature Packages
            </button>
          </li>
          <li>/</li>
          <li className="text-primary-brown font-medium">{pkg.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="animate-fade-up">
          <div className="aspect-square bg-gradient-to-br from-cream to-lavender/30 rounded-2xl overflow-hidden relative group">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
              </div>
            ) : displayImage ? (
              <img
                src={displayImage}
                alt={pkg.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-light-brown/50">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}

            {/* Gilded corner accents */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl"></div>
          </div>
        </div>

        {/* Product Details - Right Column */}
        <div className="animate-fade-up delay-100">
          {/* Title and Price */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full mb-3">
              Signature Package
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-brown mb-4">
              {pkg.name}
            </h1>
            <p className="text-3xl sm:text-4xl font-bold text-primary-brown">
              ${pkg.price.toFixed(2)}
              <span className="text-base font-normal text-charcoal/60 ml-2">per recipient</span>
            </p>
          </div>

          {/* Continue to Order Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full py-4 text-lg font-bold btn-primary mb-6"
          >
            Continue to Order
          </Button>

          {/* Additional Info Icons */}
          <div className="pt-6 border-t border-light-brown/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-charcoal/60">Packaging</p>
                  <p className="text-sm font-medium text-primary-brown">Gift Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-charcoal/60">Delivery</p>
                  <p className="text-sm font-medium text-primary-brown">3-5 Business Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="mt-12 lg:mt-16 animate-fade-up delay-200">
        <div className="max-w-4xl">
          {/* Section Header */}
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary-brown mb-8 pb-4 border-b border-light-brown/20">
            Product Description
          </h2>

          {/* Headline */}
          <p className="text-xl sm:text-2xl font-display font-semibold text-primary-brown mb-2">
            {pkg.productDescription.headline}
          </p>

          {/* Subheadline */}
          <p className="text-lg text-amber-700 font-medium mb-6">
            {pkg.productDescription.subheadline}
          </p>

          {/* Body Description */}
          <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed mb-8">
            {pkg.productDescription.body}
          </p>

          {/* Box Includes Section */}
          <div className="mb-8">
            <h3 className="text-lg font-display font-bold text-primary-brown mb-4">
              Box includes:
            </h3>
            <ul className="space-y-2">
              {pkg.productDescription.includes.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span className="text-charcoal/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-display font-bold text-primary-brown mb-4">
              Product details:
            </h3>
            <ul className="space-y-2">
              {pkg.productDescription.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <span className="text-charcoal/80">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What's Included Visual Grid */}
          <div className="mt-12 p-6 sm:p-8 bg-cream/50 rounded-2xl">
            <h3 className="text-lg font-display font-bold text-primary-brown mb-6 text-center">
              Everything in Your {pkg.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {pkg.includes.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-charcoal/80 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-light-brown/20 lg:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-charcoal/60">{pkg.name}</p>
            <p className="text-xl font-bold text-primary-brown">${pkg.price.toFixed(2)} <span className="text-sm font-normal text-charcoal/60">per recipient</span></p>
          </div>
          <Button
            onClick={handleAddToCart}
            className="py-3 px-6 text-base font-bold btn-primary"
          >
            Continue to Order
          </Button>
        </div>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="h-24 lg:hidden"></div>
    </div>
  );
}
