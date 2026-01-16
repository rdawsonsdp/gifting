# Products Data

This directory contains static product data extracted from the Brown Sugar Bakery Shopify export for MVP testing.

## File Structure

- `products.json` - Static product catalog with individual products and gift packages
- `parse-products.js` - Script to regenerate products.json from CSV export

## Product Data Source

Products are extracted from `/Users/robd/Downloads/products_export_1.csv` which contains the full Shopify product catalog.

## Product Selection Criteria

Products included are suitable for corporate gifting:
- Chocolates (Tortues, Melt-A-Ways, Sea Salt Caramels)
- Mini Cupcakes (24 and 48 count)
- Pound Cakes
- Gift boxes and assortments
- Smaller cakes suitable for shipping

Products excluded:
- Large cakes over $100 (unless specifically for shipping)
- Draft/unpublished products
- Test products
- Products without valid pricing

## Tier Assignment

Products are automatically assigned to tiers based on price:
- **Bronze** ($15-25): 16 products
- **Silver** ($35-50): 15 products  
- **Gold** ($75-100): 18 products
- **Platinum** ($150-250): 10 products

## Gift Packages

The script creates 7 logical gift packages:
- Bronze: Chocolate Sampler Box, Caramel Collection
- Silver: Premium Chocolate Gift Box, Mini Cupcake Variety Pack
- Gold: Deluxe Chocolate Assortment, Mini Cupcake Party Pack
- Platinum: Executive Gift Basket

## Regenerating Products

To regenerate `products.json` from a new CSV export:

```bash
# Update the csvPath in scripts/parse-products.js
node scripts/parse-products.js
```

## API Usage

The `/api/products` route automatically loads products from this JSON file when Shopify is not configured. Products are filtered by tier in the gift builder page.

## Product Structure

Each product follows this structure:
```typescript
{
  id: string;                    // Product handle/ID
  title: string;                 // Product name
  description: string;           // Product description (HTML stripped)
  price: number;                 // Price in USD
  image: string;                 // Image URL from Shopify CDN
  availableForTiers: string[];  // Array of tier IDs (bronze, silver, gold, platinum)
  inventory: number;            // Inventory count (default: 100)
  variantId?: string;           // Shopify variant ID (for order creation)
  handle: string;                // Product handle/slug
}
```

## Notes

- Images are loaded from Shopify CDN URLs
- Variant IDs are extracted from CSV or auto-generated
- Products without variantId will use auto-generated IDs for testing
- When Shopify is configured, the API will fetch live products instead
