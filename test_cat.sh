#!/bin/bash

# Test de création de catégorie
echo "🔐 Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3005/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digikoder.local","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:20}..."

echo ""
echo "📝 Creating test category..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3005/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "id": "test",
    "label": "Test Catégorie",
    "icon": "Filter"
  }')

echo "Create response: $CREATE_RESPONSE"

echo ""
echo "📋 Listing all categories..."
curl -s http://localhost:3005/api/categories | jq .

echo ""
echo "✅ Test completed!"
