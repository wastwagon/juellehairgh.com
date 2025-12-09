#!/bin/sh
set -e

# Run Prisma migrations (if any pending)
echo "Running Prisma migrations..."
npx prisma migrate deploy || echo "No migrations to run or migration failed (continuing...)"

# Start the application
echo "Starting application..."
# NestJS builds to dist/src/main.js (preserves source structure)
exec node dist/src/main.js

# Production startup script for Render deployment

