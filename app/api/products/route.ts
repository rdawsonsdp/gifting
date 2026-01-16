import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Product } from '@/lib/types';

// Load static products from JSON file
function loadStaticProducts(): Product[] {
  try {
    const filePath = join(process.cwd(), 'lib', 'products.json');
    const fileContents = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContents);
    return data.products || [];
  } catch (error) {
    console.error('Error loading static products:', error);
    return [];
  }
}

export async function GET() {
  try {
    // Try to fetch from Shopify first (if configured)
    const { fetchGiftProducts } = await import('@/lib/shopify');
    const products = await fetchGiftProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.log('Shopify not configured, using static products');
    
    // Use static products from JSON file
    const products = loadStaticProducts();
    
    if (products.length === 0) {
      // Fallback to minimal mock products if JSON file fails
      const mockProducts: Product[] = [
        {
          id: '1',
          title: 'Assorted Chocolates',
          description: 'A delightful mix of handcrafted chocolates',
          price: 12.99,
          image: '',
          availableForTiers: [],
          inventory: 100,
        },
        {
          id: '2',
          title: 'Caramel Collection',
          description: 'Rich, creamy caramels in various flavors',
          price: 15.99,
          image: '',
          availableForTiers: [],
          inventory: 50,
        },
      ];
      return NextResponse.json({ products: mockProducts });
    }
    
    return NextResponse.json({ products });
  }
}
