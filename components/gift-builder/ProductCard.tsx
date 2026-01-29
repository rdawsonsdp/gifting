'use client';

import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  currentQuantity: number;
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
  disabled: boolean;
}

export default function ProductCard({
  product,
  currentQuantity,
  onAdd,
  onRemove,
  disabled,
}: ProductCardProps) {
  const router = useRouter();

  const handleImageClick = () => {
    if (product.slug) {
      router.push(`/product/${product.slug}`);
    }
  };

  return (
    <Card className="flex flex-col h-full hover-lift group relative overflow-hidden">
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-brown/5 via-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>

      <div className="relative z-10">
        <div
          className="aspect-square bg-gray-200 rounded-lg mb-3 sm:mb-4 overflow-hidden relative cursor-pointer"
          onClick={handleImageClick}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover img-zoom"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-cream to-lavender/30">
              <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Click for details indicator */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2 shadow-lg">
              <svg className="w-5 h-5 text-primary-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <h3 className="font-display font-semibold text-primary-brown mb-2 text-sm sm:text-base line-clamp-2">{product.title}</h3>
        <p className="text-xs sm:text-sm text-charcoal/70 mb-3 sm:mb-4 flex-grow line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-lg sm:text-xl font-display font-bold text-primary-brown">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {currentQuantity > 0 ? (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="secondary"
              onClick={() => onRemove(product.id)}
              className="px-3 sm:px-4 py-2 min-h-[44px] flex-1 hover-lift"
            >
              -
            </Button>
            <span className="font-display font-bold text-primary-brown text-base sm:text-lg min-w-[2rem] text-center">{currentQuantity}</span>
            <Button
              variant="secondary"
              onClick={() => onAdd(product)}
              disabled={disabled}
              className="px-3 sm:px-4 py-2 min-h-[44px] flex-1 hover-lift"
            >
              +
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => onAdd(product)}
            disabled={disabled}
            className="w-full btn-primary"
          >
            Add to Gift
          </Button>
        )}
      </div>
    </Card>
  );
}
