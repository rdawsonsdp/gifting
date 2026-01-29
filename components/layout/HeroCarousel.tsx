'use client';

import { useState, useEffect } from 'react';

// Candy folder images
const HERO_IMAGES = [
  { src: '/images/candy/15 piece Assorted Cream.png', alt: 'Brown Sugar Bakery - 15 Piece Assorted Cream' },
  { src: '/images/candy/Assorted Creams Feature.jpeg', alt: 'Brown Sugar Bakery - Assorted Creams' },
  { src: '/images/candy/Assorted Tortues Feature.jpeg', alt: 'Brown Sugar Bakery - Assorted Tortues' },
  { src: '/images/candy/BSB-Mint-Meltaway-15pk-Labeled-Final.webp', alt: 'Brown Sugar Bakery - Mint Meltaway 15 Pack' },
  { src: '/images/candy/BSB-Mint-Meltaway-24pk-Final.webp', alt: 'Brown Sugar Bakery - Mint Meltaway 24 Pack Box' },
  { src: '/images/candy/BSB-Mint-Meltaway-24pk-Labeled-Final.webp', alt: 'Brown Sugar Bakery - Mint Meltaway 24 Pack' },
  { src: '/images/candy/Meltaways feature.jpeg', alt: 'Brown Sugar Bakery - Meltaways' },
  { src: '/images/candy/Sea Salt Caramels Feature.jpeg', alt: 'Brown Sugar Bakery - Sea Salt Caramels' },
  { src: '/images/candy/Tortues assorted 12pc open box.jpeg', alt: 'Brown Sugar Bakery - Tortues Assorted 12 Piece' },
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
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
      
    </div>
  );
}
