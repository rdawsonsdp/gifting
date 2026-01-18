# Implementation Notes

## Product Carousel - Shopify Collection Integration

### Current Implementation
The product carousel (`components/gift-builder/ProductCarousel.tsx`) currently fetches products from the `/api/products` endpoint, which uses static product data from `lib/products.json`.

### Future Enhancement Required

**Feature:** Pull product images from a Shopify Collection instead of static JSON data.

**Requirements:**
1. Create or identify a Shopify Collection specifically for corporate gifting products
2. Update the `/api/products` route to fetch products from the Shopify Collection
3. Ensure the carousel displays products from the designated Shopify Collection
4. Maintain backward compatibility with static data as fallback
5. Cache Shopify product data appropriately to reduce API calls
6. Handle loading states and error handling for Shopify API calls

**Technical Considerations:**
- Use Shopify Admin API or Storefront API to fetch collection products
- Collection handle/ID should be configurable via environment variable
- Filter products to only show those with valid images
- Maintain the same product structure (`Product` interface) for compatibility
- Consider rate limiting and API quota management
- Add error handling for Shopify API failures (fallback to static data)

**Environment Variables Needed:**
```env
SHOPIFY_COLLECTION_HANDLE=corporate-gifting
# or
SHOPIFY_COLLECTION_ID=123456789
```

**Files to Modify:**
- `app/api/products/route.ts` - Add Shopify Collection fetching logic
- `lib/shopify.ts` - Add function to fetch products from collection
- `components/gift-builder/ProductCarousel.tsx` - May need updates for error handling

**Priority:** Medium
**Estimated Effort:** 2-4 hours
**Dependencies:** Shopify API credentials and collection setup

---

## Other Implementation Notes

### Email Configuration
See `EMAIL_SETUP.md` for SMTP configuration details.

### Product Data Management
See `lib/PRODUCTS_README.md` for product data structure and management.
