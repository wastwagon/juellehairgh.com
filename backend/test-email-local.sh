#!/bin/bash

# Local Email Test Script
# This script tests email configuration using local database

echo "🧪 Testing Email Configuration (Local)"
echo ""

# Check if DATABASE_URL is set, if not use default local
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://postgres:postgres@localhost:5434/juellehair?schema=public"
  echo "📝 Using default DATABASE_URL: $DATABASE_URL"
  echo ""
fi

# Check if email argument provided
if [ -z "$1" ]; then
  echo "❌ Error: Email address is required!"
  echo ""
  echo "Usage:"
  echo "  ./test-email-local.sh your-email@gmail.com"
  echo ""
  echo "Or set DATABASE_URL:"
  echo "  DATABASE_URL=your-db-url ./test-email-local.sh your-email@gmail.com"
  exit 1
fi

echo "📧 Sending test email to: $1"
echo ""

# Run the test script
npm run test:email "$1"

