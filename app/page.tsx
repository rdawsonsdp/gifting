'use client';

import { TIERS } from '@/lib/tiers';
import TierCard from '@/components/gift-builder/TierCard';

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#5D4037] mb-3 sm:mb-4 font-[var(--font-playfair)] px-2">
          Corporate Gifting Made Simple
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-[#333333] max-w-2xl mx-auto mb-2 px-2">
          Send handcrafted candy gifts to your clients, employees, and partners
        </p>
        <p className="text-sm sm:text-base md:text-lg text-[#8B7355] max-w-2xl mx-auto px-2">
          From our kitchen to yours. Small batches made daily with the freshest ingredients.
        </p>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto">
        <div className="text-center px-2">
          <div className="text-2xl sm:text-3xl mb-2">🚚</div>
          <h3 className="font-semibold text-[#5D4037] mb-1 text-sm sm:text-base">Fast Delivery</h3>
          <p className="text-xs sm:text-sm text-[#333333]">Flexible shipping options so you never have to miss a celebration</p>
        </div>
        <div className="text-center px-2">
          <div className="text-2xl sm:text-3xl mb-2">🍬</div>
          <h3 className="font-semibold text-[#5D4037] mb-1 text-sm sm:text-base">Small Batches</h3>
          <p className="text-xs sm:text-sm text-[#333333]">Made daily with the freshest ingredients like mom used to make them</p>
        </div>
        <div className="text-center px-2">
          <div className="text-2xl sm:text-3xl mb-2">🎁</div>
          <h3 className="font-semibold text-[#5D4037] mb-1 text-sm sm:text-base">Bulk Gifting</h3>
          <p className="text-xs sm:text-sm text-[#333333]">Send gifts to multiple addresses across the country</p>
        </div>
      </div>

      {/* Tier Selection */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-[#5D4037] mb-6 sm:mb-8 font-[var(--font-playfair)] px-2">
          Choose Your Budget Tier
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8 sm:mt-12 p-6 sm:p-8 bg-[#E6E6FA]/30 rounded-lg mx-2 sm:mx-0">
        <p className="text-base sm:text-lg text-[#5D4037] mb-3 sm:mb-4 px-2">
          Your clients deserve something special. Build custom gifts within your budget.
        </p>
        <p className="text-xs sm:text-sm text-[#8B7355] px-2">
          Life is Sweeter with Brown Sugar Bakery
        </p>
      </div>
    </div>
  );
}
