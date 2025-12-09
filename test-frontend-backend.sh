#!/bin/bash

# Frontend-Backend Communication Test Script
# Tests all critical endpoints and admin pages

echo "=========================================="
echo "Frontend-Backend Communication Test"
echo "=========================================="
echo ""

FRONTEND_URL="https://juelle-hair-web.onrender.com"
BACKEND_URL="https://juelle-hair-backend.onrender.com"
API_URL="${BACKEND_URL}/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: ${FRONTEND_URL}" "$url")
    else
        status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Origin: ${FRONTEND_URL}" "$url")
    fi
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓ OK (200)${NC}"
        return 0
    elif [ "$status" = "401" ]; then
        echo -e "${YELLOW}⚠ Unauthorized (401) - Expected for protected endpoints${NC}"
        return 0
    elif [ "$status" = "404" ]; then
        echo -e "${YELLOW}⚠ Not Found (404)${NC}"
        return 1
    elif [ "$status" = "500" ]; then
        echo -e "${RED}✗ Server Error (500)${NC}"
        return 1
    else
        echo -e "${RED}✗ Failed ($status)${NC}"
        return 1
    fi
}

# Test CORS
test_cors() {
    echo -n "Testing CORS... "
    cors_headers=$(curl -s -X OPTIONS \
        -H "Origin: ${FRONTEND_URL}" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -v "${API_URL}/products" 2>&1 | grep -i "access-control-allow-origin")
    
    if echo "$cors_headers" | grep -q "juelle-hair-web.onrender.com"; then
        echo -e "${GREEN}✓ CORS configured correctly${NC}"
        return 0
    else
        echo -e "${RED}✗ CORS not configured${NC}"
        return 1
    fi
}

echo "=== Backend Health Check ==="
test_endpoint "Backend Health" "${BACKEND_URL}/health"
echo ""

echo "=== Backend API Endpoints ==="
test_endpoint "Products API" "${API_URL}/products"
test_endpoint "Collections API" "${API_URL}/collections"
test_endpoint "Categories API" "${API_URL}/categories"
test_endpoint "Settings API" "${API_URL}/settings/public"
test_endpoint "Currency Rates" "${API_URL}/currency/rates"
test_endpoint "Flash Sales" "${API_URL}/flash-sales/active"
test_endpoint "Blog Posts" "${API_URL}/blog?published=true&limit=4"
echo ""

echo "=== Frontend Pages ==="
test_endpoint "Homepage" "${FRONTEND_URL}/"
test_endpoint "Products Page" "${FRONTEND_URL}/products"
test_endpoint "Shop All" "${FRONTEND_URL}/shop-all"
test_endpoint "Login Page" "${FRONTEND_URL}/login"
echo ""

echo "=== Admin Pages (Should return 401 or redirect) ==="
test_endpoint "Admin Dashboard" "${FRONTEND_URL}/admin"
test_endpoint "Admin Products" "${FRONTEND_URL}/admin/products"
test_endpoint "Admin Orders" "${FRONTEND_URL}/admin/orders"
test_endpoint "Admin Customers" "${FRONTEND_URL}/admin/customers"
test_endpoint "Admin Settings" "${FRONTEND_URL}/admin/settings"
test_endpoint "Admin Collections" "${FRONTEND_URL}/admin/collections"
test_endpoint "Admin Categories" "${FRONTEND_URL}/admin/categories"
test_endpoint "Admin Brands" "${FRONTEND_URL}/admin/brands"
test_endpoint "Admin Reviews" "${FRONTEND_URL}/admin/reviews"
test_endpoint "Admin Media" "${FRONTEND_URL}/admin/media"
test_endpoint "Admin Blog" "${FRONTEND_URL}/admin/blog"
test_endpoint "Admin SEO" "${FRONTEND_URL}/admin/seo"
test_endpoint "Admin Analytics" "${FRONTEND_URL}/admin/analytics"
test_endpoint "Admin Shipping" "${FRONTEND_URL}/admin/shipping"
test_endpoint "Admin Currency" "${FRONTEND_URL}/admin/currency"
test_endpoint "Admin Discount Codes" "${FRONTEND_URL}/admin/discount-codes"
test_endpoint "Admin Banners" "${FRONTEND_URL}/admin/banners"
test_endpoint "Admin Flash Sales" "${FRONTEND_URL}/admin/flash-sales"
test_endpoint "Admin Newsletter" "${FRONTEND_URL}/admin/newsletter"
test_endpoint "Admin Emails" "${FRONTEND_URL}/admin/emails"
test_endpoint "Admin Attributes" "${FRONTEND_URL}/admin/attributes"
test_endpoint "Admin Product Variations" "${FRONTEND_URL}/admin/product-variations"
test_endpoint "Admin Trust Badges" "${FRONTEND_URL}/admin/trust-badges"
test_endpoint "Admin Wallets" "${FRONTEND_URL}/admin/wallets"
test_endpoint "Admin Badges" "${FRONTEND_URL}/admin/badges"
echo ""

echo "=== CORS Configuration ==="
test_cors
echo ""

echo "=========================================="
echo "Test Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Backend health endpoint should return 200"
echo "- API endpoints returning 500 need backend fixes"
echo "- Admin pages should be accessible (may require auth)"
echo "- CORS should be configured correctly"
echo ""
echo "Next Steps:"
echo "1. Check backend logs for 500 errors"
echo "2. Fix backend issues (likely JWT_SECRET or database)"
echo "3. Verify admin pages load correctly in browser"
echo "4. Test admin functionality after login"
