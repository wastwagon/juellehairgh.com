#!/bin/bash

# Simple script to seed categories and brands in production
# Usage: DATABASE_URL="your-db-url" ./run-seed-production.sh

set -e

echo "🚀 Seeding Categories and Brands"
echo "=================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo ""
    echo "Please set it before running:"
    echo "  export DATABASE_URL='postgresql://user:password@host:port/database'"
    echo ""
    echo "Or run with:"
    echo "  DATABASE_URL='your-url' ./run-seed-production.sh"
    exit 1
fi

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: Please run this script from the backend directory"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo "📦 Installing dependencies if needed..."
npm install --silent 2>/dev/null || true

echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🌱 Running seed script..."
echo ""

# Run the seed script
npx ts-node scripts/seed-categories-brands.ts

echo ""
echo "✅ Done!"

