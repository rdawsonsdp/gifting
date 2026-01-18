'use client';

import { TIERS } from '@/lib/tiers';
import TierCard from '@/components/gift-builder/TierCard';
import HeroCarousel from '@/components/layout/HeroCarousel';

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
              Send handcrafted candy gifts to your clients, employees, and partners
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
        <div className="glass-card rounded-2xl p-6 text-center hover-lift animate-scale-in delay-100">
          <div className="text-3xl sm:text-4xl mb-3 animate-float">🚚</div>
          <h3 className="font-display font-semibold text-primary-brown mb-2 text-base sm:text-lg">Fast Delivery</h3>
          <p className="text-sm text-charcoal/70">Flexible shipping options so you never have to miss a celebration</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center hover-lift animate-scale-in delay-200">
          <div className="text-3xl sm:text-4xl mb-3 animate-float" style={{ animationDelay: '1s' }}>🍬</div>
          <h3 className="font-display font-semibold text-primary-brown mb-2 text-base sm:text-lg">Small Batches</h3>
          <p className="text-sm text-charcoal/70">Made daily with the freshest ingredients like mom used to make them</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center hover-lift animate-scale-in delay-300">
          <div className="text-3xl sm:text-4xl mb-3 animate-float" style={{ animationDelay: '2s' }}>🎁</div>
          <h3 className="font-display font-semibold text-primary-brown mb-2 text-base sm:text-lg">Bulk Gifting</h3>
          <p className="text-sm text-charcoal/70">Send gifts to multiple addresses across the country</p>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center hover-lift animate-scale-in delay-400">
          <div className="text-3xl sm:text-4xl mb-3 animate-float" style={{ animationDelay: '3s' }}>📧</div>
          <h3 className="font-display font-semibold text-primary-brown mb-2 text-base sm:text-lg">Contact Us</h3>
          <p className="text-sm text-charcoal/70 mb-3">Have questions? Get in touch with our corporate gifting team</p>
          <a href="/contact" className="inline-block px-4 py-2 bg-primary-brown text-white rounded-lg text-sm font-semibold hover:bg-[#4A3329] transition-colors">
            Contact Us
          </a>
        </div>
      </div>

      {/* Tier Selection with E-commerce Grid */}
      <div className="mb-6 sm:mb-8 lg:mb-12 relative">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 animate-fade-up">
          <p className="text-sm font-semibold text-primary-brown uppercase tracking-wider mb-3">
            Get Started
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-brown mb-4 font-display px-2">
            Choose Your Budget Tier
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

      {/* Call to Action with Enhanced Styling */}
      <div className="relative text-center mt-8 sm:mt-12 lg:mt-16">
        <div className="glass-card rounded-2xl p-6 sm:p-8 lg:p-12 mx-2 sm:mx-0 max-w-3xl mx-auto animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-gold/20 text-primary-brown text-xs font-bold uppercase tracking-wider mb-4">
            <span className="live-dot w-2 h-2 bg-accent-gold rounded-full"></span>
            Special Offer
          </div>
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
    </>
  );
}
