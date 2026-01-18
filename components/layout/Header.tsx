'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#5D4037] text-white shadow-md sticky top-0 z-50 safe-area-top">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center min-w-0 group hover:opacity-90 transition-opacity">
            <div className="relative h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 flex-shrink-0">
              <Image
                src="/images/bsb-logo-full-color-cmyk-518px@300ppi.jpg"
                alt="Brown Sugar Bakery"
                width={96}
                height={96}
                className="h-full w-full object-contain"
                priority
              />
            </div>
          </Link>
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
            className="md:hidden p-2 hover:bg-[#4A3329] rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
