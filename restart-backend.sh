#!/bin/bash

# Script to restart the backend Docker service
# Make sure Docker Desktop is running before executing this script

echo "🔄 Restarting backend service..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")"

# Restart backend service
echo "📦 Restarting backend container..."
docker-compose restart backend

# Wait a moment for service to start
sleep 3

# Check if backend is running
if docker ps | grep -q "juelle-hair-backend"; then
    echo "✅ Backend service restarted successfully!"
    echo ""
    echo "📊 Backend status:"
    docker ps | grep backend
    echo ""
    echo "📝 View logs with: docker logs juelle-hair-backend --tail 50 -f"
else
    echo "⚠️  Backend container might not be running. Check with: docker ps -a | grep backend"
fi
