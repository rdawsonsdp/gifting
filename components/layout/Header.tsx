'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGift } from '@/context/GiftContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state, setCartOpen } = useGift();

  const itemCount = state.selectedPackage
    ? state.selectedPackage.quantity
    : state.selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0);

  return (
    <header className="bg-[#E98D3D] text-white shadow-md sticky top-0 z-50 safe-area-top">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center min-w-0 group hover:opacity-90 transition-opacity">
            <div className="relative flex-shrink-0" style={{
              width: '120px',
              height: '121px',
              aspectRatio: '850/859'
            }}>
              <Image
                src="/images/BSBLogo.jpeg"
                alt="Brown Sugar Bakery"
                width={850}
                height={859}
                className="h-full w-full object-contain"
                style={{ backgroundColor: 'transparent' }}
                priority
              />
            </div>
            <div className="flex flex-col min-w-0 ml-2 sm:ml-3">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-display truncate">
                Brown Sugar Bakery
              </h1>
              <span className="text-xs sm:text-sm text-accent-gold font-semibold">Corporate Gifting</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="https://www.brownsugarbakerychicago.com"
                className="hover:text-[#D4AF37] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Main Site
              </Link>
            </nav>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:bg-[#D67A2E] rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`Cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-white text-[#E98D3D] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                {itemCount}
              </span>
            </button>
            <button
              className="md:hidden p-2 hover:bg-[#D67A2E] rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav id="mobile-menu" className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4" role="navigation" aria-label="Mobile navigation">
            <Link 
              href="https://www.brownsugarbakerychicago.com" 
              className="block py-2 hover:text-[#D4AF37] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Main Site
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
