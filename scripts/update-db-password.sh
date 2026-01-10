#!/bin/bash

# ================================================================
# Update Database Password Script
# ================================================================
# This script updates the PostgreSQL password and provides
# instructions for updating environment variables
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
echo -e "${GREEN}  Update Database Password${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if new password is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: $0 <new_password>${NC}"
    echo ""
    echo -e "${BLUE}Example:${NC}"
    echo "  $0 'MySecurePassword123!@#'"
    echo ""
    echo -e "${BLUE}Or generate a secure password:${NC}"
    echo "  $0 \"\$(openssl rand -base64 32 | tr -d '=+/' | cut -c1-25)\""
    echo ""
    exit 1
fi

NEW_PASSWORD="$1"

# Validate password length
if [ ${#NEW_PASSWORD} -lt 12 ]; then
    echo -e "${RED}✗ Password must be at least 12 characters long${NC}"
    exit 1
fi

echo -e "${BLUE}→${NC} Checking Docker containers..."

# Find PostgreSQL container
DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i "postgres\|db" | head -n1)

if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}✗ PostgreSQL container not found${NC}"
    echo "  Please make sure your database container is running:"
    echo "  docker ps"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found database container: $DB_CONTAINER"
echo ""

# Get current database user and database name
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-juellehair}"

echo -e "${BLUE}→${NC} Updating database password..."
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Try to update password
# First, try to connect with existing password or without password
echo -e "${YELLOW}⚠️  Attempting to update password...${NC}"
echo "  This may fail if current password is incorrect."
echo "  In that case, you'll need to manually connect to the container."
echo ""

# Try to update password using docker exec
UPDATE_CMD="docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c \"ALTER USER $DB_USER WITH PASSWORD '$NEW_PASSWORD';\" 2>&1"

if eval "$UPDATE_CMD"; then
    echo -e "${GREEN}✓${NC} Database password updated successfully!"
else
    echo -e "${RED}✗ Failed to update password automatically${NC}"
    echo ""
    echo -e "${YELLOW}Manual update required:${NC}"
    echo "  1. Connect to database container:"
    echo "     docker exec -it $DB_CONTAINER bash"
    echo ""
    echo "  2. Connect to PostgreSQL:"
    echo "     psql -U $DB_USER -d $DB_NAME"
    echo ""
    echo "  3. Run SQL command:"
    echo "     ALTER USER $DB_USER WITH PASSWORD '$NEW_PASSWORD';"
    echo "     \\q"
    echo ""
    echo "  4. Exit container:"
    echo "     exit"
    echo ""
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Password Updated Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update Environment Variables${NC}"
echo ""
echo -e "${BLUE}New Password:${NC}"
echo "  $NEW_PASSWORD"
echo ""
echo -e "${BLUE}If using Coolify:${NC}"
echo "  1. Go to your Coolify project"
echo "  2. Navigate to Environment Variables"
echo "  3. Update POSTGRES_PASSWORD to:"
echo "     $NEW_PASSWORD"
echo "  4. Save and restart the backend service"
echo ""
echo -e "${BLUE}If using Docker Compose:${NC}"
echo "  1. Update POSTGRES_PASSWORD in your .env file or environment"
echo "  2. Restart containers:"
echo "     docker-compose -f docker-compose.backend.yml restart backend"
echo ""
echo -e "${BLUE}Test Connection:${NC}"
echo "  docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c 'SELECT 1;'"
echo ""
