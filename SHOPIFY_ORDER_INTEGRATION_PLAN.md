# Shopify Order Processing Integration Plan

## Overview

This document outlines the complete integration plan for processing corporate gifting orders through Shopify, including payment processing, order management, and fulfillment.

## Current State

### ✅ What's Already Built
- Draft order creation API (`lib/shopify.ts` - `createDraftOrder()`)
- Order data structure (products, recipients, buyer info)
- Review page with buyer form
- Confirmation page (basic structure)
- Fulfillment fee calculation

### ❌ What's Missing
- Actual order submission flow
- Payment processing integration
- Shopify checkout redirect
- Order confirmation handling
- Webhook handling for order updates
- Order status tracking

## Proposed Order Flow

```
1. Customer completes review page
   ↓
2. Click "Place Order"
   ↓
3. Create Draft Order in Shopify
   ├─ Products (multiplied by recipient count)
   ├─ Fulfillment fees (custom line items)
   ├─ Buyer information
   ├─ Recipient addresses (in order notes)
   └─ Custom attributes (order_type, recipient_count)
   ↓
4. Get Invoice URL from Shopify
   ↓
5. Redirect customer to Shopify Checkout
   ├─ Customer completes payment
   ├─ Shopify processes payment
   └─ Shopify sends webhook on order completion
   ↓
6. Handle Order Completion
   ├─ Webhook receives order data
   ├─ Store order details
   └─ Send confirmation email
   ↓
7. Show Confirmation Page
   ├─ Order number
   ├─ Order summary
   └─ Next steps
```

## Implementation Phases

### Phase 1: Draft Order Creation & Checkout Redirect ✅ (Partially Complete)

**Status:** Draft order creation exists, needs to be wired up

**Tasks:**
1. ✅ Update `app/review/page.tsx` to call `/api/create-draft-order`
2. ✅ Handle draft order creation response
3. ✅ Redirect to Shopify invoice URL for payment
4. ✅ Add error handling for failed draft order creation
5. ✅ Add loading states during order creation

**Files to Modify:**
- `app/review/page.tsx` - Wire up order submission
- `app/api/create-draft-order/route.ts` - Already exists, verify it works

**API Endpoint:**
```
POST /api/create-draft-order
Body: {
  products: SelectedProduct[],
  recipients: Recipient[],
  buyerInfo: BuyerInfo,
  pricing: { fulfillmentSubtotal, perRecipientFee }
}
Response: {
  draftOrderId: string,
  invoiceUrl: string
}
```

### Phase 2: Order Confirmation Handling

**Status:** Not implemented

**Tasks:**
1. Create order confirmation API endpoint
2. Handle Shopify order completion webhook
3. Store order details (optional: database)
4. Update confirmation page to show real order data
5. Send confirmation email to buyer

**Files to Create:**
- `app/api/webhooks/shopify/route.ts` - Webhook handler
- `app/api/orders/[orderId]/route.ts` - Order lookup endpoint

**Files to Modify:**
- `app/confirmation/page.tsx` - Show real order data
- `lib/shopify.ts` - Add order lookup function

**Webhook Endpoint:**
```
POST /api/webhooks/shopify
Headers: X-Shopify-Hmac-Sha256 (for verification)
Body: Shopify order webhook payload
```

### Phase 3: Order Status & Tracking

**Status:** Not implemented

**Tasks:**
1. Create order status page
2. Add order lookup by email/order number
3. Display order fulfillment status
4. Show tracking information when available
5. Handle multiple fulfillments (one per recipient)

**Files to Create:**
- `app/orders/[orderId]/page.tsx` - Order status page
- `app/api/orders/lookup/route.ts` - Order lookup by email

**Files to Modify:**
- `lib/shopify.ts` - Add order status query

### Phase 4: Fulfillment Management

**Status:** Not implemented

**Tasks:**
1. Parse recipient data from order notes
2. Create individual fulfillments per recipient
3. Handle fulfillment webhooks
4. Update order status when fulfilled
5. Send tracking emails to recipients (optional)

**Files to Create:**
- `lib/fulfillment.ts` - Fulfillment parsing and creation
- `app/api/fulfillments/create/route.ts` - Create fulfillments

**Files to Modify:**
- `lib/shopify.ts` - Add fulfillment creation

## Technical Details

### Draft Order Structure

```graphql
mutation draftOrderCreate($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
      invoiceUrl
      order {
        id
        name
        email
      }
    }
  }
}
```

**Input Structure:**
- `lineItems`: Product variants × quantity × recipient count
- `customLineItems`: Fulfillment fees
- `note`: Buyer info + recipient addresses
- `email`: Buyer email
- `shippingAddress`: Buyer address (for billing)
- `customAttributes`: Order metadata

### Order Notes Format

```
Corporate Gifting Order

Buyer: [Name]
Company: [Company]
Email: [Email]
Phone: [Phone]

Recipients ([count]):
---
Recipient 1:
[Name]
[Company]
[Address]
[City], [State] [Zip]
Message: [Optional message]
---
Recipient 2:
...
```

### Webhook Verification

Shopify webhooks must be verified using HMAC SHA256:

```typescript
function verifyWebhook(data: string, hmac: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(data, 'utf8')
    .digest('base64');
  return hash === hmac;
}
```

### Required Shopify Scopes

Already configured:
- ✅ `read_products`
- ✅ `write_draft_orders`
- ✅ `read_draft_orders`

Additional scopes needed:
- `read_orders` - To read order details
- `read_fulfillments` - To check fulfillment status
- `write_fulfillments` - To create fulfillments (if automating)

## Environment Variables

Add to `.env.local`:

```env
# Existing
SHOPIFY_STORE_DOMAIN=...
SHOPIFY_ADMIN_API_ACCESS_TOKEN=...
SHOPIFY_COLLECTION_HANDLE=...

# New
SHOPIFY_WEBHOOK_SECRET=... # For webhook verification
SHOPIFY_API_VERSION=2024-01 # Or latest
```

## Error Handling

### Draft Order Creation Failures
- Invalid variant IDs
- Out of stock products
- Invalid addresses
- API rate limits

### Payment Failures
- Customer cancels checkout
- Payment method fails
- Shopify checkout errors

### Webhook Failures
- Invalid HMAC signature
- Missing order data
- Duplicate webhook processing

## Security Considerations

1. **Webhook Verification**: Always verify HMAC signatures
2. **Rate Limiting**: Implement rate limiting on API endpoints
3. **Input Validation**: Validate all user inputs
4. **Error Messages**: Don't expose sensitive information
5. **HTTPS Only**: All webhook endpoints must use HTTPS

## Testing Strategy

### Unit Tests
- Draft order creation logic
- Recipient data parsing
- Fulfillment fee calculations
- Webhook verification

### Integration Tests
- End-to-end order flow
- Shopify API calls
- Webhook handling
- Error scenarios

### Manual Testing
1. Create test order with 1 recipient
2. Create test order with multiple recipients
3. Test payment cancellation
4. Test webhook processing
5. Test order lookup

## Rollout Plan

### Phase 1: MVP (Week 1)
- ✅ Draft order creation
- ✅ Checkout redirect
- ✅ Basic confirmation page

### Phase 2: Webhooks (Week 2)
- Order completion webhook
- Order status updates
- Email confirmations

### Phase 3: Fulfillment (Week 3)
- Fulfillment parsing
- Status tracking
- Order lookup

### Phase 4: Polish (Week 4)
- Error handling improvements
- UI/UX enhancements
- Performance optimization

## Success Metrics

- Order creation success rate > 99%
- Average checkout completion time < 2 minutes
- Webhook processing time < 5 seconds
- Order lookup success rate > 95%

## Next Steps

1. **Immediate**: Implement Phase 1 (Draft Order & Checkout Redirect)
2. **Short-term**: Set up webhook endpoint and testing
3. **Medium-term**: Add order status tracking
4. **Long-term**: Automate fulfillment creation

## Questions to Resolve

1. **Payment**: Use Shopify Checkout or custom payment gateway?
   - ✅ **Recommendation**: Shopify Checkout (simpler, secure, handles taxes/shipping)

2. **Fulfillment**: Manual or automated?
   - **Recommendation**: Start manual, automate later

3. **Order Storage**: Database or Shopify only?
   - **Recommendation**: Shopify only initially, add database if needed

4. **Email Notifications**: Shopify emails or custom?
   - **Recommendation**: Shopify emails initially, customize later

5. **Multiple Recipients**: One order or multiple orders?
   - ✅ **Current**: One order with notes (recommended)
   - **Alternative**: Multiple orders (more complex)

## References

- [Shopify Draft Orders API](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderCreate)
- [Shopify Webhooks](https://shopify.dev/docs/apps/webhooks)
- [Shopify Order API](https://shopify.dev/docs/api/admin-graphql/latest/objects/Order)
- [Shopify Fulfillment API](https://shopify.dev/docs/api/admin-graphql/latest/objects/Fulfillment)
