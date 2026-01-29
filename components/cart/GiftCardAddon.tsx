'use client';

import { useState } from 'react';

const DENOMINATIONS = [10, 25, 50, 100];

export default function GiftCardAddon() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="border-t border-light-brown/20 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary-brown font-display">
          Add a Gift Card
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded-full">
          Coming Soon
        </span>
      </div>
      <div className="flex gap-2">
        {DENOMINATIONS.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelected(selected === amount ? null : amount)}
            disabled
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-all
              ${selected === amount
                ? 'bg-primary-brown text-white'
                : 'bg-cream/50 text-charcoal/40 border border-light-brown/20'
              }
              opacity-50 cursor-not-allowed
            `}
          >
            ${amount}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-charcoal/50 mt-2">
        Gift card support is coming soon. Stay tuned!
      </p>
    </div>
  );
}
