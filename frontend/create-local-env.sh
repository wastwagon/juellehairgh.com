#!/bin/bash
# Quick script to create .env.local for local development

cat > .env.local << 'ENVEOF'
# Local Development Environment Variables
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-change-in-production
ENVEOF

echo "✅ Created .env.local file"
echo "📝 Contents:"
cat .env.local
echo ""
echo "🔄 Now restart your frontend dev server!"
