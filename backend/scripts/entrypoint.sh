#!/bin/sh
set -e

echo "🚀 Starting application..."

# Run database migrations
if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy
  echo "✅ Migrations completed"
else
  echo "⚠️  WARNING: DATABASE_URL not set, skipping migrations"
fi

# Start the application
echo "🎯 Starting NestJS application..."
exec npm run start:prod
