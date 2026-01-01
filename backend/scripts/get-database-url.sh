#!/bin/bash

# Helper script to get DATABASE_URL from Render environment
# This script helps you find the correct DATABASE_URL

echo "🔍 Finding DATABASE_URL..."
echo ""

# Check if DATABASE_URL is already set
if [ ! -z "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is already set:"
    echo "   ${DATABASE_URL:0:30}..."
    echo ""
    echo "If this is correct, you can run:"
    echo "   ./scripts/seed-production.sh"
    exit 0
fi

# Check Render environment variables
echo "Checking Render environment variables..."
echo ""

# Try to find database URL in common Render env vars
if [ ! -z "$RENDER_DATABASE_URL" ]; then
    echo "✅ Found RENDER_DATABASE_URL"
    export DATABASE_URL="$RENDER_DATABASE_URL"
    echo "   ${DATABASE_URL:0:30}..."
elif [ ! -z "$DATABASE_URL" ]; then
    echo "✅ Found DATABASE_URL"
    echo "   ${DATABASE_URL:0:30}..."
else
    echo "❌ DATABASE_URL not found in environment"
    echo ""
    echo "To get your DATABASE_URL from Render:"
    echo "1. Go to your Render dashboard"
    echo "2. Click on your Database service"
    echo "3. Go to 'Info' tab"
    echo "4. Copy the 'Internal Database URL' or 'Connection Pooling URL'"
    echo ""
    echo "Then run:"
    echo "   export DATABASE_URL='postgresql://user:password@host:port/database'"
    echo "   ./scripts/seed-production.sh"
    exit 1
fi

echo ""
echo "✅ Ready to seed! Run:"
echo "   ./scripts/seed-production.sh"

