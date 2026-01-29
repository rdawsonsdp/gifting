'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/context/GiftContext';
import { Product } from '@/lib/types';
import ProductCard from '@/components/gift-builder/ProductCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function PromotionalPage() {
  const router = useRouter();
  const { state, dispatch, getCurrentTotal, canProceedToRecipients } = useGift();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set the step to promotional on mount
  useEffect(() => {
    dispatch({ type: 'SET_STEP', payload: 'promotional' });
  }, [dispatch]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/promotional-products');
        if (!response.ok) {
          throw new Error('Failed to fetch promotional products');
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Unable to load promotional products: ${errorMessage}`);
        console.error('Error fetching promotional products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const currentTotal = getCurrentTotal();

  const handleAddProduct = (product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const handleRemoveProduct = (productId: string) => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: productId });
  };

  const getProductQuantity = (productId: string) => {
    const selected = state.selectedProducts.find(sp => sp.product.id === productId);
    return selected?.quantity || 0;
  };

  const handleContinue = () => {
    if (canProceedToRecipients()) {
      router.push('/recipients');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 lg:mb-12 animate-fade-up">
        <p className="text-sm font-semibold text-primary-brown uppercase tracking-wider mb-2">
          Personalized & Promotional
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-brown mb-2 font-display">
          Branded Merchandise & Custom Gifts
        </h1>
        <p className="text-sm sm:text-base text-charcoal/70 max-w-2xl">
          Browse our selection of customizable and branded items. Add as many as you like — no budget constraints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Product Grid */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Alert variant="info" className="mt-6 sm:mt-8">
              No promotional products available. Please check back later.
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard
                    product={product}
                    currentQuantity={getProductQuantity(product.id)}
                    onAdd={handleAddProduct}
                    onRemove={handleRemoveProduct}
                    disabled={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card className="sticky top-20 sm:top-24 lg:top-4 mb-6 lg:mb-0 animate-scale-in delay-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-primary-brown">
                Your Selection
              </h2>
              {state.selectedProducts.length > 0 && (
                <span className="px-2 py-1 bg-accent-gold/20 text-primary-brown rounded-full text-xs font-bold">
                  {state.selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0)} items
                </span>
              )}
            </div>

            {state.selectedProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-sm text-light-brown">
                  Add products to your gift selection
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                  {state.selectedProducts.map((sp) => (
                    <div key={sp.product.id} className="flex justify-between items-start border-b border-light-brown/20 pb-2 sm:pb-3 hover:bg-cream/50 rounded px-2 -mx-2 transition-colors">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-display font-semibold text-primary-brown text-xs sm:text-sm truncate">
                          {sp.product.title}
                        </p>
                        <p className="text-xs text-light-brown">
                          Qty: {sp.quantity} x ${sp.product.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-display font-bold text-primary-brown text-sm sm:text-base whitespace-nowrap">
                        ${(sp.product.price * sp.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-light-brown/30 pt-3 sm:pt-4 mb-3 sm:mb-4">
                  <div className="flex justify-between text-base sm:text-lg font-display font-bold text-primary-brown">
                    <span>Per Recipient:</span>
                    <span className="text-xl">${currentTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!canProceedToRecipients()}
                  className="w-full btn-primary"
                >
                  Continue to Recipients
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
