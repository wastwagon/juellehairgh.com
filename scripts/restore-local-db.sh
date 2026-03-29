#!/bin/bash
# Restore local PostgreSQL and run migrations/seeds after database loss
set -e

echo "🔄 Restoring Juelle Hair local development environment..."
echo ""

# Start PostgreSQL
echo "1️⃣ Starting PostgreSQL..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo "2️⃣ Waiting for PostgreSQL to be ready..."
sleep 5
until docker compose exec -T postgres pg_isready -U postgres 2>/dev/null; do
  echo "   Waiting for postgres..."
  sleep 2
done
echo "   PostgreSQL is ready."
echo ""

# Run migrations (via backend)
echo "3️⃣ Running Prisma migrations..."
cd backend
npm run prisma:generate
npm run prisma:deploy
echo "   Migrations complete."
echo ""

# Seed essential data
echo "4️⃣ Seeding essential data..."
npm run setup:features 2>/dev/null || true
npm run populate:banners 2>/dev/null || true
echo "   Seeding complete."
echo ""

echo "✅ Local database restored."
echo ""
echo "Next steps:"
echo "  - Start full stack: docker compose up -d"
echo "  - Or run backend locally: cd backend && npm run start:dev"
echo "  - Frontend: cd frontend && npm run dev"
echo ""
echo "Hero banner images should be in frontend/public/:"
echo "  - Mobile-hero-banner.jpeg"
echo "  - NewPoroHeroBanner.jpeg"
echo ""
