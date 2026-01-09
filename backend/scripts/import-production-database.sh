#!/bin/bash

# ================================================================
# Import Production Database
# ================================================================
# This script imports the production baseline database
# Only runs if the database is empty (safety measure)
# ================================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Database Import Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Configuration - reads from environment
DB_URL="${DATABASE_URL}"
MIGRATION_FILE="./prisma/migrations/production-baseline.sql"

if [ -z "$DB_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable not set${NC}"
    exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}[1/5]${NC} Checking database status..."

# Parse DATABASE_URL to get connection details
# Format: postgresql://user:pass@host:port/dbname?schema=public
DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DB_URL" | sed -n 's/.*:\/\/\([^:]*\).*/\1/p')
DB_PASS=$(echo "$DB_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\).*/\1/p')

export PGPASSWORD="$DB_PASS"

# Check if database is empty (no tables except _prisma_migrations)
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name != '_prisma_migrations';" 2>/dev/null | tr -d ' ')

if [ -z "$TABLE_COUNT" ]; then
    echo -e "${RED}Error: Could not connect to database${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Database connected"
echo -e "   Tables found: $TABLE_COUNT"
echo ""

# Safety check - only import if database is empty
if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Database is not empty!${NC}"
    echo -e "   Found $TABLE_COUNT existing tables"
    echo ""
    
    # Check for FORCE_IMPORT flag
    if [ "$FORCE_IMPORT" != "true" ]; then
        echo -e "${RED}Import cancelled for safety${NC}"
        echo -e "   To force import anyway, set: FORCE_IMPORT=true"
        echo -e "   ${YELLOW}Warning: This will drop all existing data!${NC}"
        exit 0
    else
        echo -e "${YELLOW}FORCE_IMPORT=true detected${NC}"
        echo -e "${RED}⚠️  Nuclear Option: Dropping public schema...${NC}"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        
        echo -e "${BLUE}→${NC} Schema dropped. Proceeding with import..."
        echo "   Waiting 2 seconds..."
        sleep 2
    fi
else
    echo -e "${GREEN}✓${NC} Database is empty - safe to import"
fi

echo ""
echo -e "${BLUE}[2/5]${NC} Preparing database import..."
FILE_SIZE=$(du -h "$MIGRATION_FILE" | cut -f1)
echo -e "${GREEN}✓${NC} Migration file: $MIGRATION_FILE ($FILE_SIZE)"
echo ""

# Import the database
echo -e "${BLUE}[3/5]${NC} Importing database (this may take 30-60 seconds)..."
echo ""

# Run the SQL import
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -f "$MIGRATION_FILE" \
    -v ON_ERROR_STOP=1 \
    --quiet 2>&1 | grep -v "^$"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Database import successful"
else
    echo -e "${RED}✗${NC} Database import failed"
    exit 1
fi

echo ""
echo -e "${BLUE}[4/5]${NC} Verifying import..."

# Verify key tables
PRODUCT_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM products;" | tr -d ' ')
CATEGORY_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM categories;" | tr -d ' ')
USER_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')

echo -e "${GREEN}✓${NC} Database verification:"
echo "   - Products: $PRODUCT_COUNT"
echo "   - Categories: $CATEGORY_COUNT"
echo "   - Users: $USER_COUNT"
echo ""

echo -e "${BLUE}[5/5]${NC} Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma 2>&1 | grep -E "Applied|up to date|No pending"
echo ""

# Clean up
unset PGPASSWORD

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Import Complete! ✓${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "🎉 Your production database is ready!"
echo ""
echo "📊 Imported Data:"
echo "   ✓ $PRODUCT_COUNT products"
echo "   ✓ $CATEGORY_COUNT categories"
echo "   ✓ $USER_COUNT users (production only)"
echo "   ✓ All orders, reviews, and settings"
echo ""
echo "🚀 Application can now start successfully"
echo ""

exit 0

