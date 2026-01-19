# Enable write_draft_orders Scope

## Current Issue

The access token doesn't have the `write_draft_orders` scope, which is required to create draft orders.

## Solution

### Step 1: Enable Scope in Shopify App

1. Go to: `https://admin.shopify.com/store/brown-sugar-bakery-chicago/settings/apps/development`
2. Click on your custom app
3. Go to **Configuration** or **API access** tab
4. Click **Configure Admin API scopes**
5. Enable:
   - ✅ **Write draft orders** (`write_draft_orders`) - **REQUIRED**
   - ✅ **Read draft orders** (`read_draft_orders`) - Recommended
   - ✅ **Read products** (`read_products`) - Already enabled
   - ✅ **Write files** (`write_files`) - For Excel upload later

### Step 2: Reinstall the App

1. Click **Install app** (or **Uninstall** then **Install** if already installed)
2. This applies the new scopes

### Step 3: Regenerate Access Token

After reinstalling, regenerate the token:

```bash
cd /Users/robertdawson/u01/gifting
./scripts/generate-shopify-token.sh
```

### Step 4: Update .env.local

Copy the new token and update `.env.local`:

```bash
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_your_new_token_here
```

### Step 5: Restart Dev Server

Restart your Next.js dev server to load the new token.

## Verification

After completing the steps, test:

```bash
./test-order-creation.sh
```

You should see a successful draft order creation response.
