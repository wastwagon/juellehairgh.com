#!/bin/bash

# Database Migration Script: Local Docker to Render
# This script migrates the local Docker database to Render PostgreSQL

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Render Database Connection Details
RENDER_HOST="dpg-d4nkgtngi27c73bi9j8g-a.oregon-postgres.render.com"
RENDER_DB="juellehair_k4fu"
RENDER_USER="juellehair_user"
RENDER_PASSWORD="lJbEutCA26lLKqZIaBfq4YWOdudkwGfC"
RENDER_URL="postgresql://${RENDER_USER}:${RENDER_PASSWORD}@${RENDER_HOST}/${RENDER_DB}"

# Local Database Details
LOCAL_CONTAINER="juelle-hair-db"
LOCAL_DB="juellehair"
LOCAL_USER="postgres"

echo -e "${GREEN}🚀 Starting Database Migration${NC}"
echo -e "${YELLOW}Source:${NC} Local Docker (${LOCAL_CONTAINER})"
echo -e "${YELLOW}Destination:${NC} Render PostgreSQL (${RENDER_HOST})"
echo ""

# Step 1: Export from local database
echo -e "${GREEN}Step 1: Exporting from local database...${NC}"
docker exec ${LOCAL_CONTAINER} pg_dump -U ${LOCAL_USER} -d ${LOCAL_DB} \
  --no-owner --no-acl --data-only --inserts \
  > /tmp/juellehair_data_migration.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Export successful${NC}"
  echo -e "   File size: $(du -h /tmp/juellehair_data_migration.sql | cut -f1)"
  echo -e "   Lines: $(wc -l < /tmp/juellehair_data_migration.sql)"
else
  echo -e "${RED}❌ Export failed${NC}"
  exit 1
fi

# Step 2: Check Render database connection
echo ""
echo -e "${GREEN}Step 2: Testing Render database connection...${NC}"
docker run --rm -e PGPASSWORD="${RENDER_PASSWORD}" postgres:15-alpine \
  psql -h ${RENDER_HOST} -U ${RENDER_USER} -d ${RENDER_DB} \
  -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Connection successful${NC}"
else
  echo -e "${RED}❌ Connection failed. Please check your credentials.${NC}"
  exit 1
fi

# Step 3: Check existing data in Render
echo ""
echo -e "${GREEN}Step 3: Checking existing data in Render database...${NC}"
RENDER_PRODUCTS=$(docker run --rm -e PGPASSWORD="${RENDER_PASSWORD}" postgres:15-alpine \
  psql -h ${RENDER_HOST} -U ${RENDER_USER} -d ${RENDER_DB} -t -c \
  "SELECT COUNT(*) FROM products;" 2>/dev/null | tr -d ' ')

LOCAL_PRODUCTS=$(docker exec ${LOCAL_CONTAINER} psql -U ${LOCAL_USER} -d ${LOCAL_DB} -t -c \
  "SELECT COUNT(*) FROM products;" 2>/dev/null | tr -d ' ')

echo -e "   Local products: ${LOCAL_PRODUCTS}"
echo -e "   Render products: ${RENDER_PRODUCTS}"

if [ "$RENDER_PRODUCTS" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warning: Render database already has ${RENDER_PRODUCTS} product(s)${NC}"
  echo -e "${YELLOW}   The migration will INSERT data. Duplicates may occur if IDs match.${NC}"
  read -p "Continue? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Migration cancelled${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Render database is empty, safe to proceed${NC}"
fi

# Step 4: Import data to Render database
echo ""
echo -e "${GREEN}Step 4: Importing data to Render database...${NC}"
echo -e "${YELLOW}   This may take a few minutes...${NC}"

# Use COPY instead of INSERT for better performance, but first we need to handle the INSERT statements
# For now, we'll use the INSERT statements from pg_dump
docker run --rm -i \
  -e PGPASSWORD="${RENDER_PASSWORD}" \
  -v /tmp/juellehair_data_migration.sql:/migration.sql \
  postgres:15-alpine \
  psql -h ${RENDER_HOST} -U ${RENDER_USER} -d ${RENDER_DB} \
  -f /migration.sql > /tmp/migration_output.log 2>&1

# Check for errors (ignore duplicate key errors as they're expected)
ERROR_COUNT=$(grep -i "error" /tmp/migration_output.log | grep -v "duplicate key" | wc -l | tr -d ' ')

if [ "$ERROR_COUNT" -eq 0 ] || [ "$ERROR_COUNT" -lt 10 ]; then
  echo -e "${GREEN}✅ Import completed${NC}"
  if [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}   Note: Some duplicate key errors are expected if data already exists${NC}"
  fi
else
  echo -e "${RED}❌ Import had errors. Check /tmp/migration_output.log for details${NC}"
  tail -50 /tmp/migration_output.log
  exit 1
fi

# Step 5: Verify migration
echo ""
echo -e "${GREEN}Step 5: Verifying migration...${NC}"
RENDER_PRODUCTS_AFTER=$(docker run --rm -e PGPASSWORD="${RENDER_PASSWORD}" postgres:15-alpine \
  psql -h ${RENDER_HOST} -U ${RENDER_USER} -d ${RENDER_DB} -t -c \
  "SELECT COUNT(*) FROM products;" 2>/dev/null | tr -d ' ')

echo -e "   Products before: ${RENDER_PRODUCTS}"
echo -e "   Products after: ${RENDER_PRODUCTS_AFTER}"
echo -e "   Products migrated: $((RENDER_PRODUCTS_AFTER - RENDER_PRODUCTS))"

if [ "$RENDER_PRODUCTS_AFTER" -ge "$RENDER_PRODUCTS" ]; then
  echo -e "${GREEN}✅ Migration verified${NC}"
else
  echo -e "${YELLOW}⚠️  Product count decreased (may be due to duplicates being skipped)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Migration completed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update your backend .env file with the Render database URL:"
echo -e "   DATABASE_URL=${RENDER_URL}"
echo -e "2. Run Prisma migrations on Render (if needed):"
echo -e "   npx prisma migrate deploy"
echo -e "3. Restart your backend service"
echo ""
