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
        { error: 'Package not found', package: null },
        { status: 404 }
      );
    }

    // Transform to the format expected by the frontend
    const formattedPackage = {
      id: product.id,
      name: product.title,
      slug: product.slug || product.id,
      description: product.description,
      descriptionHtml: (product as any).descriptionHtml || product.description,
      longDescription: product.description,
      price: product.price,
      image: product.image,
      images: (product as any).images || [product.image],
      includes: [],
      variantId: product.variantId,
    };

    return NextResponse.json({ package: formattedPackage });
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package', package: null },
      { status: 500 }
    );
  }
}
