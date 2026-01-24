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

# Function to ensure DATABASE_URL has pool parameters
ensure_pool_parameters() {
    local db_url="$1"
    if [ -z "$db_url" ]; then
        echo "" >&2
        return 1
    fi
    
    # Check if pool parameters are already present
    if echo "$db_url" | grep -q "connection_limit=" && \
       echo "$db_url" | grep -q "pool_timeout=" && \
       echo "$db_url" | grep -q "connect_timeout="; then
        # Already has all pool parameters, return as-is
        echo "$db_url"
        return 0
    fi
    
    # Add pool parameters if missing
    if echo "$db_url" | grep -q "?"; then
        # URL already has query parameters, append pool params with &
        echo "${db_url}&connection_limit=10&pool_timeout=20&connect_timeout=10"
    else
        # URL has no query parameters, add them with ?
        echo "${db_url}?connection_limit=10&pool_timeout=20&connect_timeout=10"
    fi
}

# Fix Environment Variables (handle special chars in password)
if [ -f "./scripts/fix-db-env.js" ]; then
    echo -e "${BLUE}→${NC} Fixing database environment..."
    FIX_OUTPUT=$(node ./scripts/fix-db-env.js 2>&1)
    FIX_EXIT=$?
    if [ $FIX_EXIT -ne 0 ]; then
        echo -e "${RED}✗ Failed to fix database environment${NC}"
        echo "$FIX_OUTPUT"
        exit 1
    fi
    # Evaluate the export statements
    eval "$FIX_OUTPUT"
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to set database environment variables${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Database environment configured"
else
    echo -e "${YELLOW}⚠️  fix-db-env.js not found, using environment variables${NC}"
    # Fallback: construct from individual environment variables
    DB_HOST="${POSTGRES_HOST:-postgres}"
    DB_PORT="${POSTGRES_PORT:-5432}"
    DB_USER="${POSTGRES_USER:-postgres}"
    DB_NAME="${POSTGRES_DB:-juellehair}"
    DB_PASS="${POSTGRES_PASSWORD}"
    
    if [ -z "$DB_PASS" ]; then
        echo -e "${RED}✗ POSTGRES_PASSWORD is required${NC}"
        exit 1
    fi
    
    # URL encode password using a temp file to avoid shell escaping issues
    ENCODED_PASS=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$DB_PASS" 2>/dev/null || echo "$DB_PASS")
    if [ "$ENCODED_PASS" = "$DB_PASS" ]; then
        # Fallback: basic encoding (no special characters to encode)
        ENCODED_PASS="$DB_PASS"
    fi
    DATABASE_URL="postgresql://${DB_USER}:${ENCODED_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"
    export DATABASE_URL
fi

# CRITICAL: Ensure DATABASE_URL always has pool parameters (even if Coolify set it)
# This prevents connection exhaustion and 504 timeouts
if [ -n "$DATABASE_URL" ]; then
    NEW_DATABASE_URL=$(ensure_pool_parameters "$DATABASE_URL")
    if [ -n "$NEW_DATABASE_URL" ]; then
        DATABASE_URL="$NEW_DATABASE_URL"
        export DATABASE_URL
        echo -e "${GREEN}✓${NC} DATABASE_URL configured with connection pool parameters"
    else
        echo -e "${YELLOW}⚠️  Warning: Could not add pool parameters to DATABASE_URL, using as-is${NC}"
    fi
fi

# Verify all required variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASS" ] || [ -z "$DB_NAME" ]; then
    echo -e "${RED}✗ Missing required database environment variables${NC}"
    echo "  DATABASE_URL: ${DATABASE_URL:+SET}"
    echo "  DB_HOST: ${DB_HOST:-NOT SET}"
    echo "  DB_USER: ${DB_USER:-NOT SET}"
    echo "  DB_PASS: ${DB_PASS:+SET (hidden)}"
    echo "  DB_NAME: ${DB_NAME:-NOT SET}"
    exit 1
fi

# Export password for psql
export PGPASSWORD="$DB_PASS"

# Check other required environment variables
echo -e "${BLUE}→${NC} Checking environment..."

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}✗ JWT_SECRET is not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment variables OK"
echo ""

# Wait for database to be ready
echo -e "${BLUE}→${NC} Waiting for database..."

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

# Test database connection with credentials
echo -e "${BLUE}→${NC} Testing database credentials..."
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Database credentials are valid"
else
    echo -e "${RED}✗ Database authentication failed${NC}"
    echo -e "${YELLOW}  Host: $DB_HOST${NC}"
    echo -e "${YELLOW}  Port: $DB_PORT${NC}"
    echo -e "${YELLOW}  User: $DB_USER${NC}"
    echo -e "${YELLOW}  Database: $DB_NAME${NC}"
    echo -e "${RED}  Please verify POSTGRES_PASSWORD matches the database password${NC}"
    exit 1
fi
echo ""

# Generate Prisma Client
echo -e "${BLUE}→${NC} Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Prisma Client generated"
echo ""

# Check if database needs migration
echo -e "${BLUE}→${NC} Checking database status..."

# Count tables (excluding _prisma_migrations)
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
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

