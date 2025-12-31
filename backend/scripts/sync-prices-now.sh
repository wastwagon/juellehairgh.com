#!/bin/bash

# Quick script to sync prices from local to production
# Usage: ./sync-prices-now.sh

# Production database URL
PROD_DB_URL="postgresql://juellehair_user:aBHT8CuQ8qADgxzDbOz3LL7b0RX5HwfK@dpg-d4s49nvdiees73djtjgg-a.oregon-postgres.render.com/juellehair_ec5x"

echo "🔄 Syncing Product Prices from Local to Production..."
echo ""

# Set production database URL and run sync script
export DATABASE_URL_PROD="$PROD_DB_URL"

# Run the TypeScript sync script
cd "$(dirname "$0")/.."
npx ts-node scripts/sync-prices-to-production.ts

