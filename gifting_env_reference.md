# Environment Variables Reference for Vercel Deployment

This document lists all environment variables required to deploy the Brown Sugar Bakery Corporate Gifting application to Vercel.

---

## Required Variables

### Shopify Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `SHOPIFY_STORE_DOMAIN` | Your Shopify store domain (from admin URL) | `your-store.myshopify.com` |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | Admin API access token (starts with `shpat_`) | `shpat_xxxxxxxxxxxxxxxxxxxx` |

### Application URL

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | Public URL of your deployed application | `https://your-app.vercel.app` |

---

## Optional Variables

### Shopify Collections

| Variable | Description | Default |
|----------|-------------|---------|
| `SHOPIFY_COLLECTION_HANDLE` | Handle for the main product collection | `corporate-gifting-collection` |
| `SHOPIFY_SPECIAL_OFFER_COLLECTION_HANDLE` | Handle for special offers popup | `corporate-gifting-special-offer` |

### Email Configuration (SMTP)

Required for sending order confirmation emails and invoices.

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use TLS (set `true` for port 465) | `false` |
| `SMTP_USER` | SMTP username/email | _(none)_ |
| `SMTP_PASS` | SMTP password or app password | _(none)_ |
| `FROM_EMAIL` | Sender email address | _(uses SMTP_USER)_ |
| `FROM_NAME` | Sender display name | `Brown Sugar Bakery` |

### SMS Configuration (Twilio) - Currently Disabled

These are optional as SMS functionality is currently disabled.

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `ACxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `your_auth_token` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for sending SMS | `+1234567890` |

---

## Vercel Environment Variables Setup

### Copy-Paste Template

```env
# === REQUIRED ===

# Shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_your_token_here

# Application URL (update after first deploy)
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# === OPTIONAL ===

# Shopify Collections
SHOPIFY_COLLECTION_HANDLE=corporate-gifting-collection
SHOPIFY_SPECIAL_OFFER_COLLECTION_HANDLE=corporate-gifting-special-offer

# Email (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Brown Sugar Bakery

# SMS (Twilio) - Currently Disabled
# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890
```

---

## How to Get These Values

### Shopify Admin API Token

1. Go to Shopify Admin > Settings > Apps and sales channels
2. Click "Develop apps" > "Create an app"
3. Configure Admin API scopes:
   - `read_products`
   - `write_products`
   - `read_orders`
   - `write_orders`
   - `read_draft_orders`
   - `write_draft_orders`
4. Install the app and copy the Admin API access token

### Gmail SMTP (App Password)

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account > Security > 2-Step Verification > App passwords
3. Generate an app password for "Mail"
4. Use this password as `SMTP_PASS`

### Shopify Collection Handle

1. Go to Shopify Admin > Products > Collections
2. Select your collection
3. The handle is the URL-friendly name in the browser URL
   - Example: `https://admin.shopify.com/store/your-store/collections/123456` with handle `corporate-gifting`

---

## Vercel Deployment Steps

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - Project Settings > Environment Variables
4. Deploy
5. Update `NEXT_PUBLIC_BASE_URL` with your Vercel URL
6. Redeploy to apply the URL change

---

## Notes

- `NEXT_PUBLIC_` prefix exposes variables to the browser (only use for non-sensitive data)
- All other variables are server-side only
- SMS functionality is currently disabled in the codebase but can be re-enabled
