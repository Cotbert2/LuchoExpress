#!/bin/bash

# Script para debuggear el problema con Personal Shopper
echo "==================================="
echo "DEBUG: Personal Shopper Token Issue"
echo "==================================="

# 1. Login as personal shopper
echo -e "\n1. Login as Personal Shopper..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "personalshopper",
    "password": "pspassword123"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "ERROR: Failed to get token"
    exit 1
fi

echo -e "\nToken obtained successfully"

# 2. Decode JWT to check claims
echo -e "\n2. Decoded JWT Claims:"
# Extract payload (second part of JWT)
PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2)
# Add padding if needed
PADDING=$((4 - ${#PAYLOAD} % 4))
if [ $PADDING -ne 4 ]; then
    PAYLOAD="${PAYLOAD}$(printf '=%.0s' $(seq 1 $PADDING))"
fi
# Decode base64
echo "$PAYLOAD" | base64 -d 2>/dev/null | jq '.'

# 3. Check /me endpoint
echo -e "\n3. Testing /me endpoint..."
ME_RESPONSE=$(curl -s -X GET http://localhost:8080/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "User Info:"
echo "$ME_RESPONSE" | jq '.'

# 4. Try to get personal shopper orders
echo -e "\n4. Testing /api/orders/personal-shopper/my-orders endpoint..."
ORDERS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
  http://localhost:8080/api/orders/personal-shopper/my-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$ORDERS_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$ORDERS_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

# 5. Check if ms-chat has the personal shopper
echo -e "\n5. Checking ms-chat for Personal Shopper..."
# First get userId from /me
USER_ID=$(echo "$ME_RESPONSE" | jq -r '.id')
echo "User ID: $USER_ID"

PS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
  "http://localhost:8080/api/personal-shoppers/by-user/$USER_ID" \
  -H "Content-Type: application/json")

PS_HTTP_STATUS=$(echo "$PS_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
PS_BODY=$(echo "$PS_RESPONSE" | sed '/HTTP_STATUS/d')

echo "Personal Shopper lookup HTTP Status: $PS_HTTP_STATUS"
echo "Personal Shopper Response:"
echo "$PS_BODY" | jq '.' 2>/dev/null || echo "$PS_BODY"

echo -e "\n==================================="
echo "DEBUG COMPLETE"
echo "==================================="
