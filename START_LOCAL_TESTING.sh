#!/bin/bash

echo "🚀 Starting Local Testing Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

echo "📦 Step 1: Starting Docker Compose services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "📋 Step 2: Seeding shipping zones..."
docker-compose exec -T backend npx ts-node prisma/seed-shipping-simple.ts || echo "⚠️  Seed script may need to be run manually"

echo ""
echo "✅ Services should be starting..."
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:9002"
echo "   Backend API: http://localhost:9001/api"
echo "   Admin Panel: http://localhost:9002/admin/settings"
echo ""
echo "📊 Check service status:"
echo "   docker-compose ps"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f frontend"
echo "   docker-compose logs -f backend"
echo ""

