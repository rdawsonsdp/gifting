'use client';

import { useEffect, useState } from 'react';
import { TIERS } from '@/lib/tiers';
import { PACKAGES, GiftPackage } from '@/lib/packages';
import { Product } from '@/lib/types';
import TierCard from '@/components/gift-builder/TierCard';
import PackageCard from '@/components/gift-builder/PackageCard';
import HeroCarousel from '@/components/layout/HeroCarousel';
import ProductCarousel from '@/components/gift-builder/ProductCarousel';
import SpecialOfferPopup from '@/components/ui/SpecialOfferPopup';

// Helper function to extract Vimeo video ID from URL
function getVimeoVideoId(url: string): string {
  if (!url) return '';
  
  // Handle various Vimeo URL formats:
  // https://vimeo.com/123456789
  // https://vimeo.com/123456789?share=copy
  // https://player.vimeo.com/video/123456789
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : url; // Return the ID or the original string if no match
}

// Vimeo video URL or ID - Paste your Vimeo link here
// Examples:
// - https://vimeo.com/123456789
// - https://player.vimeo.com/video/123456789
// - Or just the video ID: 123456789
const VIMEO_URL = 'https://vimeo.com/984629444/4acb8e88e5';
const VIMEO_VIDEO_ID = getVimeoVideoId(VIMEO_URL);

export default function Home() {
  const [packages, setPackages] = useState<GiftPackage[]>(PACKAGES);
  const [showPricingPopup, setShowPricingPopup] = useState(false);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch('/api/packages');
        if (response.ok) {
          const data = await response.json();
          if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
            // Use packages from Shopify's Corporate Gift Packages collection
            setPackages(data.packages);
          }
          // If no packages from Shopify, keep the default PACKAGES
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        // Keep default PACKAGES on error
      }
    }

    fetchPackages();
  }, []);

  return (
    <>
      {/* Hero Section with Image Carousel and Optional Vimeo Video */}
      <section className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
        {/* Image Carousel Background */}
        <HeroCarousel autoRotateInterval={5000} />
        
        {/* Optional Vimeo Video Overlay (disabled - using image carousel instead) */}
        {false && VIMEO_VIDEO_ID && (
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-black z-[1] opacity-30">
            <iframe
              src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?background=1&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&autopause=0&playsinline=1&responsive=1`}
              className="absolute top-0 left-0 w-full h-full"
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                zIndex: 0
              } as React.CSSProperties}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Hero Video"
              loading="eager"
              frameBorder="0"
            />
          </div>
        )}
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 z-[2] pointer-events-none"></div>
        
        {/* Hero Content Overlay */}
        <div className="relative z-[3] h-full flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 text-center animate-fade-up">
            <p className="text-sm sm:text-base font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4 animate-fade-in delay-100 drop-shadow-lg">
              Brown Sugar Bakery
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 font-display px-2 animate-fade-up delay-200 drop-shadow-lg">
              Corporate Gifting<br />
              <span className="text-accent-gold">Made Simple</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-3 sm:mb-4 px-2 animate-fade-up delay-300 drop-shadow-md">
              Send handcrafted candy and dessert gifts
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto px-2 animate-fade-up delay-400 drop-shadow-md">
              From our kitchen to yours. Small batches made daily with the freshest ingredients.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">

      {/* Value Propositions with E-commerce Card Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-6xl mx-auto">
        <div className="glass-card rounded-2xl p-6 text-center hover-lift animate-scale-in delay-100 min-h-[220px] flex flex-col">
          <div className="text-3xl sm:text-4xl mb-3 animate-float">🚚</div>
          <h3 className="font-display font-semibold text-primary-brown mb-2 text-base sm:text-lg">Fast Delivery</h3>
          <p className="text-sm text-charcoal/70 mb-3">Flexible shipping options so you never have to miss a celebration</p>
          <ul className="text-xs text-charcoal/60 space-y-1 mt-auto">
            <li>One-Location Delivery</li>
            <li>USPS</li>
            <li>UPS Ground</li>
            <li>UPS 2nd Day Air</li>
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center hover-lift animate-scale-in delay-200 min-h-[220px] flex flex-col">
          <div className="text-3xl sm:text-4xl mb-3 animate-float" style={{ animationDelay: '1s' }}>🍬</div>
          <h3 className="font-display font-semibold text-primary-brown mb-2 text-base sm:text-lg">Small Batches</h3>
          <p className="text-sm text-charcoal/70">Made daily with the freshest ingredients like mom used to make them</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center hover-lift animate-scale-in delay-300 min-h-[220px] flex flex-col">
          <div className="text-3xl sm:text-4xl mb-3 animate-float" style={{ animationDelay: '2s' }}>💰</div>
          <h3 className="font-display font-semibold text-primary-brown mb-2 text-base sm:text-lg">Volume Pricing</h3>
          <p className="text-sm text-charcoal/70 mb-2">Special discounts on large orders</p>
          <button
            onClick={() => setShowPricingPopup(true)}
            className="text-xs text-accent-gold font-semibold mt-auto inline-flex items-center justify-center gap-1 hover:text-primary-brown transition-colors"
          >
            View Discounts
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <a href="/contact" className="glass-card rounded-2xl p-6 text-center hover-lift animate-scale-in delay-400 block cursor-pointer min-h-[220px] flex flex-col">
          <div className="text-3xl sm:text-4xl mb-3 animate-float" style={{ animationDelay: '3s' }}>📧</div>
          <h3 className="font-display font-semibold text-primary-brown mb-2 text-base sm:text-lg">Contact Us</h3>
          <p className="text-sm text-charcoal/70">Have questions? Get in touch with our corporate gifting team</p>
        </a>
      </div>

      {/* Gifting Packages Section */}
      <div id="packages-section" className="mb-8 sm:mb-12 lg:mb-16 relative">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 animate-fade-up">
          <p className="text-sm font-semibold text-primary-brown uppercase tracking-wider mb-3">
            Curated Collections
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-brown mb-4 font-display px-2">
            Choose One of our Signature Packages
          </h2>
          <p className="text-base text-charcoal/70 px-2">
            Beautifully curated gift packages ready to delight your recipients
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {packages.map((pkg, index) => (
            <div key={pkg.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <PackageCard package={pkg} />
            </div>
          ))}
        </div>
      </div>

      {/* Tier Selection with E-commerce Grid */}
      <div className="mb-6 sm:mb-8 lg:mb-12 relative">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-brown mb-4 font-display px-2">
            Or Build Your Own
          </h2>
          <p className="text-base text-charcoal/70 px-2">
            Select a tier that fits your budget and start building your custom gift collection
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {TIERS.map((tier, index) => (
            <div key={tier.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <TierCard tier={tier} />
            </div>
          ))}
        </div>
      </div>

      {/* Product Carousel */}
      <ProductCarousel autoScroll={true} scrollInterval={4000} />

      {/* Call to Action with Enhanced Styling */}
      <div className="relative text-center mt-8 sm:mt-12 lg:mt-16">
        <div className="glass-card rounded-2xl p-6 sm:p-8 lg:p-12 mx-2 sm:mx-0 max-w-3xl mx-auto animate-fade-up">
          <p className="text-lg sm:text-xl md:text-2xl font-display font-bold text-primary-brown mb-3 sm:mb-4 px-2">
            Your clients deserve something special.<br />
            Build custom gifts within your budget.
          </p>
          <p className="text-sm sm:text-base text-light-brown px-2">
            Life is Sweeter with Brown Sugar Bakery
          </p>
        </div>
      </div>
      </div>

      {/* Volume Pricing Popup */}
      {showPricingPopup && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPricingPopup(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display font-bold text-primary-brown text-xl sm:text-2xl">Volume Discounts</h3>
                <p className="text-sm text-charcoal/70 mt-1">Save more when you order more</p>
              </div>
              <button
                onClick={() => setShowPricingPopup(false)}
                className="text-charcoal/50 hover:text-charcoal transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-cream/50 rounded-xl">
                <span className="text-charcoal font-medium">500 - 1,000 units</span>
                <span className="font-bold text-primary-brown text-lg">5% off</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-cream/50 rounded-xl">
                <span className="text-charcoal font-medium">1,000 - 2,500 units</span>
                <span className="font-bold text-primary-brown text-lg">10% off</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent-gold/20 rounded-xl border-2 border-accent-gold/30">
                <span className="text-charcoal font-medium">2,500+ units</span>
                <span className="font-bold text-primary-brown text-lg">15% off</span>
              </div>
            </div>
            <p className="text-xs text-charcoal/60 mt-4 text-center">
              Contact us for custom pricing on orders over 5,000 units
            </p>
          </div>
        </div>
      )}

      {/* Special Offer Popup Carousel */}
      <SpecialOfferPopup delayMs={3000} />

    </>
  );
}
