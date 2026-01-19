# Excel Upload Setup - Enable write_files Scope

## Current Status

✅ **Order Creation**: Working perfectly!
✅ **Excel Generation**: Working perfectly!
❌ **File Upload**: Needs `write_files` scope

## Error Message

```
Access denied for fileCreate field. Required access: `write_files` access scope
```

## Solution

### Step 1: Enable write_files Scope

1. Go to: `https://admin.shopify.com/store/brown-sugar-bakery-chicago/settings/apps/development`
2. Click on your custom app
3. Go to **Configuration** or **API access** tab
4. Click **Configure Admin API scopes**
5. Enable:
   - ✅ **Write files** (`write_files`) - **REQUIRED for Excel upload**
   - ✅ **Write draft orders** (`write_draft_orders`) - Already enabled
   - ✅ **Read draft orders** (`read_draft_orders`) - Already enabled
   - ✅ **Read products** (`read_products`) - Already enabled

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

### Step 5: Test Again

```bash
./test-order-creation.sh
```

You should see `excelFileUrl` with a valid URL!

## What's Already Working

- ✅ Draft order creation
- ✅ Excel spreadsheet generation (3 sheets)
- ✅ Order number included in Excel
- ✅ Draft order includes Excel URL in customAttributes
- ✅ Error handling and logging

## After Enabling Scope

Once `write_files` is enabled:
1. Excel files will upload to Shopify
2. Excel URL will be stored in draft order customAttributes
3. Staff can download Excel from Shopify admin
4. Excel filename includes order number and date

## Current Implementation

- **Excel Generation**: Creates 3-sheet workbook with order summary, products, and recipients
- **File Upload**: Uses Shopify GraphQL `fileCreate` mutation
- **Order Integration**: Excel URL stored in `excel_file_url` customAttribute
- **Error Handling**: Order creation succeeds even if Excel upload fails
