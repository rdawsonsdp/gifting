# Archived Files

This directory contains deprecated files that are no longer used by the application.

## products.json.deprecated

**Status:** Deprecated - No longer used  
**Date Archived:** January 2026  
**Reason:** Application now fetches all products dynamically from Shopify's "Candy Collection" via API

### Migration Notes

- All product data is now fetched from Shopify in real-time
- No static product fallbacks are used
- Products are pulled from the "Candy Collection" collection
- Configuration via `SHOPIFY_COLLECTION_HANDLE` environment variable

### If You Need to Restore

If you need to restore static products for any reason:

1. Move `products.json.deprecated` back to `lib/products.json`
2. Update `app/api/products/route.ts` to include fallback logic
3. Note: This is not recommended as it goes against the current architecture
