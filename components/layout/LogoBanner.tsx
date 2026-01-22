'use client';

import { useEffect, useState } from 'react';

interface Logo {
  src: string;
  alt: string;
}

// Client logos - add more logos to /public/logos directory
const DEFAULT_LOGOS: Logo[] = [
  { src: '/logos/cityofchicago.png', alt: 'City of Chicago' },
  { src: '/logos/cdw_logo.png', alt: 'CDW' },
  { src: '/logos/bmo logo.png', alt: 'BMO' },
  { src: '/logos/amazon-logo-amazon-icon-free-free-vector.jpg', alt: 'Amazon' },
];

interface LogoBannerProps {
  title?: string;
  subtitle?: string;
  logos?: Logo[];
}

export default function LogoBanner({
  title = 'Trusted By Leading Companies',
  subtitle = 'We\'re proud to partner with these amazing organizations',
  logos = DEFAULT_LOGOS,
}: LogoBannerProps) {
  const [loadedLogos, setLoadedLogos] = useState<Logo[]>([]);

  useEffect(() => {
    // Filter logos that exist by attempting to load them
    const checkLogos = async () => {
      const validLogos: Logo[] = [];

      for (const logo of logos) {
        try {
          const response = await fetch(logo.src, { method: 'HEAD' });
          if (response.ok) {
            validLogos.push(logo);
          }
        } catch {
          // Logo doesn't exist, skip it
        }
      }

      setLoadedLogos(validLogos);
    };

    checkLogos();
  }, [logos]);

  // Don't render if no logos are available
  if (loadedLogos.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-cream/30 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-up">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-primary-brown mb-2">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-charcoal/60">
            {subtitle}
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 items-center justify-items-center max-w-6xl mx-auto">
          {loadedLogos.map((logo, index) => (
            <div
              key={index}
              className="w-full flex items-center justify-center p-4 sm:p-6 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-12 sm:max-h-16 w-auto object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
