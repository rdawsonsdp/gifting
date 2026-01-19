# Order Processing Flow Diagram

## Complete Order Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. SELECT TIER
   └─> /build/[tier]
       └─> Choose products within budget

2. ADD RECIPIENTS
   └─> /recipients
       └─> Upload CSV or manual entry
       └─> Validate addresses

3. REVIEW ORDER
   └─> /review
       ├─> Review products & recipients
       ├─> Enter buyer information
       └─> Click "Place Order"

4. ORDER PROCESSING
   └─> POST /api/create-draft-order
       ├─> Create draft order in Shopify
       │   ├─ Products × recipient count
       │   ├─ Fulfillment fees
       │   ├─ Buyer info
       │   └─ Recipient addresses (in notes)
       │
       └─> Receive invoiceUrl from Shopify

5. PAYMENT
   └─> Redirect to Shopify Checkout
       ├─> Customer enters payment info
       ├─> Shopify processes payment
       └─> Payment successful

6. ORDER COMPLETION
   └─> Shopify sends webhook
       ├─> POST /api/webhooks/shopify
       ├─> Verify webhook signature
       ├─> Process order data
       └─> Store order details

7. CONFIRMATION
   └─> /confirmation?orderId=12345
       ├─> Display order summary
       ├─> Show order number
       └─> Next steps
```

## Technical Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION FLOW                             │
└─────────────────────────────────────────────────────────────────┘

Frontend (Review Page)
│
├─> User clicks "Place Order"
│
├─> POST /api/create-draft-order
│   │
│   ├─> Validate request data
│   │
│   ├─> Call lib/shopify.createDraftOrder()
│   │   │
│   │   ├─> Build GraphQL mutation
│   │   │   ├─ lineItems: products × quantity × recipients
│   │   │   ├─ customLineItems: fulfillment fees
│   │   │   ├─ note: buyer + recipient data
│   │   │   └─ customAttributes: metadata
│   │   │
│   │   ├─> POST to Shopify GraphQL API
│   │   │
│   │   └─> Return { draftOrderId, invoiceUrl }
│   │
│   └─> Return invoiceUrl to frontend
│
├─> Redirect to invoiceUrl (Shopify Checkout)
│
└─> Customer completes payment on Shopify
    │
    └─> Shopify processes payment
        │
        └─> Shopify sends webhook
            │
            ├─> POST /api/webhooks/shopify
            │   │
            │   ├─> Verify HMAC signature
            │   │
            │   ├─> Parse order data
            │   │   ├─ Order ID
            │   │   ├─ Order number
            │   │   ├─ Customer info
            │   │   └─ Line items
            │   │
            │   ├─> Extract recipient data from notes
            │   │
            │   ├─> Store order (optional: database)
            │   │
            │   └─> Send confirmation email
            │
            └─> Return 200 OK to Shopify
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA STRUCTURES                              │
└─────────────────────────────────────────────────────────────────┘

1. ORDER REQUEST (Frontend → API)
   {
     products: [
       { product: { id, title, price, variantId }, quantity: 2 }
     ],
     recipients: [
       { firstName, lastName, address1, city, state, zip, ... }
     ],
     buyerInfo: {
       name, company, email, phone
     },
     pricing: {
       fulfillmentSubtotal: 80,
       perRecipientFee: 8
     }
   }

2. DRAFT ORDER (API → Shopify)
   {
     lineItems: [
       { variantId: "gid://...", quantity: 20 } // 2 × 10 recipients
     ],
     customLineItems: [
       { title: "Fulfillment Fee", quantity: 1, price: 80 }
     ],
     note: "Corporate Gifting Order\nBuyer: ...\nRecipients: ...",
     email: "buyer@example.com",
     customAttributes: [
       { key: "order_type", value: "corporate_gifting" },
       { key: "recipient_count", value: "10" }
     ]
   }

3. SHOPIFY RESPONSE (Shopify → API)
   {
     draftOrder: {
       id: "gid://shopify/DraftOrder/123456",
       invoiceUrl: "https://checkout.shopify.com/..."
     }
   }

4. WEBHOOK PAYLOAD (Shopify → Webhook)
   {
     id: 1234567890,
     name: "#1001",
     email: "buyer@example.com",
     financial_status: "paid",
     fulfillment_status: null,
     line_items: [...],
     note: "Corporate Gifting Order\n...",
     ...
   }
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                              │
└─────────────────────────────────────────────────────────────────┘

1. DRAFT ORDER CREATION FAILS
   ├─> Invalid variant ID
   │   └─> Return 400: "Product not found"
   │
   ├─> Out of stock
   │   └─> Return 400: "Product out of stock"
   │
   ├─> API error
   │   └─> Return 500: "Failed to create order"
   │
   └─> Show error message to user
       └─> Allow retry

2. PAYMENT FAILS
   ├─> Customer cancels
   │   └─> Return to review page
   │
   ├─> Payment method fails
   │   └─> Shopify handles retry
   │
   └─> Draft order remains in Shopify
       └─> Can be completed later

3. WEBHOOK FAILS
   ├─> Invalid signature
   │   └─> Return 401: "Unauthorized"
   │
   ├─> Missing data
   │   └─> Log error, return 400
   │
   └─> Shopify retries webhook
       └─> Implement idempotency
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE FLOW                                    │
└─────────────────────────────────────────────────────────────────┘

GiftContext State:
├─ selectedTier
├─ selectedProducts
├─ recipients
└─ buyerInfo

Order State (after submission):
├─ draftOrderId (from Shopify)
├─ invoiceUrl (redirect URL)
└─ orderId (after payment, from webhook)

Confirmation State:
├─ orderId (from URL params)
├─ orderDetails (fetched from Shopify)
└─ recipientCount (from order notes)
```
