#!/bin/sh
# Query users from production database
# Usage: Run in backend container with proper environment variables

if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_DB" ]; then
  echo "❌ Error: Database environment variables not set"
  exit 1
fi

echo "📊 User Statistics:"
echo "==================="
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB << 'EOF'
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'CUSTOMER' THEN 1 END) as customers,
  COUNT(CASE WHEN "emailVerified" = true THEN 1 END) as verified_users,
  COUNT(CASE WHEN w.id IS NOT NULL THEN 1 END) as users_with_wallets,
  COUNT(CASE WHEN "passwordResetToken" IS NOT NULL THEN 1 END) as users_with_reset_tokens
FROM users u
LEFT JOIN wallets w ON u.id = w."userId";
EOF

echo ""
echo "📋 Recent Users (Last 10):"
echo "=========================="
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB << 'EOF'
SELECT 
  u.email,
  u.name,
  u.role,
  u."emailVerified",
  u."createdAt",
  CASE WHEN u."passwordResetToken" IS NOT NULL THEN 'Yes' ELSE 'No' END as has_reset_token,
  CASE WHEN w.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_wallet,
  COALESCE(w.balance, 0) as wallet_balance
FROM users u
LEFT JOIN wallets w ON u.id = w."userId"
ORDER BY u."createdAt" DESC
LIMIT 10;
EOF

echo ""
echo "✅ Query complete!"
