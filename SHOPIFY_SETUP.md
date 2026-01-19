# Shopify API Setup Guide

This guide will walk you through setting up the required Shopify API access for the Corporate Gifting Platform.

## Required API Scopes

Based on the application code, you need the following Admin API scopes:

### 1. **Read Products** (`read_products`)
   - Used to fetch products tagged with "corporate-gift"
   - Accesses: product titles, descriptions, images, variants, prices, inventory, tags

### 2. **Write Draft Orders** (`write_draft_orders`)
   - Used to create draft orders for corporate gifting
   - Creates draft orders with line items, custom attributes, notes, and shipping addresses

### 3. **Read Draft Orders** (`read_draft_orders`) - Optional but recommended
   - Allows reading draft order details after creation
   - Useful for order management and tracking

## Step-by-Step Setup Instructions

### Step 1: Navigate to Your Custom App

1. Go to your Shopify Admin: `https://admin.shopify.com/store/brown-sugar-bakery-chicago`
2. Click **Settings** (gear icon) in the bottom left
3. Click **Apps and sales channels**
4. Click **Develop apps**
5. Find your existing custom app (the one with your Client ID)
6. Click on the app name to open it

### Step 2: Configure Admin API Scopes (If Not Already Done)

1. In your app, look for **Configuration** tab or **API access** section
2. Click **Configure Admin API scopes** or **Admin API integration scopes**
3. Enable these scopes:
   - ✅ **Read products** (`read_products`)
   - ✅ **Write draft orders** (`write_draft_orders`)
   - ✅ **Read draft orders** (`read_draft_orders`) - recommended
4. Click **Save**

### Step 3: Install the App (If Not Already Installed)

1. Click **Install app** button
2. Review permissions and click **Install**

### Step 4: Get Your Admin API Access Token

**Option A: If you see "API credentials" or "Access tokens" tab:**
1. Click on **API credentials** or **Access tokens** tab
2. Look for **Admin API access token**
3. Click **Reveal token once** or **Show token**
4. Copy the token (starts with `shpat_`)

**Option B: If you don't see a token (new Shopify interface):**
You'll need to generate a token using Client Credentials Grant. See "Generating Access Token via API" section below.

**Option C: Check the app overview page:**
1. After installing, the token might be displayed on the main app page
2. Look for a section showing credentials or tokens

## Generating Access Token via API (If Token Not Visible)

If you can't find the Admin API access token in the Shopify admin, you can generate it using the Client Credentials Grant flow:

### Using cURL (Terminal):

```bash
curl -X POST "https://brown-sugar-bakery-chicago.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID_HERE",
    "client_secret": "YOUR_CLIENT_SECRET_HERE",
    "grant_type": "client_credentials"
  }'
```

This will return a JSON response with an `access_token` field. Copy that token.

### Alternative: Check App Installation Page

1. After installing the app, Shopify may show the access token on the installation confirmation page
2. Look for any "Credentials" or "API Access" section
3. The token format is: `shpat_` followed by a long string

### Step 6: Update Your .env.local File

Add the token to your `.env.local` file:

```env
SHOPIFY_STORE_DOMAIN=brown-sugar-bakery-chicago.myshopify.com
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_your_token_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 7: Tag Your Products (Important!)

For the product fetching to work, you need to tag your corporate gift products:

1. Go to **Products** in your Shopify admin
2. For each product you want to appear in the corporate gifting platform:
   - Click on the product
   - Scroll to **Search engine listing** or **Tags** section
   - Add the tag: `corporate-gift`
   - Optionally add tier tags: `bronze`, `silver`, `gold`, or `platinum` (for filtering by tier)

**Example Product Tags:**
- `corporate-gift, gold` - Appears in Gold tier
- `corporate-gift, silver` - Appears in Silver tier
- `corporate-gift` - Appears in all tiers

## Testing Your Setup

After setting up, you can test the integration:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. The application will:
   - Fetch all products dynamically from the "Candy Collection" in Shopify
   - Products are pulled in real-time via the Shopify Admin API
   - No static product fallbacks are used

## Current Implementation Status

- ✅ **Draft Order Creation**: Fully implemented and ready to use
- ✅ **Product Fetching**: All products are fetched dynamically from Shopify's "Candy Collection"
  - Products are pulled in real-time via the Shopify Admin API
  - No static product fallbacks - Shopify connection is required
  - Collection handle configurable via `SHOPIFY_COLLECTION_HANDLE` environment variable

## Troubleshooting

### "Shopify credentials not configured" warning
- Check that `.env.local` exists and has the correct values
- Ensure `SHOPIFY_ADMIN_API_ACCESS_TOKEN` starts with `shpat_`
- Restart your development server after adding environment variables

### "Access denied" or "Insufficient permissions" errors
- Verify you've installed the app after configuring scopes
- Check that all required scopes are enabled
- Try regenerating the access token

### Products not showing up
- Ensure products are tagged with `corporate-gift`
- Check that product fetching code is uncommented in `lib/shopify.ts`
- Verify the API token has `read_products` scope

### Draft orders not creating
- Verify `write_draft_orders` scope is enabled
- Check that products have valid variant IDs
- Review server logs for specific error messages

## Security Notes

- ⚠️ **Never commit** `.env.local` to git (it's already in `.gitignore`)
- ⚠️ **Keep your access token secret** - treat it like a password
- ⚠️ **Regenerate tokens** if they're ever exposed
- ✅ Use environment variables in production (Vercel, etc.)

## Next Steps

1. Complete the setup steps above
2. Add the Admin API access token to `.env.local`
3. Tag your products with `corporate-gift`
4. Test creating a draft order through the application
5. (Optional) Enable Shopify product fetching by uncommenting the code

## Additional Resources

- [Shopify Admin API Documentation](https://shopify.dev/docs/api/admin-graphql)
- [Shopify API Scopes Reference](https://shopify.dev/docs/api/admin-graphql/latest/objects/DraftOrder)
- [GraphQL Explorer](https://shopify.dev/docs/apps/tools/graphiql-admin-api)
