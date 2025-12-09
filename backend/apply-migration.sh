#!/bin/bash

# Quick migration script to add compareAtPriceGhs column
# This fixes the 500 error on /api/products endpoint

echo "🔧 Applying migration: Add variant sale price column..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in environment"
    echo "Please set DATABASE_URL in your .env file or export it"
    echo ""
    echo "Example:"
    echo "  export DATABASE_URL='postgresql://user:password@localhost:5432/dbname'"
    exit 1
fi

# Try to apply migration using Prisma
echo "📦 Running Prisma migration..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo "🔄 Regenerating Prisma Client..."
    npx prisma generate
    echo "✅ Done! Please restart your backend server."
else
    echo "❌ Migration failed. Trying manual SQL..."
    echo ""
    echo "You can manually run this SQL:"
    echo "  ALTER TABLE \"product_variants\" ADD COLUMN IF NOT EXISTS \"compareAtPriceGhs\" DECIMAL(10,2);"
fi
