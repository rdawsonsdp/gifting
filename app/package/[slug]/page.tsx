'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface ShopifyPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  descriptionHtml: string;
  longDescription: string;
  price: number;
  image: string;
  images: string[];
  includes: string[];
  variantId?: string;
}

export default function PackagePage() {
  const params = useParams();
  const router = useRouter();
  const { dispatch } = useGift();
  const [pkg, setPkg] = useState<ShopifyPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const packageSlug = params.slug as string;

  useEffect(() => {
    async function fetchPackage() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/packages/${packageSlug}`);
        const data = await response.json();

        if (!response.ok || !data.package) {
          setError('Package not found');
          return;
        }

        setPkg(data.package);
        setSelectedImage(data.package.image);
      } catch (err) {
        console.error('Error fetching package:', err);
        setError('Failed to load package');
      } finally {
        setLoading(false);
      }
    }

    if (packageSlug) {
      fetchPackage();
    }
  }, [packageSlug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown mx-auto"></div>
        <p className="mt-4 text-charcoal/60">Loading package...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Alert variant="error">{error || 'Package not found'}. Please choose a package from the home page.</Alert>
        <Button onClick={() => router.push('/')} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch({
      type: 'SELECT_PACKAGE',
      payload: {
        package: {
          id: pkg.id,
          name: pkg.name,
          slug: pkg.slug,
          description: pkg.description,
          longDescription: pkg.longDescription,
          price: pkg.price,
          image: pkg.image,
          includes: pkg.includes,
        },
        quantity: 1,
      },
    });
    router.push('/recipients');
  };

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
        {/* Product Images */}
        <div className="animate-fade-up">
          {/* Main Image */}
          <div className="aspect-square bg-gradient-to-br from-cream to-lavender/30 rounded-2xl overflow-hidden relative group mb-4">
            {selectedImage ? (
              <img
                src={selectedImage}
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

          {/* Thumbnail Gallery */}
          {pkg.images && pkg.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {pkg.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? 'border-amber-500 ring-2 ring-amber-200'
                      : 'border-transparent hover:border-amber-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${pkg.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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
            {pkg.price > 0 && (
              <p className="text-3xl sm:text-4xl font-bold text-primary-brown">
                ${pkg.price.toFixed(2)}
                <span className="text-base font-normal text-charcoal/60 ml-2">per recipient</span>
              </p>
            )}
          </div>

          {/* Product Description */}
          {(pkg.descriptionHtml || pkg.description) && (
            <div className="mb-6">
              {pkg.descriptionHtml ? (
                <div
                  className="text-sm sm:text-base text-charcoal/80 leading-relaxed
                    prose prose-sm max-w-none
                    prose-p:mb-3 prose-p:leading-relaxed
                    prose-ul:my-2 prose-ul:pl-4
                    prose-li:text-charcoal/80 prose-li:mb-1
                    prose-strong:text-primary-brown prose-strong:font-semibold"
                  dangerouslySetInnerHTML={{ __html: pkg.descriptionHtml }}
                />
              ) : (
                <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed whitespace-pre-line">
                  {pkg.description}
                </p>
              )}
            </div>
          )}

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

      {/* Sticky Bottom CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-light-brown/20 lg:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-charcoal/60">{pkg.name}</p>
            {pkg.price > 0 && (
              <p className="text-xl font-bold text-primary-brown">
                ${pkg.price.toFixed(2)} <span className="text-sm font-normal text-charcoal/60">per recipient</span>
              </p>
            )}
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
