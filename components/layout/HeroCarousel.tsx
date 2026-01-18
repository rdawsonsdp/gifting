'use client';

import { useState, useEffect } from 'react';

// Brown Sugar Bakery hero images
const HERO_IMAGES = [
  {
    src: '/images/BSB-Postcard-Cover-Museum.png',
    alt: 'Brown Sugar Bakery - Chicago Skyline with Field Museum',
  },
  {
    src: '/images/BSB-Postcard-Bridges.png',
    alt: 'Brown Sugar Bakery - Chicago River with Drawbridges',
  },
  {
    src: '/images/BSB-Postcard-fountain.png',
    alt: 'Brown Sugar Bakery - Buckingham Fountain',
  },
];

interface HeroCarouselProps {
  className?: string;
  autoRotateInterval?: number; // milliseconds
}

export default function HeroCarousel({ 
  className = '', 
  autoRotateInterval = 5000 
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        setIsTransitioning(false);
      }, 500); // Half of transition duration
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotateInterval]);

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      {HERO_IMAGES.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'
          }`}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
            onError={(e) => {
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          {/* Fallback gradient overlay for each image */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-brown/30 via-accent-gold/20 to-primary-brown/30"></div>
        </div>
      ))}
      
      {/* Carousel indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3] flex gap-2">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, 500);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-accent-gold'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
