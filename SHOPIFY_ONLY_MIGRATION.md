# Shopify-Only Product Migration

## Summary

The application has been migrated to fetch **all products exclusively from Shopify's "Candy Collection"**. Static product files and fallbacks have been removed.

## Changes Made

### ✅ Removed Static Product Fallbacks

1. **API Route (`app/api/products/route.ts`)**
   - Removed `loadStaticProducts()` function
   - Removed all static JSON file imports
   - Removed mock product fallbacks
   - Now **only** fetches from Shopify Candy Collection
   - Returns proper error responses if Shopify is unavailable

2. **Gift Builder Page (`app/build/[tier]/page.tsx`)**
   - Removed `getMockProducts()` function
   - Removed mock product fallback
   - Shows clear error messages if Shopify products can't be loaded
   - Requires Shopify connection to function

3. **Product Carousel (`components/gift-builder/ProductCarousel.tsx`)**
   - Enhanced error handling for Shopify API failures
   - Better logging for debugging

4. **Archived Files**
   - Moved `lib/products.json` → `lib/archived/products.json.deprecated`
   - Created archive documentation

### ✅ Shopify Integration

- All products fetched from **"Candy Collection"** collection
- Collection handle configurable via `SHOPIFY_COLLECTION_HANDLE` environment variable
- Products include:
  - Title, description, price
  - Images (featured image)
  - Variant IDs (for draft order creation)
  - Inventory quantities
  - Tier tags (bronze, silver, gold, platinum)

## Configuration Required

### Environment Variables

Ensure these are set in `.env.local`:

```env
SHOPIFY_STORE_DOMAIN=brown-sugar-bakery-chicago.myshopify.com
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_COLLECTION_HANDLE=candy-collection
```

### Shopify Setup

1. **Collection Required**: "Candy Collection" must exist in Shopify
2. **Products**: Add products to the collection
3. **API Scopes**: Ensure these scopes are enabled:
   - `read_products`
   - `write_draft_orders`
   - `read_draft_orders`

## Error Handling

### API Errors

- **404**: Collection not found or has no products
- **500**: Shopify API error or configuration issue
- Clear error messages guide troubleshooting

### Frontend Errors

- Gift builder shows error messages if products can't load
- Product carousel gracefully handles missing products
- No silent failures - all errors are logged

## Testing

1. **Verify Collection Handle**
   ```bash
   # Check your .env.local
   cat .env.local | grep SHOPIFY_COLLECTION_HANDLE
   ```

2. **Test API Endpoint**
   ```bash
   curl http://localhost:3000/api/products
   ```

3. **Check Browser Console**
   - Open browser dev tools
   - Check for any Shopify API errors
   - Verify products are loading

## Rollback (If Needed)

If you need to restore static products temporarily:

1. Restore archived file:
   ```bash
   mv lib/archived/products.json.deprecated lib/products.json
   ```

2. Re-add fallback logic to `app/api/products/route.ts`
3. **Note**: This is not recommended - static products will be out of sync with Shopify

## Benefits

✅ **Real-time product data** - Always up-to-date with Shopify  
✅ **Single source of truth** - No sync issues between static files and Shopify  
✅ **Easier maintenance** - Update products in Shopify, no code changes needed  
✅ **Better error handling** - Clear messages when Shopify is unavailable  
✅ **Scalable** - Handles any number of products in the collection  

## Next Steps

1. ✅ Verify Candy Collection exists in Shopify
2. ✅ Ensure products are added to the collection
3. ✅ Test the application with real Shopify products
4. ✅ Monitor for any API errors or issues
