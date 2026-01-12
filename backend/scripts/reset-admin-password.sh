#!/bin/bash
# Reset Admin Password Script (Quick One-Liner Version)
#
# Usage:
#   ./scripts/reset-admin-password.sh <email> <new-password>
#
# Example:
#   ./scripts/reset-admin-password.sh admin@juellehairgh.com MyNewPassword123

set -e

EMAIL=$1
NEW_PASSWORD=$2

if [ -z "$EMAIL" ] || [ -z "$NEW_PASSWORD" ]; then
  echo "❌ Usage: ./scripts/reset-admin-password.sh <email> <new-password>"
  echo "   Example: ./scripts/reset-admin-password.sh admin@juellehairgh.com MyNewPassword123"
  exit 1
fi

if [ ${#NEW_PASSWORD} -lt 6 ]; then
  echo "❌ Password must be at least 6 characters long."
  exit 1
fi

echo "🔧 Resetting password for: $EMAIL"
node scripts/reset-admin-password.js "$EMAIL" "$NEW_PASSWORD"
