#!/bin/bash

# Script to seed categories and brands in production database
# Usage: ./seed-production.sh

set -e

echo "🚀 Seeding Categories and Brands to Production Database"
echo "========================================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo ""
    echo "Please set it before running this script:"
    echo "  export DATABASE_URL='your-production-database-url'"
    echo ""
    echo "Or run with:"
    echo "  DATABASE_URL='your-url' ./seed-production.sh"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
    echo "❌ ERROR: Please run this script from the backend directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Generate Prisma client if needed
echo "🔧 Generating Prisma client..."
npx prisma generate
echo ""

# Run the seed script
echo "🌱 Running seed script..."
echo ""
npx ts-node scripts/seed-categories-brands.ts

echo ""
echo "✅ Done! Categories and brands have been seeded."
echo ""
echo "You can verify by checking your production API:"
echo "  GET /api/categories"
echo "  GET /api/brands"

