import { NextResponse } from 'next/server';
import { fetchProductByHandle } from '@/lib/shopify';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await fetchProductByHandle(slug);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found', product: null },
        { status: 404 }
      );
    }

    // Transform to include all necessary fields
    const formattedProduct = {
      id: product.id,
      title: product.title,
      slug: product.slug || product.id,
      description: product.description,
      descriptionHtml: (product as any).descriptionHtml || product.description,
      price: product.price,
      image: product.image,
      images: (product as any).images || [product.image],
      inventory: product.inventory,
      variantId: product.variantId,
      availableForTiers: product.availableForTiers,
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', product: null },
      { status: 500 }
    );
  }
}
