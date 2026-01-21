import { NextResponse } from 'next/server';
import { fetchSpecialOfferProducts } from '@/lib/shopify';

export async function GET() {
  try {
    const products = await fetchSpecialOfferProducts();

    return NextResponse.json({
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching special offer products:', error);

    // Return empty array on error (graceful degradation)
    return NextResponse.json({
      products: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
