import { NextResponse } from 'next/server';
import { Product } from '@/lib/types';

export async function GET() {
  try {
    // Fetch products from Shopify Candy Collection
    const { fetchGiftProducts } = await import('@/lib/shopify');
    const products = await fetchGiftProducts();
    
    if (products.length === 0) {
      return NextResponse.json(
        { 
          error: 'No products found in Candy Collection',
          message: 'Please ensure products are added to the Candy Collection in Shopify'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products from Shopify:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products from Shopify',
        message: errorMessage,
        details: 'Please verify your Shopify configuration and that the Candy Collection exists'
      },
      { status: 500 }
    );
  }
}
