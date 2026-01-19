# Critical: Enable read_products Scope in Shopify

## Current Status
❌ The `read_products` scope is **NOT enabled** in your Shopify app.

The access token was regenerated, but it still doesn't have the `read_products` permission because the scope isn't enabled in the app configuration.

## Step-by-Step Fix

### 1. Go to Your Custom App
Navigate to: `https://admin.shopify.com/store/brown-sugar-bakery-chicago/settings/apps/development`

### 2. Click on Your App
Click on the app with your Client ID

### 3. Find "Configuration" or "API Access" Tab
Look for tabs like:
- **Configuration**
- **API access**
- **Scopes**
- **Admin API integration scopes**

### 4. Enable `read_products` Scope
In the **Admin API integration scopes** section:
- ✅ Check/enable **"Read products"** (`read_products`)
- ✅ Also enable **"Write draft orders"** (`write_draft_orders`)
- ✅ Also enable **"Read draft orders"** (`read_draft_orders`)

### 5. **CRITICAL: Install/Reinstall the App**
After enabling scopes, you **MUST** install or reinstall the app:
- Click **"Install app"** button (if not installed)
- OR click **"Uninstall"** then **"Install"** again (if already installed)
- This applies the new scopes to your access token

### 6. Regenerate Access Token
After reinstalling, regenerate the token:
```bash
cd /Users/robertdawson/u01/gifting
./scripts/generate-shopify-token.sh
```

### 7. Update .env.local
Copy the new token and update `.env.local`:
```bash
# The script will show you the new token
# Update SHOPIFY_ADMIN_API_ACCESS_TOKEN in .env.local
```

### 8. Restart Dev Server
Restart your Next.js dev server to load the new token.

## Verification

After completing the steps, test:
```bash
curl http://localhost:3000/api/products
```

You should see product data, not an error.

## Why This Happens

Shopify's Client Credentials Grant generates tokens based on the scopes configured in your app. If a scope isn't enabled in the app configuration, the token won't have that permission, even if you regenerate it.

**The scope must be enabled BEFORE generating the token.**
