#!/bin/bash

# Production Products Loading Diagnostic Script
# Run this on Render Shell to diagnose why products aren't loading

echo "🔍 Production Products Loading Diagnostic"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="https://juelle-hair-backend.onrender.com"
FRONTEND_URL="https://juelle-hair-web.onrender.com"

echo "📋 Step 1: Check Backend Health"
echo "--------------------------------"
echo "Testing: $BACKEND_URL/api/health"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$HEALTH_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Backend health check: OK${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ Backend health check: FAILED (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

echo "📋 Step 2: Check Database Connection"
echo "-------------------------------------"
echo "Testing: $BACKEND_URL/api/health/db"
DB_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/api/health/db")
DB_HTTP_CODE=$(echo "$DB_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
DB_BODY=$(echo "$DB_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$DB_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Database check: OK${NC}"
    echo "Response: $DB_BODY"
    
    # Extract product count
    PRODUCT_COUNT=$(echo "$DB_BODY" | grep -o '"products":[0-9]*' | cut -d: -f2)
    if [ -n "$PRODUCT_COUNT" ]; then
        echo "Products in database: $PRODUCT_COUNT"
    fi
else
    echo -e "${RED}❌ Database check: FAILED (HTTP $DB_HTTP_CODE)${NC}"
    echo "Response: $DB_BODY"
fi
echo ""

echo "📋 Step 3: Test Products API Endpoint"
echo "--------------------------------------"
echo "Testing: $BACKEND_URL/api/products"
PRODUCTS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/api/products")
PRODUCTS_HTTP_CODE=$(echo "$PRODUCTS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
PRODUCTS_BODY=$(echo "$PRODUCTS_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$PRODUCTS_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Products API: OK (HTTP $PRODUCTS_HTTP_CODE)${NC}"
    
    # Check if products array exists
    if echo "$PRODUCTS_BODY" | grep -q '"products"'; then
        PRODUCT_COUNT=$(echo "$PRODUCTS_BODY" | grep -o '"products":\[.*\]' | grep -o '{"id"' | wc -l || echo "0")
        echo "Products returned: $PRODUCT_COUNT"
        
        # Show first product (truncated)
        FIRST_PRODUCT=$(echo "$PRODUCTS_BODY" | grep -o '"products":\[.*\]' | head -c 200)
        echo "First product preview: ${FIRST_PRODUCT}..."
    else
        echo -e "${YELLOW}⚠️  Products API returned 200 but no products array found${NC}"
    fi
else
    echo -e "${RED}❌ Products API: FAILED (HTTP $PRODUCTS_HTTP_CODE)${NC}"
    echo "Response: $PRODUCTS_BODY"
fi
echo ""

echo "📋 Step 4: Test CORS Configuration"
echo "-----------------------------------"
echo "Testing CORS from frontend origin"
CORS_RESPONSE=$(curl -s -X OPTIONS \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -w "\nHTTP_CODE:%{http_code}" \
  "$BACKEND_URL/api/products")

CORS_HTTP_CODE=$(echo "$CORS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
CORS_HEADERS=$(echo "$CORS_RESPONSE" | sed '/HTTP_CODE/d' | head -20)

if echo "$CORS_HEADERS" | grep -qi "access-control-allow-origin"; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    echo "$CORS_HEADERS" | grep -i "access-control"
else
    echo -e "${YELLOW}⚠️  CORS headers not found in OPTIONS response${NC}"
fi
echo ""

echo "📋 Step 5: Test Products API with CORS Headers"
echo "-----------------------------------------------"
echo "Testing: $BACKEND_URL/api/products (with Origin header)"
CORS_PRODUCTS_RESPONSE=$(curl -s -H "Origin: $FRONTEND_URL" \
  -w "\nHTTP_CODE:%{http_code}" \
  "$BACKEND_URL/api/products")

CORS_PRODUCTS_HTTP_CODE=$(echo "$CORS_PRODUCTS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
CORS_PRODUCTS_HEADERS=$(curl -s -I -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/products")

if echo "$CORS_PRODUCTS_HEADERS" | grep -qi "access-control-allow-origin"; then
    echo -e "${GREEN}✅ CORS configured correctly${NC}"
    echo "$CORS_PRODUCTS_HEADERS" | grep -i "access-control"
else
    echo -e "${RED}❌ CORS not configured correctly${NC}"
    echo "Headers:"
    echo "$CORS_PRODUCTS_HEADERS"
fi
echo ""

echo "📋 Step 6: Check Frontend API Configuration"
echo "---------------------------------------------"
echo "Testing: $FRONTEND_URL"
FRONTEND_HTML=$(curl -s "$FRONTEND_URL" | head -100)

if echo "$FRONTEND_HTML" | grep -q "NEXT_PUBLIC_API_BASE_URL"; then
    echo -e "${GREEN}✅ Frontend API config found${NC}"
    API_URL=$(echo "$FRONTEND_HTML" | grep -o '"NEXT_PUBLIC_API_BASE_URL":"[^"]*"' | cut -d'"' -f4)
    echo "Frontend API URL: $API_URL"
    
    if [ "$API_URL" = "$BACKEND_URL/api" ]; then
        echo -e "${GREEN}✅ API URL matches backend${NC}"
    else
        echo -e "${YELLOW}⚠️  API URL mismatch: Expected $BACKEND_URL/api, got $API_URL${NC}"
    fi
else
    echo -e "${RED}❌ Frontend API config not found${NC}"
fi
echo ""

echo "📋 Step 7: Test Frontend Products Fetch"
echo "----------------------------------------"
echo "Simulating frontend API call..."
FRONTEND_PRODUCTS_RESPONSE=$(curl -s \
  -H "Origin: $FRONTEND_URL" \
  -H "Referer: $FRONTEND_URL/" \
  -w "\nHTTP_CODE:%{http_code}" \
  "$BACKEND_URL/api/products")

FRONTEND_PRODUCTS_HTTP_CODE=$(echo "$FRONTEND_PRODUCTS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$FRONTEND_PRODUCTS_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend can fetch products (HTTP $FRONTEND_PRODUCTS_HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Frontend cannot fetch products (HTTP $FRONTEND_PRODUCTS_HTTP_CODE)${NC}"
    echo "Response: $(echo "$FRONTEND_PRODUCTS_RESPONSE" | sed '/HTTP_CODE/d' | head -5)"
fi
echo ""

echo "📋 Step 8: Check Backend Logs (Recent Errors)"
echo "----------------------------------------------"
echo "Note: This requires Render CLI or dashboard access"
echo "Check Render Dashboard → juelle-hair-backend → Logs for:"
echo "  - Database connection errors"
echo "  - Prisma errors"
echo "  - 500 errors"
echo "  - CORS errors"
echo ""

echo "📋 Step 9: Summary"
echo "-------------------"
echo "Backend Health: $([ "$HTTP_CODE" = "200" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}")"
echo "Database: $([ "$DB_HTTP_CODE" = "200" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}")"
echo "Products API: $([ "$PRODUCTS_HTTP_CODE" = "200" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}")"
echo "CORS: $(echo "$CORS_PRODUCTS_HEADERS" | grep -qi "access-control-allow-origin" && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}")"
echo ""

if [ "$PRODUCTS_HTTP_CODE" != "200" ]; then
    echo -e "${RED}❌ ISSUE FOUND: Products API returning HTTP $PRODUCTS_HTTP_CODE${NC}"
    echo "Check backend logs for detailed error messages"
elif [ "$DB_HTTP_CODE" != "200" ]; then
    echo -e "${RED}❌ ISSUE FOUND: Database connection failed${NC}"
    echo "Check database connection and migrations"
else
    echo -e "${GREEN}✅ Backend appears to be working${NC}"
    echo "If products still don't load on frontend, check:"
    echo "  1. Browser console for JavaScript errors"
    echo "  2. Network tab for failed API requests"
    echo "  3. Frontend environment variables"
fi

echo ""
echo "🔍 Diagnostic Complete"
