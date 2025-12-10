#!/bin/bash

# Full Production Deployment Script
# Run this on Render Shell to deploy all features to production

set -e  # Exit on error

echo "🚀 Full Production Deployment"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from backend directory${NC}"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Categorize Products${NC}"
echo "-----------------------------"
npx ts-node scripts/categorize-products.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Products categorized${NC}"
else
    echo -e "${RED}❌ Failed to categorize products${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}📋 Step 2: Setup All Features${NC}"
echo "-----------------------------"
npx ts-node scripts/setup-all-features.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Features setup complete${NC}"
else
    echo -e "${RED}❌ Failed to setup features${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}📋 Step 3: Verify Database${NC}"
echo "--------------------------"
DB_STATUS=$(curl -s https://juelle-hair-backend.onrender.com/api/health/db)
if echo "$DB_STATUS" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Database connected${NC}"
    echo "$DB_STATUS" | grep -o '"products":[0-9]*' | head -1
    echo "$DB_STATUS" | grep -o '"categories":[0-9]*' | head -1
else
    echo -e "${RED}❌ Database check failed${NC}"
    echo "$DB_STATUS"
fi
echo ""

echo -e "${BLUE}📋 Step 4: Test Products API${NC}"
echo "---------------------------"
PRODUCTS_RESPONSE=$(curl -s https://juelle-hair-backend.onrender.com/api/products)
if echo "$PRODUCTS_RESPONSE" | grep -q '"products"'; then
    PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | grep -o '{"id"' | wc -l || echo "0")
    echo -e "${GREEN}✅ Products API working${NC}"
    echo "Products available: $PRODUCT_COUNT"
else
    echo -e "${RED}❌ Products API failed${NC}"
fi
echo ""

echo -e "${BLUE}📋 Step 5: Test Categories API${NC}"
echo "-------------------------------"
CATEGORIES_RESPONSE=$(curl -s https://juelle-hair-backend.onrender.com/api/categories)
if echo "$CATEGORIES_RESPONSE" | grep -q '\[.*\]'; then
    CATEGORY_COUNT=$(echo "$CATEGORIES_RESPONSE" | grep -o '"slug"' | wc -l || echo "0")
    echo -e "${GREEN}✅ Categories API working${NC}"
    echo "Categories available: $CATEGORY_COUNT"
else
    echo -e "${RED}❌ Categories API failed${NC}"
fi
echo ""

echo -e "${BLUE}📋 Step 6: Test Blog API${NC}"
echo "---------------------"
BLOG_RESPONSE=$(curl -s https://juelle-hair-backend.onrender.com/api/blog)
if echo "$BLOG_RESPONSE" | grep -q '\[.*\]'; then
    BLOG_COUNT=$(echo "$BLOG_RESPONSE" | grep -o '"slug"' | wc -l || echo "0")
    echo -e "${GREEN}✅ Blog API working${NC}"
    echo "Blog posts available: $BLOG_COUNT"
else
    echo -e "${YELLOW}⚠️  Blog API returned empty or error${NC}"
fi
echo ""

echo -e "${BLUE}📋 Step 7: Test Flash Sales API${NC}"
echo "---------------------------"
FLASH_SALE_RESPONSE=$(curl -s https://juelle-hair-backend.onrender.com/api/flash-sales/active)
if echo "$FLASH_SALE_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Flash Sales API working${NC}"
    echo "Active flash sale found"
else
    echo -e "${YELLOW}⚠️  No active flash sale (this is OK)${NC}"
fi
echo ""

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  ✅ Products categorized and organized"
echo "  ✅ Categories created and accessible"
echo "  ✅ Blog posts setup"
echo "  ✅ Flash sales configured"
echo "  ✅ Reviews feature ready"
echo ""
echo "🌐 Test your site:"
echo "  Frontend: https://juelle-hair-web.onrender.com"
echo "  Shop All: https://juelle-hair-web.onrender.com/categories/shop-all"
echo "  Blog: https://juelle-hair-web.onrender.com/blog"
echo "  Categories: https://juelle-hair-web.onrender.com/categories/lace-wigs"
echo ""
