'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface ShopifyProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  descriptionHtml: string;
  price: number;
  image: string;
  images: string[];
  inventory: number;
  variantId?: string;
  availableForTiers: string[];
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const productSlug = params.slug as string;

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${productSlug}`);
        const data = await response.json();

        if (!response.ok || !data.product) {
          setError('Product not found');
          return;
        }

        setProduct(data.product);
        setSelectedImage(data.product.image);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown mx-auto"></div>
        <p className="mt-4 text-charcoal/60">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Alert variant="error">{error || 'Product not found'}. Please browse our products from the home page.</Alert>
        <Button onClick={() => router.push('/')} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  const handleBuildPackage = () => {
    router.push('/#packages-section');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile: Full-width image at top, Desktop: Grid layout */}
      <div className="lg:container lg:mx-auto lg:px-6 lg:py-8">

        {/* Breadcrumb - Hidden on mobile for cleaner UX */}
        <nav className="hidden lg:block mb-6 animate-fade-in">
          <ol className="flex items-center space-x-2 text-sm text-charcoal/60">
            <li>
              <button onClick={() => router.push('/')} className="hover:text-primary-brown transition-colors">
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => router.push('/')} className="hover:text-primary-brown transition-colors">
                Products
              </button>
            </li>
            <li>/</li>
            <li className="text-primary-brown font-medium truncate max-w-[200px]">{product.title}</li>
          </ol>
        </nav>

        {/* Mobile Back Button */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="animate-fade-up">
            {/* Main Image - Full width on mobile */}
            <div className="aspect-square lg:rounded-2xl overflow-hidden relative group">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cream to-lavender/30 flex items-center justify-center text-light-brown/50">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Image counter for mobile */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 lg:hidden">
                  <span className="px-3 py-1.5 bg-black/60 text-white rounded-full text-sm font-medium">
                    {product.images.indexOf(selectedImage) + 1} / {product.images.length}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery - Scrollable on mobile */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-4 lg:p-0 lg:mt-4 snap-x snap-mandatory scrollbar-hide">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                      selectedImage === img
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-gray-200 active:border-amber-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details - Right Column */}
          <div className="px-4 lg:px-0 py-6 lg:py-0 animate-fade-up delay-100">
            {/* Title and Price - Mobile optimized */}
            <div className="mb-4 lg:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-1 bg-primary-brown/10 text-primary-brown text-xs font-semibold rounded-full">
                  Handcrafted Gift
                </span>
                {product.inventory > 0 && (
                  <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    In Stock
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-primary-brown mb-2">
                {product.title}
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-primary-brown">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Tier Badges - Horizontal scroll on mobile */}
            {product.availableForTiers && product.availableForTiers.length > 0 && (
              <div className="mb-4 lg:mb-6">
                <p className="text-xs text-charcoal/60 mb-2 uppercase tracking-wide">Available in</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {product.availableForTiers.map((tier) => {
                    const tierColors: Record<string, string> = {
                      bronze: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white',
                      silver: 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900',
                      gold: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-900',
                      platinum: 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800',
                    };
                    return (
                      <span
                        key={tier}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold ${
                          tierColors[tier.toLowerCase()] || 'bg-primary-brown text-white'
                        }`}
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Description - Collapsible on mobile for long content */}
            {(product.descriptionHtml || product.description) && (
              <div className="mb-6">
                <p className="text-xs text-charcoal/60 mb-2 uppercase tracking-wide">Description</p>
                {product.descriptionHtml ? (
                  <div
                    className="text-sm sm:text-base text-charcoal/80 leading-relaxed
                      prose prose-sm max-w-none
                      prose-p:mb-3 prose-p:leading-relaxed
                      prose-ul:my-2 prose-ul:pl-4
                      prose-li:text-charcoal/80 prose-li:mb-1
                      prose-strong:text-primary-brown prose-strong:font-semibold"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                ) : (
                  <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                )}
              </div>
            )}

            {/* Build Your Package Button - Desktop only (mobile has sticky footer) */}
            <div className="hidden lg:block">
              <Button
                onClick={handleBuildPackage}
                className="w-full py-4 text-lg font-bold btn-primary mb-6"
              >
                Build Your Package
              </Button>
            </div>

            {/* Quick Info - Horizontal scroll on mobile */}
            <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 lg:grid lg:grid-cols-2 lg:gap-4 scrollbar-hide">
              <div className="flex-shrink-0 flex items-center gap-3 bg-cream/50 rounded-xl p-3 min-w-[140px]">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-charcoal/60">Packaging</p>
                  <p className="text-sm font-medium text-primary-brown">Gift Ready</p>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-3 bg-cream/50 rounded-xl p-3 min-w-[140px]">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-charcoal/60">Delivery</p>
                  <p className="text-sm font-medium text-primary-brown">3-5 Days</p>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-3 bg-cream/50 rounded-xl p-3 min-w-[140px]">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-charcoal/60">Quality</p>
                  <p className="text-sm font-medium text-primary-brown">Handcrafted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA for Mobile - Large touch target */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-light-brown/20 lg:hidden z-40 safe-area-bottom">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-charcoal/60 truncate">{product.title}</p>
              <p className="text-xl font-bold text-primary-brown">${product.price.toFixed(2)}</p>
            </div>
          </div>
          <Button
            onClick={handleBuildPackage}
            className="w-full py-4 text-base font-bold btn-primary min-h-[52px]"
          >
            Build Your Package
          </Button>
        </div>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="h-32 lg:hidden"></div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </div>
  );
}
