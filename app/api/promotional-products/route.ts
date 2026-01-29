import { NextResponse } from 'next/server';
import { fetchPromotionalProducts } from '@/lib/shopify';

export async function GET() {
  try {
    const products = await fetchPromotionalProducts();

    return NextResponse.json({
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching promotional products:', error);

    return NextResponse.json({
      products: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
