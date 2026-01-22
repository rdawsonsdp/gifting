import { NextResponse } from 'next/server';
import { fetchGiftPackages } from '@/lib/shopify';

// Helper to determine tier from tags or price
function getTier(tags: string[], price: number): string | null {
  // First check tags
  const lowerTags = tags.map(t => t.toLowerCase());
  if (lowerTags.includes('gold')) return 'gold';
  if (lowerTags.includes('silver')) return 'silver';
  if (lowerTags.includes('bronze')) return 'bronze';

  // Fall back to price-based tiers if no tags
  if (price >= 100) return 'gold';
  if (price >= 60) return 'silver';
  if (price > 0) return 'bronze';

  return null;
}

export async function GET() {
  try {
    const packages = await fetchGiftPackages();

    // Transform to the format expected by the frontend
    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.title,
      slug: pkg.slug || pkg.id,
      description: pkg.description,
      longDescription: pkg.description,
      price: pkg.price,
      image: pkg.image,
      includes: [],
      variantId: pkg.variantId,
      tier: getTier(pkg.availableForTiers || [], pkg.price),
    }));

    return NextResponse.json({ packages: formattedPackages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages', packages: [] },
      { status: 500 }
    );
  }
}
