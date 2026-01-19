# Finding Your Corporate Gifting Collection Handle

## Quick Method: Check Shopify Admin

1. Go to: `https://admin.shopify.com/store/brown-sugar-bakery-chicago`
2. Navigate to **Products** → **Collections**
3. Find **"Corporate Gifting Collection"**
4. Click on it
5. Look at the URL - the handle is in the URL or in the collection settings

## Common Handle Variations

The handle for "Corporate Gifting Collection" might be:
- `corporate-gifting-collection`
- `corporate-gifting`
- `corporate-gifts`
- `corporate-gifting-collection-1` (if there are duplicates)

## Update .env.local

Once you find the correct handle, update `.env.local`:

```bash
SHOPIFY_COLLECTION_HANDLE=your-actual-handle-here
```

For example, if the handle is `corporate-gifting`:
```bash
SHOPIFY_COLLECTION_HANDLE=corporate-gifting
```

## Test It

After updating, test:
```bash
curl http://localhost:3000/api/products
```

You should see products from your Corporate Gifting Collection.
