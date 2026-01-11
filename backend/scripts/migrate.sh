#!/bin/sh
set -e

echo "🔄 Running database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Database migrations completed successfully!"
