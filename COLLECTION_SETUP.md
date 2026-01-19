# Corporate Gifting Collection Setup Guide

## Overview

The application is now configured to fetch products from the **"Corporate Gifting Collection"** in your Shopify store. Both the homepage carousel and the gift builder will display products from this collection.

## Finding Your Collection Handle

Shopify collections use a "handle" (URL-friendly name) instead of the display name. To find your collection handle:

1. Go to your Shopify Admin: `https://admin.shopify.com/store/brown-sugar-bakery-chicago`
2. Navigate to **Products** → **Collections**
3. Find your "Corporate Gifting Collection"
4. Click on it to open
5. Look at the URL - it will show something like:
   ```
   https://admin.shopify.com/store/.../collections/1234567890
   ```
   Or check the collection settings for the "Search engine listing" section which shows the handle

**Common handle formats:**
- "Corporate Gifting Collection" → typically becomes `corporate-gifting-collection` or `corporate-gifting`
- Handles are lowercase with hyphens instead of spaces
- Special characters are removed or replaced

## Updating the Collection Handle

If your collection handle is different from `corporate-gifting-collection`, update the `.env.local` file:

```env
SHOPIFY_COLLECTION_HANDLE=your-actual-handle-here
```

For example:
- If your collection is named "Corporate Gifting Collection" → handle is likely `corporate-gifting-collection` or `corporate-gifting`
- If your collection is named "Corporate Gifting" → handle might be `corporate-gifting`
- If your collection is named "Corporate Gifts" → handle might be `corporate-gifts`

## Testing

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check the homepage carousel - it should show products from your Candy Collection

3. Go to a tier builder page (e.g., `/build/bronze`) - products should load from the collection

## Troubleshooting

### "Collection not found" error
- Verify the collection handle in `.env.local` matches your Shopify collection
- Check that the collection exists and is published
- Ensure the collection has products added to it

### Products not showing
- Make sure products are added to the "Candy Collection" in Shopify
- Check that products have images (carousel prioritizes products with images)
- Verify your Shopify API token has `read_products` scope

### Wrong products showing
- Double-check the collection handle spelling
- Verify products are actually in the "Candy Collection" in Shopify admin

## Current Configuration

- **Collection Handle**: `candy-collection` (default, can be overridden in `.env.local`)
- **API Endpoint**: `/api/products`
- **Used By**: 
  - Homepage Product Carousel
  - Gift Builder pages (`/build/[tier]`)

## Next Steps

1. Verify your collection handle matches `candy-collection` or update `.env.local`
2. Ensure products are added to the Candy Collection in Shopify
3. Restart the dev server to load the new configuration
4. Test the homepage carousel and gift builder
