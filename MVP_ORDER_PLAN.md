# MVP Order Processing Plan - Draft Orders with Excel Attachment

## Overview

**MVP Approach:**
- Create draft orders in Shopify (no payment processing)
- Generate Excel spreadsheet with recipient data
- Attach Excel file to draft order
- Manual credit card processing by staff
- Customer receives invoice
- Follow-up call to confirm order

## Revised Order Flow

```
1. Customer completes review page
   └─> Clicks "Place Order"
   
2. Generate Excel Spreadsheet
   ├─> Create Excel file from recipient data
   ├─> Include: buyer info, products, recipients
   └─> Format: Professional recipient list
   
3. Upload Excel to Shopify Files
   ├─> Upload file via Shopify Files API
   └─> Get file URL
   
4. Create Draft Order in Shopify
   ├─> Products × recipient count
   ├─> Fulfillment fees
   ├─> Buyer information
   ├─> Recipient addresses (in notes)
   ├─> Excel file URL (in noteAttributes or note)
   └─> Status: "Draft" (not invoiced yet)
   
5. Return Draft Order Details
   ├─> Draft order ID
   ├─> Draft order number
   └─> Confirmation message
   
6. Show Confirmation Page
   ├─> Order submitted successfully
   ├─> "You will receive an invoice shortly"
   └─> "Our team will call to confirm"
   
7. Manual Process (Staff)
   ├─> Review draft order in Shopify
   ├─> Review Excel attachment
   ├─> Process credit card manually
   ├─> Send invoice to customer
   └─> Make follow-up confirmation call
```

## Excel Spreadsheet Design

### File Structure

**Filename Format:**
```
Corporate_Gift_Order_[OrderNumber]_[Date].xlsx
Example: Corporate_Gift_Order_D1234_2026-01-19.xlsx
```

### Sheet 1: Order Summary
```
Column A: Field Name
Column B: Value

Order Number: [Draft Order Number]
Order Date: [Date]
Buyer Name: [Name]
Buyer Company: [Company]
Buyer Email: [Email]
Buyer Phone: [Phone]
Tier: [Bronze/Silver/Gold/Platinum]
Total Recipients: [Count]
Gift Subtotal: $[Amount]
Fulfillment Fee: $[Amount]
Order Total: $[Amount]
```

### Sheet 2: Products
```
Columns:
- Product Name
- Quantity per Recipient
- Unit Price
- Total Quantity (Quantity × Recipients)
- Subtotal
```

### Sheet 3: Recipients (Main Sheet)
```
Columns:
- Recipient #
- First Name
- Last Name
- Company
- Address Line 1
- Address Line 2
- City
- State
- ZIP Code
- Gift Message
```

### Formatting
- Header row: Bold, colored background
- Freeze header row
- Auto-width columns
- Borders around data
- Professional styling

## Technical Implementation

### Phase 1: Excel Generation

**Library:** Use `exceljs` or `xlsx` (Node.js)

**File:** `lib/excel-generator.ts`

```typescript
export async function generateRecipientExcel(
  orderData: {
    draftOrderNumber: string;
    buyerInfo: BuyerInfo;
    products: SelectedProduct[];
    recipients: Recipient[];
    pricing: OrderPricing;
    tier: string;
  }
): Promise<Buffer> {
  // Create workbook
  // Add sheets
  // Format cells
  // Return Excel buffer
}
```

**Dependencies to Add:**
```json
{
  "exceljs": "^4.4.0"
}
```

### Phase 2: File Upload to Shopify

**Option A: Shopify Files API (Recommended)**
- Upload file to Shopify Files
- Get public URL
- Reference in draft order

**Option B: Base64 in Note**
- Encode Excel as base64
- Include in order notes
- Less ideal (large notes)

**File:** `lib/shopify.ts` - Add function:
```typescript
export async function uploadFileToShopify(
  fileBuffer: Buffer,
  filename: string
): Promise<string> {
  // Upload via Shopify Files API
  // Return file URL
}
```

### Phase 3: Draft Order Creation (Updated)

**File:** `lib/shopify.ts` - Update `createDraftOrder()`

**Changes:**
1. Add `excelFileUrl` parameter
2. Include file URL in `noteAttributes` or note
3. Set draft order status appropriately
4. Don't create invoice URL (manual process)

**Note Attributes:**
```typescript
customAttributes: [
  {
    key: 'order_type',
    value: 'corporate_gifting'
  },
  {
    key: 'recipient_count',
    value: recipientCount.toString()
  },
  {
    key: 'excel_file_url',
    value: excelFileUrl
  },
  {
    key: 'excel_filename',
    value: filename
  }
]
```

### Phase 4: API Endpoint Updates

**File:** `app/api/create-draft-order/route.ts`

**Updated Flow:**
1. Generate Excel spreadsheet
2. Upload Excel to Shopify Files
3. Create draft order with Excel URL
4. Return draft order details

**Response:**
```typescript
{
  draftOrderId: string;
  draftOrderNumber: string;
  excelFileUrl: string;
  message: "Order submitted. You will receive an invoice shortly."
}
```

## File Structure

```
lib/
  ├── excel-generator.ts      # NEW: Excel generation
  ├── shopify.ts              # UPDATE: Add file upload, update draft order
  └── types.ts                # UPDATE: Add Excel-related types

app/
  └── api/
      └── create-draft-order/
          └── route.ts        # UPDATE: Generate Excel, upload, create order
```

## Shopify API Requirements

### Additional Scopes Needed
- `read_files` - To read uploaded files (optional)
- `write_files` - To upload files ✅ (may already have)

### Files API Endpoint
```
POST /admin/api/2024-01/files.json
Content-Type: multipart/form-data

Response: {
  file: {
    id: number,
    url: string,
    ...
  }
}
```

## Error Handling

### Excel Generation Failures
- Invalid data format
- Missing required fields
- File system errors

**Handling:**
- Log error
- Continue without Excel (fallback to notes only)
- Or fail order creation

### File Upload Failures
- Shopify API errors
- File size limits
- Network issues

**Handling:**
- Retry upload
- Fallback: Include Excel data in notes (base64 or text)
- Or fail order creation

### Draft Order Creation Failures
- Invalid variant IDs
- API errors
- Rate limits

**Handling:**
- Return error to user
- Allow retry
- Log for debugging

## User Experience Flow

### Review Page
1. Customer reviews order
2. Clicks "Place Order"
3. Loading state: "Generating order..."
4. Success: Redirect to confirmation

### Confirmation Page
```
✓ Order Submitted Successfully!

Order Number: D-1234
Date: January 19, 2026

Your order has been submitted and is being reviewed by our team.

What happens next:
1. You will receive an invoice via email within 24 hours
2. Our team will call you to confirm the order details
3. Once confirmed, we'll begin preparing your gifts

Thank you for choosing Brown Sugar Bakery!
```

## Staff Workflow

### In Shopify Admin

1. **View Draft Orders**
   - Go to Orders → Drafts
   - Find order by number or customer email

2. **Review Order**
   - Check products and quantities
   - Review buyer information
   - Check order notes for recipient addresses

3. **Download Excel**
   - Click Excel file URL in order notes/attributes
   - Or download from Files section
   - Use Excel for fulfillment planning

4. **Process Payment**
   - Take credit card over phone
   - Enter payment in Shopify
   - Mark draft order as "Invoiced"

5. **Send Invoice**
   - Shopify generates invoice
   - Send to customer email
   - Or manually email invoice

6. **Follow-up Call**
   - Confirm order details
   - Verify recipient addresses
   - Answer any questions

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ORDER CREATION                        │
└─────────────────────────────────────────────────────────┘

Frontend (Review Page)
│
├─> POST /api/create-draft-order
│   │
│   ├─> Generate Excel Spreadsheet
│   │   ├─> Create workbook
│   │   ├─> Add Order Summary sheet
│   │   ├─> Add Products sheet
│   │   ├─> Add Recipients sheet
│   │   └─> Format & style
│   │
│   ├─> Upload Excel to Shopify Files
│   │   ├─> POST /admin/api/2024-01/files.json
│   │   └─> Get file URL
│   │
│   ├─> Create Draft Order
│   │   ├─> Products × recipients
│   │   ├─> Fulfillment fees
│   │   ├─> Buyer info
│   │   ├─> Recipient addresses (notes)
│   │   └─> Excel URL (noteAttributes)
│   │
│   └─> Return draft order details
│
└─> Show Confirmation Page
```

## Implementation Checklist

### Phase 1: Excel Generation
- [ ] Install exceljs package
- [ ] Create `lib/excel-generator.ts`
- [ ] Implement order summary sheet
- [ ] Implement products sheet
- [ ] Implement recipients sheet
- [ ] Add formatting and styling
- [ ] Test Excel generation

### Phase 2: File Upload
- [ ] Add `write_files` scope to Shopify app
- [ ] Create file upload function in `lib/shopify.ts`
- [ ] Test file upload to Shopify
- [ ] Handle upload errors

### Phase 3: Draft Order Integration
- [ ] Update `createDraftOrder()` to accept Excel URL
- [ ] Add Excel URL to noteAttributes
- [ ] Update API endpoint to generate and upload Excel
- [ ] Test end-to-end flow

### Phase 4: UI Updates
- [ ] Update review page order submission
- [ ] Update confirmation page messaging
- [ ] Add loading states
- [ ] Add error handling

### Phase 5: Testing
- [ ] Test with 1 recipient
- [ ] Test with multiple recipients
- [ ] Test Excel download
- [ ] Test draft order creation
- [ ] Verify Excel attachment in Shopify

## Questions to Resolve

1. **Excel Library Choice**
   - ✅ **Recommendation**: `exceljs` (better formatting, more features)
   - Alternative: `xlsx` (smaller, simpler)

2. **File Storage**
   - ✅ **Recommendation**: Shopify Files API (integrated, accessible)
   - Alternative: Cloud storage (S3, etc.) - more complex

3. **Excel Format**
   - ✅ **Recommendation**: .xlsx (professional, widely compatible)
   - Alternative: .csv (simpler, less formatting)

4. **Error Handling**
   - ✅ **Recommendation**: Fail gracefully, log errors, allow retry
   - Alternative: Block order if Excel fails (too strict)

5. **Draft Order Status**
   - ✅ **Recommendation**: Leave as "Draft" until manual processing
   - Alternative: Auto-invoice (defeats manual process)

## Next Steps

1. **Immediate**: Implement Excel generation
2. **Short-term**: Add file upload to Shopify
3. **Medium-term**: Integrate with draft order creation
4. **Testing**: End-to-end testing with real data

## Success Criteria

- ✅ Excel file generates correctly with all recipient data
- ✅ Excel file uploads to Shopify successfully
- ✅ Draft order created with Excel URL reference
- ✅ Staff can easily download Excel from Shopify
- ✅ Order confirmation page shows appropriate messaging
- ✅ No payment processing errors (not implemented)
