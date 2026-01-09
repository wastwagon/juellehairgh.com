#!/bin/bash

# ================================================================
# Fix Exposed Paystack Credentials in SQL Files
# ================================================================
# This script replaces exposed Paystack credentials with placeholders
# Run this AFTER rotating your Paystack keys in the dashboard
# ================================================================

set -e

echo "🔒 Fixing Exposed Paystack Credentials in SQL Files"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Exposed credentials (to be replaced)
EXPOSED_PUBLIC_KEY="pk_live_ddadd10dc94b2c2910d10f0fe0d786768a099a06"
EXPOSED_SECRET_KEY="sk_live_80c6d6b5e9c2a38a8e6e1427e641e89e160e6c4d"

# Placeholders
PLACEHOLDER_PUBLIC_KEY="pk_live_SET_VIA_ENV_VAR"
PLACEHOLDER_SECRET_KEY="sk_live_SET_VIA_ENV_VAR"

# Files to fix
FILES=(
    "prisma/migrations/production-baseline.sql"
    "backend/prisma/migrations/production-baseline.sql"
    "backend/backend/prisma/migrations/production-baseline.sql"
)

echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "1. Make sure you've rotated your Paystack keys in the dashboard FIRST"
echo "2. This script will replace exposed keys with placeholders"
echo "3. You'll need to set the keys via environment variables after deployment"
echo ""
read -p "Have you rotated your Paystack keys? (yes/no): " CONFIRMED

if [ "$CONFIRMED" != "yes" ]; then
    echo -e "${RED}❌ Please rotate your Paystack keys first!${NC}"
    echo "Visit: https://dashboard.paystack.com/ → Settings → API Keys & Webhooks"
    exit 1
fi

echo ""
echo "Replacing exposed credentials..."

# Replace in each file
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${BLUE}→${NC} Processing: $file"
        
        # Create backup
        cp "$file" "${file}.backup"
        
        # Replace public key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|$EXPOSED_PUBLIC_KEY|$PLACEHOLDER_PUBLIC_KEY|g" "$file"
            sed -i '' "s|$EXPOSED_SECRET_KEY|$PLACEHOLDER_SECRET_KEY|g" "$file"
        else
            # Linux
            sed -i "s|$EXPOSED_PUBLIC_KEY|$PLACEHOLDER_PUBLIC_KEY|g" "$file"
            sed -i "s|$EXPOSED_SECRET_KEY|$PLACEHOLDER_SECRET_KEY|g" "$file"
        fi
        
        echo -e "${GREEN}✓${NC} Updated: $file"
    else
        echo -e "${YELLOW}⚠️${NC} File not found: $file (skipping)"
    fi
done

echo ""
echo -e "${GREEN}✅ Credentials replaced successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff"
echo "2. Commit the fixes: git add -A && git commit -m 'Security: Remove exposed Paystack credentials'"
echo "3. Update environment variables in your deployment platform"
echo "4. Redeploy your application"
echo ""
echo "Backup files created with .backup extension"
