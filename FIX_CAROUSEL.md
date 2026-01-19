# Fix: Carousel Not Showing - Missing Shopify Scope

## Problem

The carousel isn't showing because the Shopify API is returning:
```
"Access denied for collectionByHandle field. Required access: `read_products` access scope."
```

## Solution: Enable `read_products` Scope in Shopify

### Step 1: Go to Your Custom App

1. Navigate to: `https://admin.shopify.com/store/brown-sugar-bakery-chicago/settings/apps/development`
2. Click on your custom app (the one with your Client ID)

### Step 2: Configure Admin API Scopes

1. Look for **"Configuration"** tab or **"API access"** section
2. Click **"Configure Admin API scopes"** or **"Admin API integration scopes"**
3. Find and enable:
   - ✅ **Read products** (`read_products`) - **THIS IS REQUIRED**
   - ✅ **Write draft orders** (`write_draft_orders`)
   - ✅ **Read draft orders** (`read_draft_orders`)

### Step 3: Install/Reinstall the App

1. If you see **"Install app"** button, click it
2. If the app is already installed, you may need to:
   - Click **"Uninstall"** then **"Install"** again to apply new scopes
   - Or look for **"Update permissions"** or **"Reinstall"** option

### Step 4: Verify

After installing, test the API:
```bash
curl http://localhost:3000/api/products
```

You should see products JSON, not an error message.

## Alternative: Check Current Scopes

If you're not sure what scopes are enabled:

1. Go to your app's **"API credentials"** or **"Configuration"** tab
2. Look for **"Admin API integration scopes"** section
3. Verify `read_products` is listed and enabled

## After Fixing

Once `read_products` scope is enabled:

1. Restart your dev server (if needed)
2. Refresh the browser
3. The carousel should now display products from your Candy Collection

## Still Not Working?

If you've enabled the scope but still see errors:

1. **Check collection handle**: Verify `SHOPIFY_COLLECTION_HANDLE` in `.env.local` matches your Shopify collection
2. **Check collection exists**: Ensure "Candy Collection" exists and has products
3. **Check token**: Verify your Admin API access token is still valid
4. **Check browser console**: Look for any JavaScript errors
