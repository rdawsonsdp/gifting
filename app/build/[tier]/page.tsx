'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTierBySlug } from '@/lib/tiers';
import { useGift } from '@/context/GiftContext';
import { Product } from '@/lib/types';
import ProductCard from '@/components/gift-builder/ProductCard';
import PackageCard from '@/components/gift-builder/PackageCard';
import BudgetMeter from '@/components/gift-builder/BudgetMeter';
import { PACKAGES, GiftPackage } from '@/lib/packages';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

export default function BuildPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch, getCurrentTotal, canProceedToRecipients } = useGift();
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState(state.recipients.length || 1);

  const tierSlug = params.tier as string;
  const tier = getTierBySlug(tierSlug);

  useEffect(() => {
    if (tier) {
      dispatch({ type: 'SELECT_TIER', payload: tier });
    }
  }, [tier, dispatch]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const filteredProducts = data.products.filter((p: Product) =>
          p.availableForTiers.includes(tier?.id || '') || p.availableForTiers.length === 0
        );
        setProducts(filteredProducts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Unable to load products from Shopify: ${errorMessage}. Please check your Shopify configuration.`);
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    async function fetchPackages() {
      try {
        const response = await fetch('/api/packages');
        if (response.ok) {
          const data = await response.json();
          if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
            setPackages(data.packages);
          } else {
            setPackages(PACKAGES);
          }
        } else {
          setPackages(PACKAGES);
        }
      } catch {
        setPackages(PACKAGES);
      }
    }

    if (tier) {
      fetchProducts();
      fetchPackages();
    }
  }, [tier]);

  if (!tier) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Alert variant="error">Invalid tier selected. Please choose a tier from the home page.</Alert>
      </div>
    );
  }

  const currentTotal = getCurrentTotal();
  const currentTier = state.selectedTier || tier;

  // Filter packages that fit within this tier's budget
  const filteredPackages = packages.filter(pkg => pkg.price <= currentTier.maxSpend);

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

  const isProductDisabled = (_product: Product) => {
    return false;
  };

  const handleContinue = () => {
    if (canProceedToRecipients()) {
      router.push('/recipients');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 lg:mb-12 relative animate-fade-up">
        {/* Background decorative blur */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-brown/5 rounded-full blur-[80px] -z-10"></div>
        
        <Badge variant={tier.id as 'bronze' | 'silver' | 'gold' | 'platinum'} className="mb-3 sm:mb-4 animate-scale-in">
          {tier.name} Tier
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-brown mb-2 font-display">
          Build Your Gift
        </h1>
        <p className="text-sm sm:text-base text-charcoal/70">
          Starting budget: <span className="font-semibold text-primary-brown">${tier.minSpend}+</span> per recipient. Add as many items as you like.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Product Grid */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <BudgetMeter
            minBudget={tier.minSpend}
            maxBudget={tier.maxSpend}
            currentSpend={currentTotal}
          />

          {error && (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          )}

          {/* Products Section Header */}
          <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 animate-fade-up">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-primary-brown mb-2">
              Select Your Products
            </h2>
            <p className="text-sm sm:text-base text-charcoal/70">
              Choose from our handcrafted selection to build your perfect gift
            </p>
          </div>

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
          ) : (products.length === 0 && filteredPackages.length === 0) ? (
            <Alert variant="info" className="mt-6 sm:mt-8">
              No products available for this tier. Please check back later.
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPackages.map((pkg, index) => (
                <div key={pkg.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PackageCard package={pkg} />
                </div>
              ))}
              {products.map((product, index) => (
                <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${(filteredPackages.length + index) * 0.1}s` }}>
                  <ProductCard
                    product={product}
                    currentQuantity={getProductQuantity(product.id)}
                    onAdd={handleAddProduct}
                    onRemove={handleRemoveProduct}
                    disabled={isProductDisabled(product)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Items Panel - E-commerce Cart Style */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card className="sticky top-20 sm:top-24 lg:top-4 mb-6 lg:mb-0 animate-scale-in delay-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-primary-brown">
                Your Gift
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
                  Add products to build your gift
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
                          Qty: {sp.quantity} × ${sp.product.price.toFixed(2)}
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
                    <span>${currentTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-light-brown mt-1">
                    Suggested budget: ${tier.minSpend}+
                  </p>
                </div>

                {/* Recipient Count */}
                <div className="border-t border-light-brown/30 pt-3 sm:pt-4 mb-3 sm:mb-4">
                  <label className="text-xs font-semibold text-primary-brown uppercase tracking-wide mb-2 block">
                    Number of Recipients
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRecipientCount(Math.max(1, recipientCount - 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-light-brown/30 text-charcoal/70 hover:bg-cream transition-colors text-lg font-medium"
                      aria-label="Decrease recipients"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={recipientCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) setRecipientCount(val);
                      }}
                      className="flex-1 text-center font-bold text-primary-brown text-lg border border-light-brown/30 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-gold/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setRecipientCount(recipientCount + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-light-brown/30 text-charcoal/70 hover:bg-cream transition-colors text-lg font-medium"
                      aria-label="Increase recipients"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick-select presets */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[10, 25, 50, 100, 250, 500].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRecipientCount(n)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          recipientCount === n
                            ? 'bg-primary-brown text-white'
                            : 'bg-cream text-charcoal/70 hover:bg-accent-gold/20 hover:text-primary-brown'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-3 p-3 bg-cream/50 rounded-xl">
                    <div className="flex justify-between text-xs text-charcoal/70 mb-1">
                      <span>{recipientCount} recipient{recipientCount !== 1 ? 's' : ''} × ${currentTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-display font-bold text-primary-brown text-lg">
                      <span>Order Est.</span>
                      <span>${(currentTotal * recipientCount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!canProceedToRecipients()}
                  className="w-full btn-primary"
                >
                  Continue to Delivery
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
