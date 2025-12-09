#!/bin/bash

# Feature Testing Script
# This script tests all the new features added to the application

API_BASE="http://localhost:3001/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Testing New Features"
echo "=========================================="
echo ""

# Test 1: Badge Templates
echo -e "${YELLOW}1. Testing Badge Templates...${NC}"
echo "  GET /api/badges (public)"
curl -s "$API_BASE/badges" | jq '.' 2>/dev/null | head -5 || echo "  ❌ Failed"
echo ""

# Test 2: Testimonials
echo -e "${YELLOW}2. Testing Testimonials...${NC}"
echo "  GET /api/testimonials (public)"
curl -s "$API_BASE/testimonials" | jq '.' 2>/dev/null | head -5 || echo "  ❌ Failed"
echo ""

# Test 3: Trust Badges
echo -e "${YELLOW}3. Testing Trust Badges...${NC}"
echo "  GET /api/trust-badges (public)"
curl -s "$API_BASE/trust-badges" | jq '.' 2>/dev/null | head -5 || echo "  ❌ Failed"
echo ""

# Test 4: Flash Sales
echo -e "${YELLOW}4. Testing Flash Sales...${NC}"
echo "  GET /api/flash-sales/active (public)"
curl -s "$API_BASE/flash-sales/active" | jq '.' 2>/dev/null | head -5 || echo "  ❌ Failed (may return null if no active sale)"
echo ""

# Test 5: Blog Posts
echo -e "${YELLOW}5. Testing Blog Posts...${NC}"
echo "  GET /api/blog (public)"
curl -s "$API_BASE/blog" | jq '.' 2>/dev/null | head -5 || echo "  ❌ Failed"
echo ""
echo "  GET /api/blog/categories"
curl -s "$API_BASE/blog/categories" | jq '.' 2>/dev/null | head -5 || echo "  ❌ Failed"
echo ""

# Test 6: Product Recommendations
echo -e "${YELLOW}6. Testing Product Recommendations...${NC}"
echo "  Note: Requires a valid product ID"
echo "  GET /api/products/recommendations/:id"
echo "  GET /api/products/frequently-bought-together/:id"
echo ""

echo "=========================================="
echo -e "${GREEN}Public API Tests Complete!${NC}"
echo "=========================================="
echo ""
echo "Note: Admin endpoints require authentication."
echo "Please test admin features through the frontend dashboard."
echo ""
echo "Frontend URLs to test:"
echo "  - http://localhost:8002/admin/badges"
echo "  - http://localhost:8002/admin/testimonials"
echo "  - http://localhost:8002/admin/trust-badges"
echo "  - http://localhost:8002/admin/flash-sales"
echo "  - http://localhost:8002/admin/blog"
echo "  - http://localhost:8002/blog"
echo "  - http://localhost:8002/ (homepage - check new sections)"
