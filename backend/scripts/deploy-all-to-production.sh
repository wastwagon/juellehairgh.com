#!/bin/bash

# Comprehensive Production Deployment Script
# Run this on Render Shell to deploy all features

set -e  # Exit on error

echo "🚀 Production Deployment Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from backend directory${NC}"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "📋 Step 1: Categorize Products"
echo "-----------------------------"
npx ts-node scripts/categorize-products.ts
echo ""

echo "📋 Step 2: Setup All Features"
echo "-----------------------------"
npx ts-node scripts/setup-all-features.ts
echo ""

echo "📋 Step 3: Verify Database"
echo "--------------------------"
echo "Checking database status..."
DB_STATUS=$(curl -s https://juelle-hair-backend.onrender.com/api/health/db)
echo "$DB_STATUS"
echo ""

echo "📋 Step 4: Test Products API"
echo "---------------------------"
PRODUCTS_COUNT=$(curl -s https://juelle-hair-backend.onrender.com/api/products | grep -o '"products":\[.*\]' | grep -o '{"id"' | wc -l || echo "0")
echo "Products available: $PRODUCTS_COUNT"
echo ""

echo "📋 Step 5: Test Categories API"
echo "-------------------------------"
CATEGORIES=$(curl -s https://juelle-hair-backend.onrender.com/api/categories | head -c 200)
echo "Categories: ${CATEGORIES}..."
echo ""

echo "✅ Deployment Complete!"
echo ""
echo "📊 Summary:"
echo "  - Products categorized"
echo "  - Categories created and organized"
echo "  - Blog posts setup"
echo "  - Flash sales configured"
echo "  - Reviews feature ready"
echo ""
echo "🌐 Test your site:"
echo "  Frontend: https://juelle-hair-web.onrender.com"
echo "  Shop All: https://juelle-hair-web.onrender.com/categories/shop-all"
echo "  Blog: https://juelle-hair-web.onrender.com/blog"
echo ""
