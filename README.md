# Brown Sugar Bakery Corporate Gifting Platform

A Next.js 14 web application for corporate buyers to purchase bulk candy gifts with budget-based tier selection and CSV recipient management.

## Features

- **Budget-Based Tier Selection**: Choose from Bronze, Silver, Gold, or Platinum tiers
- **Gift Builder**: Select products within your budget with real-time budget tracking
- **CSV Recipient Upload**: Upload recipient lists via CSV with validation
- **Order Review**: Complete pricing breakdown and buyer information form
- **Shopify Integration**: Creates draft orders in Shopify for payment processing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Forms**: React Hook Form + Zod
- **CSV Parsing**: Papa Parse
- **API**: Shopify GraphQL Admin API

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- Shopify store with Admin API access

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   SHOPIFY_STORE_DOMAIN=brownsugarbakerychicago.myshopify.com
   SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_xxxxx
   SHOPIFY_STOREFRONT_API_ACCESS_TOKEN=xxxxx
   NEXT_PUBLIC_BASE_URL=https://gifts.brownsugarbakerychicago.com
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/app
  /page.tsx                    # Landing page
  /build/[tier]/page.tsx       # Gift builder
  /recipients/page.tsx         # CSV upload
  /review/page.tsx             # Order review
  /confirmation/page.tsx       # Confirmation
  /api
    /products/route.ts         # Shopify products endpoint
    /create-draft-order/route.ts # Draft order creation
/components
  /ui                          # Base UI components
  /layout                      # Header, Footer, Layout
  /gift-builder               # Tier cards, product cards, budget meter
  /recipients                 # CSV uploader, recipient table
  /checkout                   # Order summary, buyer form
/context
  GiftContext.tsx             # Global state management
/lib
  types.ts                    # TypeScript interfaces
  tiers.ts                    # Tier configuration
  pricing.ts                  # Fulfillment fee calculations
  csv-utils.ts               # CSV parsing & validation
  shopify.ts                 # Shopify API client
/public
  template.csv               # CSV template for download
```

## User Flow

1. **Landing Page**: Select a budget tier (Bronze, Silver, Gold, Platinum)
2. **Gift Builder**: Add products within your tier's budget range
3. **Recipients**: Upload CSV file with recipient shipping addresses
4. **Review**: Review order details and enter buyer information
5. **Confirmation**: Order confirmation and redirect to Shopify checkout

## Tier Configuration

- **Bronze**: $15 - $25
- **Silver**: $35 - $50
- **Gold**: $75 - $100
- **Platinum**: $150 - $250

## Fulfillment Fees

- 1-25 recipients: $8 per recipient
- 26-50 recipients: $6 per recipient
- 51-100 recipients: $5 per recipient
- 100+ recipients: $4 per recipient

## CSV Format

Required columns:
- `first_name`, `last_name`, `address1`, `city`, `state`, `zip`

Optional columns:
- `company`, `address2`, `gift_message` (max 200 characters)

Download the template CSV from the recipients page.

## Shopify Integration

The application uses Shopify's GraphQL Admin API to:
- Fetch products tagged with "corporate-gift"
- Create draft orders with line items and fulfillment fees
- Attach recipient data as order notes
- Return invoice URL for payment processing

## Brand Colors

- Primary Brown: `#5D4037`
- Accent Gold: `#D4AF37`
- Lavender: `#E6E6FA`
- Light Brown: `#8B7355`
- Orange-Red: `#FF6B35`
- Cream: `#FFF8E7`
- Charcoal: `#333333`

## Deployment

The application is designed to be deployed on Vercel:

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## License

Private - Brown Sugar Bakery Chicago
