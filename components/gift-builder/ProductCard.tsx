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
    <Card className="flex flex-col h-full">
      <div className="aspect-square bg-gray-200 rounded-lg mb-3 sm:mb-4 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-[#5D4037] mb-2 text-sm sm:text-base line-clamp-2">{product.title}</h3>
      <p className="text-xs sm:text-sm text-[#333333] mb-3 sm:mb-4 flex-grow line-clamp-2">
        {product.description}
      </p>
      
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <span className="text-base sm:text-lg font-bold text-[#5D4037]">
          ${product.price.toFixed(2)}
        </span>
        {product.inventory < 10 && (
          <span className="text-xs text-[#E53935]">Low Stock</span>
        )}
      </div>

      {currentQuantity > 0 ? (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            onClick={() => onRemove(product.id)}
            className="px-3 sm:px-4 py-2 min-h-[44px] flex-1"
          >
            -
          </Button>
          <span className="font-semibold text-[#5D4037] text-sm sm:text-base min-w-[2rem] text-center">{currentQuantity}</span>
          <Button
            variant="secondary"
            onClick={() => onAdd(product)}
            disabled={disabled}
            className="px-3 sm:px-4 py-2 min-h-[44px] flex-1"
          >
            +
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => onAdd(product)}
          disabled={disabled}
          className="w-full"
        >
          Add to Gift
        </Button>
      )}
    </Card>
  );
}
