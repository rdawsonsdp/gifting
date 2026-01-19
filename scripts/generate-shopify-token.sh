#!/bin/bash

# Script to generate Shopify Admin API Access Token using Client Credentials Grant
# Usage: ./scripts/generate-shopify-token.sh

STORE_DOMAIN="brown-sugar-bakery-chicago.myshopify.com"
CLIENT_ID="YOUR_CLIENT_ID_HERE"
CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"

echo "Generating Shopify Admin API Access Token..."
echo "Store: $STORE_DOMAIN"
echo ""

# Make the API request
RESPONSE=$(curl -s -X POST "https://${STORE_DOMAIN}/admin/oauth/access_token" \
  -H "Content-Type: application/json" \
  -d "{
    \"client_id\": \"${CLIENT_ID}\",
    \"client_secret\": \"${CLIENT_SECRET}\",
    \"grant_type\": \"client_credentials\"
  }")

# Check if we got an error
if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ Error generating token:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "Possible issues:"
  echo "1. App may not be installed yet"
  echo "2. Scopes may not be configured"
  echo "3. Client credentials may be incorrect"
  exit 1
fi

# Extract the access token
ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Could not extract access token from response:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

echo "✅ Successfully generated access token!"
echo ""
echo "Access Token: $ACCESS_TOKEN"
echo ""
echo "Add this to your .env.local file:"
echo "SHOPIFY_ADMIN_API_ACCESS_TOKEN=$ACCESS_TOKEN"
echo ""
