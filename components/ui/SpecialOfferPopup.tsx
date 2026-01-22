'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import Button from './Button';

interface SpecialOfferPopupProps {
  delayMs?: number;
  onClose?: () => void;
}

export default function SpecialOfferPopup({ delayMs = 3000, onClose }: SpecialOfferPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if popup was already dismissed this session
    const dismissed = sessionStorage.getItem('specialOfferDismissed');
    if (dismissed) {
      return;
    }

    // Fetch special offer products
    async function fetchSpecialOffers() {
      try {
        const response = await fetch('/api/special-offers');
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            // Filter products with images
            const productsWithImages = data.products.filter(
              (p: Product) => p.image && p.image.trim() !== ''
            );
            setProducts(productsWithImages);
          }
        }
      } catch (error) {
        console.error('Error fetching special offers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpecialOffers();

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('specialOfferDismissed', 'true');
    onClose?.();
  };

  const handleShopNow = () => {
    handleClose();
    const packagesSection = document.getElementById('packages-section');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isVisible || loading || products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];
  const discountPercent = currentProduct.compareAtPrice
    ? Math.round(((currentProduct.compareAtPrice - currentProduct.price) / currentProduct.compareAtPrice) * 100)
    : 20;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Special Offer Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIgY3g9IjIwIiBjeT0iMjAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-30"></div>
          <p className="text-sm font-semibold uppercase tracking-wider relative z-10">
            Special Offers
          </p>
        </div>

        {/* Close Button - Upper Right Corner */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-10 h-10 bg-white/95 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all z-20 border border-gray-300"
          aria-label="Close popup"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Carousel */}
        <div className="relative">
          {/* Product Image */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-cream to-lavender/30 overflow-hidden">
            <img
              src={currentProduct.image}
              alt={currentProduct.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              Save {discountPercent}%
            </div>

            {/* Navigation Arrows */}
            {products.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <svg className="w-5 h-5 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <svg className="w-5 h-5 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {products.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h3 className="text-xl sm:text-2xl font-display font-bold text-primary-brown mb-2">
            {currentProduct.title}
          </h3>
          <p className="text-charcoal/70 text-sm mb-4 line-clamp-2">
            {currentProduct.description || 'Handcrafted with love using the finest ingredients. Perfect for corporate gifting.'}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary-brown">
                ${currentProduct.price.toFixed(2)}
              </span>
              {currentProduct.compareAtPrice && (
                <span className="text-sm text-charcoal/50 line-through">
                  ${currentProduct.compareAtPrice.toFixed(2)}
                </span>
              )}
              {!currentProduct.compareAtPrice && (
                <span className="text-sm text-charcoal/50 line-through">
                  ${(currentProduct.price * 1.2).toFixed(2)}
                </span>
              )}
            </div>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
              Save {discountPercent}%
            </span>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleShopNow}
              className="w-full py-3 text-base font-bold btn-primary"
            >
              Shop Now
            </Button>
            <button
              onClick={handleClose}
              className="w-full py-2 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
            >
              No thanks, maybe later
            </button>
          </div>

          {/* Product Counter */}
          {products.length > 1 && (
            <p className="text-xs text-charcoal/40 text-center mt-3">
              {currentIndex + 1} of {products.length} special offers
            </p>
          )}

          {/* Trust Indicators */}
          <div className="mt-4 pt-4 border-t border-light-brown/20 flex items-center justify-center gap-4 text-xs text-charcoal/50">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure Checkout
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              Fast Shipping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
