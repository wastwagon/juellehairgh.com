#!/bin/bash

# ================================================================
# Fix Database Password Script for Coolify Deployment
# ================================================================
# This script updates the PostgreSQL password to match the
# POSTGRES_PASSWORD environment variable
# ================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Fix Database Password${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Find PostgreSQL container
echo -e "${BLUE}→${NC} Finding PostgreSQL container..."

# Try to find container by name pattern
POSTGRES_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "postgres" | grep -i "h0wogckw88c8w8g40w0g4w8g" | head -n1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    # Try alternative pattern
    POSTGRES_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "postgres" | head -n1)
fi

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "${RED}✗ PostgreSQL container not found${NC}"
    echo ""
    echo -e "${YELLOW}Available containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    echo ""
    echo -e "${YELLOW}Please provide the container name manually:${NC}"
    read -p "PostgreSQL container name: " POSTGRES_CONTAINER
fi

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "${RED}✗ No container specified${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found container: $POSTGRES_CONTAINER"
echo ""

# Get password from environment or use default
PASSWORD="${POSTGRES_PASSWORD:-JuelleHair2026}"

if [ -z "$1" ]; then
    echo -e "${BLUE}→${NC} Using password from environment or default: $PASSWORD"
else
    PASSWORD="$1"
    echo -e "${BLUE}→${NC} Using provided password"
fi

echo ""

# Test if we can connect to postgres (without password check, using trust)
echo -e "${BLUE}→${NC} Attempting to connect to database..."

# First, try to connect using peer authentication (local socket) if possible
# Or try with empty password first (sometimes postgres allows local connections)
UPDATE_CMD="docker exec $POSTGRES_CONTAINER psql -U postgres -d postgres -c \"ALTER USER postgres WITH PASSWORD '$PASSWORD';\" 2>&1"

echo -e "${YELLOW}Attempting to update password...${NC}"

# Try the update command
if OUTPUT=$(eval "$UPDATE_CMD" 2>&1); then
    if echo "$OUTPUT" | grep -i "error\|failed\|authentication" > /dev/null; then
        echo -e "${RED}✗ Failed to update password${NC}"
        echo "$OUTPUT"
        echo ""
        echo -e "${YELLOW}Alternative method:${NC}"
        echo "Try connecting via bash and updating manually:"
        echo ""
        echo "  docker exec -it $POSTGRES_CONTAINER bash"
        echo "  psql -U postgres -d postgres"
        echo "  ALTER USER postgres WITH PASSWORD '$PASSWORD';"
        echo "  \\q"
        echo "  exit"
        exit 1
    else
        echo -e "${GREEN}✓${NC} Password updated successfully!"
        echo "$OUTPUT"
    fi
else
    ERROR_CODE=$?
    echo -e "${RED}✗ Command failed with exit code $ERROR_CODE${NC}"
    echo ""
    echo -e "${YELLOW}This usually means:${NC}"
    echo "  1. The container doesn't allow password-less connections"
    echo "  2. The database uses a different authentication method"
    echo ""
    echo -e "${YELLOW}Try one of these methods:${NC}"
    echo ""
    echo -e "${BLUE}Method 1: Connect via bash${NC}"
    echo "  docker exec -it $POSTGRES_CONTAINER bash"
    echo "  psql -U postgres -d postgres"
    echo "  ALTER USER postgres WITH PASSWORD '$PASSWORD';"
    echo "  \\q"
    echo "  exit"
    echo ""
    echo -e "${BLUE}Method 2: Use environment variable${NC}"
    echo "  docker exec -e PGPASSWORD=current_password $POSTGRES_CONTAINER psql -U postgres -d postgres -c \"ALTER USER postgres WITH PASSWORD '$PASSWORD';\""
    echo ""
    echo -e "${BLUE}Method 3: Reset database volume (⚠️  DELETES DATA)${NC}"
    echo "  1. Stop containers in Coolify"
    echo "  2. Find volume: docker volume ls | grep postgres"
    echo "  3. Remove volume: docker volume rm <volume-name>"
    echo "  4. Restart in Coolify (database will initialize with new password)"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Password Updated Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Restart the backend service in Coolify"
echo "  2. Check backend logs for successful connection"
echo "  3. You should see: ✓ Database credentials are valid"
echo ""
