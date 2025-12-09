#!/bin/bash
# Migration script for Render database
# Usage: DATABASE_URL="your_render_db_url" ./run_migration.sh

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  echo "Usage: DATABASE_URL='your_database_url' ./run_migration.sh"
  exit 1
fi

echo "Running Prisma migration..."
npx prisma migrate deploy

echo "Generating Prisma Client..."
npx prisma generate

echo "Migration completed successfully!"
