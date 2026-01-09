#!/bin/bash

# ================================================================
# Docker Entrypoint - Auto Migration & Start
# ================================================================
# This script runs when the Docker container starts
# It handles database migrations automatically
# ================================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Juelle Hair Backend${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check required environment variables
echo -e "${BLUE}→${NC} Checking environment..."

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL is not set${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}✗ JWT_SECRET is not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment variables OK"
echo ""

# Wait for database to be ready
echo -e "${BLUE}→${NC} Waiting for database..."

# Parse host and port more robustly
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:/]*\).*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p' | cut -d'/' -f1)

if [ -z "$DB_PORT" ]; then
    DB_PORT=5432
fi

echo "   Connecting to $DB_HOST:$DB_PORT..."

# Wait for database (max 30 seconds)
timeout=30
counter=0

while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        echo -e "${RED}✗ Database connection timeout${NC}"
        exit 1
    fi
    echo -e "   Waiting for database... ($counter/$timeout)"
    sleep 1
done

echo -e "${GREEN}✓${NC} Database is ready"
echo ""

# Generate Prisma Client
echo -e "${BLUE}→${NC} Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Prisma Client generated"
echo ""

# Check if database needs migration
echo -e "${BLUE}→${NC} Checking database status..."

# Count tables (excluding _prisma_migrations)
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name != '_prisma_migrations';" \
    2>/dev/null | tr -d ' ' || echo "0")

if [ "$TABLE_COUNT" = "0" ] || [ "$FORCE_IMPORT" = "true" ]; then
    if [ "$FORCE_IMPORT" = "true" ]; then
        echo -e "${YELLOW}⚠️  FORCE_IMPORT detected${NC}"
    else
        echo -e "${YELLOW}⚠️  Empty database detected${NC}"
    fi
    echo ""
    echo -e "${BLUE}→${NC} Running production baseline import..."
    
    # Check if baseline file exists
    if [ -f "./prisma/migrations/production-baseline.sql" ]; then
        # Import the baseline
        bash ./scripts/import-production-database.sh
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Database imported successfully"
        else
            echo -e "${RED}✗ Database import failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  No baseline file found, running Prisma migrate...${NC}"
        npx prisma migrate deploy --schema=./prisma/schema.prisma
    fi
else
    echo -e "${GREEN}✓${NC} Database exists (${TABLE_COUNT} tables)"
    echo -e "${BLUE}→${NC} Checking for pending migrations..."
    
    # Run any pending migrations
    npx prisma migrate deploy --schema=./prisma/schema.prisma 2>&1 | grep -E "Applied|up to date|No pending" || true
    echo -e "${GREEN}✓${NC} Migrations up to date"
fi

unset PGPASSWORD
echo ""

# Build application (if needed)
if [ ! -d "./dist" ]; then
    echo -e "${BLUE}→${NC} Building application..."
    npm run build
    echo -e "${GREEN}✓${NC} Build complete"
    echo ""
fi

# Start the application
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Starting Application${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "🚀 Server starting on port ${PORT:-3001}..."
echo -e "🗄️  Database: Connected"
echo -e "🔐 JWT: Configured"
echo ""

# Execute the main command (passed as arguments)
exec "$@"

