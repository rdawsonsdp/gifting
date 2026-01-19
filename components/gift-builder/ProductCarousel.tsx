'use client';

'use client';

import { useEffect, useState, useRef } from 'react';
import { Product } from '@/lib/types';

interface ProductCarouselProps {
  autoScroll?: boolean;
  scrollInterval?: number;
}

export default function ProductCarousel({ 
  autoScroll = true, 
  scrollInterval = 3000 
}: ProductCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          if (data.products && Array.isArray(data.products)) {
            // Filter to show a good variety - prioritize products with images
            const productsWithImages = data.products
              .filter((p: Product) => p.image && p.image.trim() !== '')
              .slice(0, 12); // Show up to 12 products
            setProducts(productsWithImages);
          } else {
            console.error('Invalid products data format:', data);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch products from Shopify:', errorData.message || errorData.error);
          // Set empty products array so the "no products" message shows
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products from Shopify:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll || products.length === 0 || !carouselRef.current) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, products.length - 4);
        const nextIndex = (prev + 1) % (maxIndex + 1);
        
        // Smooth scroll to next position
        if (carouselRef.current) {
          const cardWidth = 280; // w-64 (256px) + gap (24px) = ~280px
          carouselRef.current.scrollTo({
            left: nextIndex * cardWidth,
            behavior: 'smooth',
          });
        }
        
        return nextIndex;
      });
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, scrollInterval, products.length]);

  if (loading) {
    return (
      <div className="py-8 sm:py-12">
        <div className="flex gap-4 sm:gap-6 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 sm:w-80 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    // Don't hide the carousel - show a message instead
    return (
      <div className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary-brown uppercase tracking-wider mb-3">
              Our Products
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary-brown mb-3 sm:mb-4">
              Handcrafted Corporate Gifts
            </h2>
            <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
              <p className="text-charcoal/70 mb-2">
                Products are loading from Shopify...
              </p>
              <p className="text-sm text-charcoal/50">
                If products don't appear, please check your Shopify configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 lg:py-16 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-[80px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-brown/5 rounded-full blur-[100px] -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 animate-fade-up">
          <p className="text-sm font-semibold text-primary-brown uppercase tracking-wider mb-3">
            Our Products
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary-brown mb-3 sm:mb-4">
            Handcrafted Corporate Gifts
          </h2>
          <p className="text-base sm:text-lg text-charcoal/70 max-w-2xl mx-auto">
            Discover our premium selection of artisanal chocolates, cakes, and sweet treats
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scrollable Product Grid */}
          <div 
            ref={carouselRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-64 sm:w-72 lg:w-80 snap-start"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="glass-card rounded-2xl overflow-hidden hover-lift h-full flex flex-col group">
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-cream to-lavender/30 overflow-hidden relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover img-zoom"
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1.5 bg-accent-gold text-primary-brown rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-5 flex-grow flex flex-col">
                    <h3 className="font-display font-bold text-primary-brown text-base sm:text-lg mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal/70 line-clamp-2 flex-grow mb-3">
                      {product.description}
                    </p>
                    
                    {/* Tier Badges */}
                    {product.availableForTiers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {product.availableForTiers.slice(0, 2).map((tier) => {
                          const tierColors: Record<string, string> = {
                            bronze: 'bg-[#CD7F32]',
                            silver: 'bg-gray-400',
                            gold: 'bg-accent-gold',
                            platinum: 'bg-[#E5E4E2]',
                          };
                          return (
                            <span
                              key={tier}
                              className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${
                                tierColors[tier] || 'bg-primary-brown'
                              }`}
                            >
                              {tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </span>
                          );
                        })}
                        {product.availableForTiers.length > 2 && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary-brown/20 text-primary-brown">
                            +{product.availableForTiers.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          {products.length > 4 && (
            <div className="flex justify-center gap-2 mt-6 sm:mt-8">
              {Array.from({ length: Math.min(products.length - 3, 5) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-accent-gold'
                      : 'w-2 bg-light-brown/50 hover:bg-light-brown/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
