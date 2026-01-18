'use client';

import { TIERS } from '@/lib/tiers';
import TierCard from '@/components/gift-builder/TierCard';

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      {/* Hero Section with Restaurant Skill Styling */}
      <div className="relative text-center mb-8 sm:mb-12 lg:mb-16">
        {/* Background decorative blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary-brown/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-[100px] -z-10"></div>
        
        <div className="relative animate-fade-up">
          <p className="text-sm font-semibold text-primary-brown uppercase tracking-wider mb-3 animate-fade-in delay-100">
            Brown Sugar Bakery
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-brown mb-4 sm:mb-6 font-display px-2 animate-fade-up delay-200">
            Corporate Gifting<br />
            <span className="gradient-text">Made Simple</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-charcoal/80 max-w-2xl mx-auto mb-3 px-2 animate-fade-up delay-300">
            Send handcrafted candy gifts to your clients, employees, and partners
          </p>
          <p className="text-sm sm:text-base md:text-lg text-light-brown max-w-2xl mx-auto px-2 animate-fade-up delay-400">
            From our kitchen to yours. Small batches made daily with the freshest ingredients.
          </p>
        </div>
      </div>

      {/* Value Propositions with E-commerce Card Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto">
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
  );
}
