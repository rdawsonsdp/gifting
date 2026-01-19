# Corporate Gifting Collection Not Found

## Current Status

The "Corporate Gifting Collection" doesn't appear to exist in your Shopify store yet.

## Options

### Option 1: Create the Collection (Recommended)

1. Go to Shopify Admin: `https://admin.shopify.com/store/brown-sugar-bakery-chicago`
2. Navigate to **Products** → **Collections**
3. Click **"Create collection"**
4. Name it: **"Corporate Gifting Collection"**
5. Add products to the collection
6. Save the collection
7. Note the collection handle (usually `corporate-gifting-collection` or `corporate-gifting`)
8. Update `.env.local`:
   ```bash
   SHOPIFY_COLLECTION_HANDLE=corporate-gifting-collection
   ```

### Option 2: Use an Existing Collection

If you want to use an existing collection, here are some options from your store:

- `chocolates` - "Chocolates"
- `candies` - "Our Classic Candy Collection"
- `shipping-candies` - "Shipping Candies"
- `nationwide-shipping-candies` - "Nationwide Shipping Candies"

To use one of these, update `.env.local`:
```bash
SHOPIFY_COLLECTION_HANDLE=chocolates
# or
SHOPIFY_COLLECTION_HANDLE=candies
# etc.
```

### Option 3: Check All Collections

If the collection exists but wasn't found, check:
1. Is it published?
2. Is it visible in the store?
3. Does it have a different name?

You can see all collections in Shopify Admin → Products → Collections.

## After Setting Up

Once you have the collection handle, update `.env.local` and restart your dev server:

```bash
# Update .env.local with the correct handle
SHOPIFY_COLLECTION_HANDLE=your-handle-here

# Restart dev server (if needed)
```

Then test:
```bash
curl http://localhost:3000/api/products
```
