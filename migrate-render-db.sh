#!/bin/bash

# Database Migration Script for Render Postgres
# This script runs Prisma migrations directly on Render's database
# Usage: ./migrate-render-db.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Render Database Configuration
RENDER_DB_URL="postgresql://juellehair_user:lJbEutCA26lLKqZIaBfq4YWOdudkwGfC@dpg-d4nkgtngi27c73bi9j8g-a.oregon-postgres.render.com/juellehair_k4fu"
PROJECT_DIR="/Users/OceanCyber/Downloads/juellehairgh.com"
BACKEND_DIR="${PROJECT_DIR}/backend"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🗄️  Render Database Migration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "${BACKEND_DIR}" ]; then
    echo -e "${RED}❌ Backend directory not found: ${BACKEND_DIR}${NC}"
    exit 1
fi

# Check if Prisma schema exists
if [ ! -f "${BACKEND_DIR}/prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Prisma schema not found: ${BACKEND_DIR}/prisma/schema.prisma${NC}"
    exit 1
fi

cd "${BACKEND_DIR}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Check if Prisma Client is generated
if [ ! -d "node_modules/.prisma/client" ]; then
    echo -e "${YELLOW}⚠️  Prisma Client not generated. Generating...${NC}"
    DATABASE_URL="${RENDER_DB_URL}" npx prisma generate
fi

echo -e "${BLUE}📋 Checking migration status...${NC}"
echo ""

# Check current migration status
echo -e "${BLUE}🔍 Current database state:${NC}"
DATABASE_URL="${RENDER_DB_URL}" npx prisma migrate status || {
    echo -e "${YELLOW}⚠️  Migration status check failed. This might be normal if migrations haven't been run before.${NC}"
    echo ""
}

echo ""
echo -e "${BLUE}🚀 Running migrations...${NC}"
echo ""

# Run migrations
if DATABASE_URL="${RENDER_DB_URL}" npx prisma migrate deploy; then
    echo ""
    echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
    echo ""
    
    # Verify migration
    echo -e "${BLUE}🔍 Verifying migration...${NC}"
    DATABASE_URL="${RENDER_DB_URL}" npx prisma migrate status
    echo ""
    
    echo -e "${GREEN}✅ Database is up to date!${NC}"
else
    echo ""
    echo -e "${RED}❌ Migration failed!${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check database connection string"
    echo "  2. Verify database is accessible"
    echo "  3. Check Prisma schema for errors"
    echo "  4. Review migration files in prisma/migrations/"
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
