'use client';

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
  return (
    <Card className="flex flex-col h-full hover-lift group relative overflow-hidden">
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-brown/5 via-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
      
      <div className="relative z-10">
        <div className="aspect-square bg-gray-200 rounded-lg mb-3 sm:mb-4 overflow-hidden relative">
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
          {/* Badge overlay for low stock */}
          {product.inventory < 10 && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-error-red/90 text-white rounded-full text-xs font-bold backdrop-blur-sm">
                Low Stock
              </span>
            </div>
          )}
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
