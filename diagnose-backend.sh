#!/bin/bash

# Backend Diagnostic Script
# Tests backend endpoints and provides diagnostic information

echo "=========================================="
echo "Backend Diagnostic Tool"
echo "=========================================="
echo ""

BACKEND_URL="https://juelle-hair-backend.onrender.com"
API_URL="${BACKEND_URL}/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Backend Health Check ===${NC}"
health_status=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/health")
if [ "$health_status" = "200" ]; then
    echo -e "${GREEN}✓ Backend is running (200 OK)${NC}"
    health_response=$(curl -s "${BACKEND_URL}/health")
    echo "Response: $health_response"
else
    echo -e "${RED}✗ Backend health check failed ($health_status)${NC}"
fi
echo ""

echo -e "${BLUE}=== Testing API Endpoints ===${NC}"
endpoints=(
    "products"
    "collections"
    "categories"
    "settings/public"
    "currency/rates"
    "flash-sales/active"
    "blog?published=true&limit=4"
)

for endpoint in "${endpoints[@]}"; do
    echo -n "Testing /api/${endpoint}... "
    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://juelle-hair-web.onrender.com" "${API_URL}/${endpoint}")
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓ OK (200)${NC}"
    elif [ "$status" = "500" ]; then
        echo -e "${RED}✗ Server Error (500)${NC}"
        # Try to get error details
        error_response=$(curl -s -H "Origin: https://juelle-hair-web.onrender.com" "${API_URL}/${endpoint}" 2>&1)
        echo "  Error: $error_response" | head -1
    elif [ "$status" = "404" ]; then
        echo -e "${YELLOW}⚠ Not Found (404)${NC}"
    elif [ "$status" = "401" ]; then
        echo -e "${YELLOW}⚠ Unauthorized (401) - May require auth${NC}"
    else
        echo -e "${RED}✗ Failed ($status)${NC}"
    fi
done
echo ""

echo -e "${BLUE}=== CORS Test ===${NC}"
cors_test=$(curl -s -X OPTIONS \
    -H "Origin: https://juelle-hair-web.onrender.com" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    -v "${API_URL}/products" 2>&1 | grep -i "access-control-allow-origin")

if echo "$cors_test" | grep -q "juelle-hair-web.onrender.com"; then
    echo -e "${GREEN}✓ CORS configured correctly${NC}"
else
    echo -e "${RED}✗ CORS not configured${NC}"
fi
echo ""

echo -e "${BLUE}=== Diagnostic Summary ===${NC}"
echo ""
echo "If all endpoints return 500:"
echo "  1. Check backend logs in Render Dashboard"
echo "  2. Update JWT_SECRET (currently placeholder)"
echo "  3. Verify DATABASE_URL is set correctly"
echo "  4. Check database connection"
echo ""
echo "Most likely issue: JWT_SECRET placeholder"
echo "  Current: CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32"
echo "  Fix: Generate with 'openssl rand -base64 32'"
echo "  Update in: Render Dashboard → juelle-hair-backend → Environment"
echo ""
echo "Next Steps:"
echo "  1. Open Render Dashboard"
echo "  2. Go to juelle-hair-backend → Logs"
echo "  3. Copy the error message"
echo "  4. Update JWT_SECRET"
echo "  5. Wait for restart"
echo "  6. Run this script again to verify"
echo ""
