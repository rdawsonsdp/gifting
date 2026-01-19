# MVP Order Flow - Visual Diagram

## Complete MVP Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER JOURNEY (MVP)                       │
└─────────────────────────────────────────────────────────────────┘

1. SELECT TIER & PRODUCTS
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
       │
       ├─> STEP 1: Generate Excel Spreadsheet
       │   ├─> Create workbook (exceljs)
       │   ├─> Sheet 1: Order Summary
       │   │   ├─ Order number, date
       │   │   ├─ Buyer info
       │   │   ├─ Tier, totals
       │   │   └─ Pricing breakdown
       │   │
       │   ├─> Sheet 2: Products
       │   │   ├─ Product names
       │   │   ├─ Quantities
       │   │   └─ Prices
       │   │
       │   └─> Sheet 3: Recipients
       │       ├─ All recipient addresses
       │       ├─ Gift messages
       │       └─ Formatted professionally
       │
       ├─> STEP 2: Upload Excel to Shopify Files
       │   ├─> POST /admin/api/2024-01/files.json
       │   ├─> Multipart form data
       │   └─> Receive file URL
       │
       ├─> STEP 3: Create Draft Order
       │   ├─> Products × recipient count
       │   ├─> Fulfillment fees (custom line items)
       │   ├─> Buyer information
       │   ├─> Recipient addresses (in order notes)
       │   ├─> Excel file URL (in noteAttributes)
       │   └─> Status: "Draft"
       │
       └─> STEP 4: Return Success
           ├─> Draft order ID
           ├─> Draft order number
           └─> Excel file URL

5. CONFIRMATION PAGE
   └─> /confirmation?orderId=D-1234
       ├─> "Order Submitted Successfully"
       ├─> "You will receive an invoice shortly"
       ├─> "Our team will call to confirm"
       └─> Order summary display

┌─────────────────────────────────────────────────────────────────┐
│                    STAFF WORKFLOW (Manual)                      │
└─────────────────────────────────────────────────────────────────┘

1. REVIEW DRAFT ORDER
   └─> Shopify Admin → Orders → Drafts
       ├─> Find order by number or email
       ├─> Review products and quantities
       ├─> Check buyer information
       └─> Review recipient addresses in notes

2. DOWNLOAD EXCEL FILE
   └─> Click Excel URL from order notes/attributes
       ├─> Download Excel spreadsheet
       ├─> Review recipient list
       └─> Use for fulfillment planning

3. PROCESS PAYMENT
   └─> Call customer
       ├─> Confirm order details
       ├─> Take credit card information
       └─> Enter payment in Shopify

4. SEND INVOICE
   └─> Shopify Admin
       ├─> Mark draft as "Invoiced"
       ├─> Generate invoice
       └─> Email to customer

5. FOLLOW-UP CALL
   └─> Confirm order
       ├─> Verify recipient addresses
       ├─> Answer questions
       └─> Set expectations
```

## Technical Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    API REQUEST FLOW                              │
└─────────────────────────────────────────────────────────────────┘

Frontend (Review Page)
│
├─> User clicks "Place Order"
│
├─> POST /api/create-draft-order
│   {
│     products: [...],
│     recipients: [...],
│     buyerInfo: {...},
│     pricing: {...}
│   }
│
├─> API Handler (route.ts)
│   │
│   ├─> 1. Generate Excel
│   │   └─> lib/excel-generator.ts
│   │       ├─> Create workbook
│   │       ├─> Add sheets
│   │       ├─> Format cells
│   │       └─> Return Buffer
│   │
│   ├─> 2. Upload Excel to Shopify
│   │   └─> lib/shopify.ts → uploadFileToShopify()
│   │       ├─> POST /admin/api/2024-01/files.json
│   │       ├─> multipart/form-data
│   │       └─> Return file URL
│   │
│   ├─> 3. Create Draft Order
│   │   └─> lib/shopify.ts → createDraftOrder()
│   │       ├─> Build GraphQL mutation
│   │       ├─> Include Excel URL in noteAttributes
│   │       ├─> POST to Shopify GraphQL API
│   │       └─> Return draft order data
│   │
│   └─> 4. Return Response
│       {
│         draftOrderId: "...",
│         draftOrderNumber: "D-1234",
│         excelFileUrl: "https://...",
│         message: "Order submitted..."
│       }
│
└─> Redirect to Confirmation Page
```

## Excel File Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXCEL WORKBOOK STRUCTURE                      │
└─────────────────────────────────────────────────────────────────┘

📊 Corporate_Gift_Order_D1234_2026-01-19.xlsx

┌─ Sheet 1: Order Summary ─────────────────────────────────────┐
│                                                                 │
│  Field Name              │ Value                               │
│  ────────────────────────┼──────────────────────────────────── │
│  Order Number            │ D-1234                               │
│  Order Date              │ January 19, 2026                      │
│  Buyer Name              │ John Smith                           │
│  Buyer Company           │ Acme Corp                            │
│  Buyer Email             │ john@acme.com                        │
│  Buyer Phone             │ 555-1234                             │
│  Tier                    │ Gold                                 │
│  Total Recipients        │ 10                                   │
│  Gift Subtotal           │ $750.00                              │
│  Fulfillment Fee         │ $50.00                                │
│  Order Total             │ $800.00                              │
└─────────────────────────────────────────────────────────────────┘

┌─ Sheet 2: Products ───────────────────────────────────────────┐
│                                                                 │
│  Product Name        │ Qty/Recipient │ Unit Price │ Total Qty │
│  ────────────────────┼───────────────┼────────────┼───────────│
│  Sea Salt Caramels   │ 2             │ $24.95     │ 20        │
│  Tortue Assortment   │ 1             │ $24.95     │ 10        │
│  ────────────────────┴───────────────┴────────────┴───────────│
│  Subtotal:                                                  $750│
└─────────────────────────────────────────────────────────────────┘

┌─ Sheet 3: Recipients ─────────────────────────────────────────┐
│                                                                 │
│  # │ First │ Last  │ Company │ Address        │ City │ State │
│  ──┼───────┼───────┼─────────┼───────────────┼──────┼───────│
│  1 │ Jane  │ Doe   │ ABC Inc │ 123 Main St   │ NY   │ NY    │
│  2 │ Bob   │ Smith │ XYZ Co  │ 456 Oak Ave   │ LA   │ CA    │
│  ...                                                           │
│                                                                 │
│  Columns:                                                       │
│  - Recipient #                                                  │
│  - First Name                                                   │
│  - Last Name                                                    │
│  - Company                                                      │
│  - Address Line 1                                               │
│  - Address Line 2                                               │
│  - City                                                         │
│  - State                                                        │
│  - ZIP Code                                                     │
│  - Gift Message                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Structures

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST/RESPONSE STRUCTURES                   │
└─────────────────────────────────────────────────────────────────┘

REQUEST (POST /api/create-draft-order)
{
  products: [
    {
      product: {
        id: "123",
        title: "Sea Salt Caramels",
        price: 24.95,
        variantId: "49546405118199"
      },
      quantity: 2
    }
  ],
  recipients: [
    {
      id: "rec1",
      firstName: "Jane",
      lastName: "Doe",
      company: "ABC Inc",
      address1: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      giftMessage: "Happy Holidays!"
    }
  ],
  buyerInfo: {
    name: "John Smith",
    company: "Acme Corp",
    email: "john@acme.com",
    phone: "555-1234"
  },
  pricing: {
    fulfillmentSubtotal: 50.00,
    perRecipientFee: 5.00
  }
}

RESPONSE
{
  success: true,
  draftOrderId: "gid://shopify/DraftOrder/123456",
  draftOrderNumber: "D-1234",
  excelFileUrl: "https://cdn.shopify.com/s/files/1/.../order.xlsx",
  message: "Order submitted successfully. You will receive an invoice shortly."
}
```

## Error Scenarios

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                                │
└─────────────────────────────────────────────────────────────────┘

1. EXCEL GENERATION FAILS
   ├─> Log error
   ├─> Continue without Excel (fallback)
   └─> Create draft order with notes only

2. FILE UPLOAD FAILS
   ├─> Retry upload (3 attempts)
   ├─> If still fails: Include Excel as base64 in notes
   └─> Or: Fail order creation with error message

3. DRAFT ORDER CREATION FAILS
   ├─> Return error to user
   ├─> Show error message
   └─> Allow retry

4. INVALID DATA
   ├─> Validate before processing
   ├─> Return validation errors
   └─> Prevent order creation
```

## Implementation Priority

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION ORDER                          │
└─────────────────────────────────────────────────────────────────┘

PRIORITY 1: Excel Generation
├─> Install exceljs
├─> Create excel-generator.ts
├─> Implement 3 sheets
└─> Test Excel output

PRIORITY 2: File Upload
├─> Add write_files scope
├─> Implement uploadFileToShopify()
└─> Test file upload

PRIORITY 3: Integration
├─> Update create-draft-order API
├─> Wire up Excel generation
├─> Wire up file upload
└─> Update draft order creation

PRIORITY 4: UI Updates
├─> Update review page
├─> Update confirmation page
└─> Add loading/error states

PRIORITY 5: Testing
├─> Test with 1 recipient
├─> Test with 10+ recipients
├─> Test Excel download
└─> Test in Shopify admin
```
