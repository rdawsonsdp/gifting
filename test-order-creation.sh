#!/bin/bash

# Test script for draft order creation with Excel generation
# This simulates what the frontend sends to the API

echo "Testing Draft Order Creation with Excel Generation..."
echo ""

# Test data
TEST_DATA='{
  "products": [
    {
      "product": {
        "id": "9628883288311",
        "title": "Sea Salt Caramels",
        "price": 24.95,
        "variantId": "49546405118199"
      },
      "quantity": 2
    }
  ],
  "recipients": [
    {
      "id": "rec1",
      "firstName": "John",
      "lastName": "Doe",
      "company": "Test Company",
      "address1": "123 Test St",
      "city": "Chicago",
      "state": "IL",
      "zip": "60601",
      "isValid": true,
      "errors": []
    },
    {
      "id": "rec2",
      "firstName": "Jane",
      "lastName": "Smith",
      "company": "Another Corp",
      "address1": "456 Oak Ave",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "giftMessage": "Happy Holidays!",
      "isValid": true,
      "errors": []
    }
  ],
  "buyerInfo": {
    "name": "Jane Buyer",
    "company": "Acme Corp",
    "email": "jane@acme.com",
    "phone": "555-1234"
  },
  "pricing": {
    "fulfillmentSubtotal": 16.00,
    "perRecipientFee": 8.00
  },
  "tier": "Gold"
}'

echo "Sending test order with Excel generation..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/create-draft-order \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo "Checking if Excel URL is present..."
EXCEL_URL=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('excelFileUrl', 'NOT_FOUND'))" 2>/dev/null)

if [ "$EXCEL_URL" != "NOT_FOUND" ] && [ "$EXCEL_URL" != "null" ]; then
  echo "✅ Excel file URL: $EXCEL_URL"
else
  echo "⚠️  Excel file URL not found (may need write_files scope)"
fi

echo ""
echo "Test complete!"
