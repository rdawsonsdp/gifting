'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#E98D3D] text-white shadow-md sticky top-0 z-50 safe-area-top">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 sm:space-x-4 min-w-0 group hover:opacity-90 transition-opacity">
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
            <div className="flex flex-row items-center gap-2 sm:gap-3 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-[var(--font-playfair)] text-white truncate">
                Brown Sugar Bakery
              </h1>
              <span className="text-lg sm:text-xl md:text-2xl font-bold font-[var(--font-playfair)] text-white whitespace-nowrap">
                Corporate Gifting
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="https://www.brownsugarbakerychicago.com" 
              className="hover:opacity-80 transition-opacity flex items-center"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Main Site"
            >
              <div className="relative flex-shrink-0" style={{ 
                height: '121px',
              }}>
                <Image
                  src="/images/bsb-horizontal-logo-full-color-rgb_600x.svg"
                  alt="Brown Sugar Bakery"
                  width={600}
                  height={200}
                  className="h-full w-auto object-contain"
                  priority
                />
              </div>
            </Link>
          </nav>
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
        {mobileMenuOpen && (
          <nav id="mobile-menu" className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4" role="navigation" aria-label="Mobile navigation">
            <Link 
              href="https://www.brownsugarbakerychicago.com" 
              className="flex items-center py-2 hover:opacity-80 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Visit Main Site"
            >
              <div className="relative flex-shrink-0" style={{ 
                height: '121px',
              }}>
                <Image
                  src="/images/bsb-horizontal-logo-full-color-rgb_600x.svg"
                  alt="Brown Sugar Bakery"
                  width={600}
                  height={200}
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
