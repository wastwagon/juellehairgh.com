#!/bin/bash

# Enhanced Build and Push Script with Versioning
# This script builds and pushes Docker images with timestamped versions
# Usage: ./build-and-push-production.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOCKER_USERNAME="flygonpriest"
BACKEND_IMAGE="${DOCKER_USERNAME}/juelle-hair-backend"
FRONTEND_IMAGE="${DOCKER_USERNAME}/juelle-hair-frontend"
PLATFORM="linux/amd64"
PROJECT_DIR="/Users/OceanCyber/Downloads/juellehairgh.com"
VERSION_LOG="${PROJECT_DIR}/version-log.txt"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VERSION_TAG="${TIMESTAMP}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🐳 Docker Build and Push${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Docker Hub Username: ${DOCKER_USERNAME}"
echo "Version Tag: ${VERSION_TAG}"
echo "Platform: ${PLATFORM}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️  Not logged in to Docker Hub. Please run: docker login${NC}"
    echo "   Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Docker is running and logged in${NC}"
echo ""

cd "${PROJECT_DIR}"

# Build and push backend
echo -e "${BLUE}📦 Building backend image...${NC}"
cd backend
docker buildx build \
    --platform ${PLATFORM} \
    -f Dockerfile.prod \
    -t ${BACKEND_IMAGE}:latest \
    -t ${BACKEND_IMAGE}:${VERSION_TAG} \
    --push \
    . > /dev/null 2>&1

echo -e "${GREEN}✅ Backend image built and pushed${NC}"
echo "   - ${BACKEND_IMAGE}:latest"
echo "   - ${BACKEND_IMAGE}:${VERSION_TAG}"
echo ""

# Build and push frontend
echo -e "${BLUE}📦 Building frontend image...${NC}"
cd ../frontend
docker buildx build \
    --platform ${PLATFORM} \
    -f Dockerfile.prod \
    -t ${FRONTEND_IMAGE}:latest \
    -t ${FRONTEND_IMAGE}:${VERSION_TAG} \
    --push \
    . > /dev/null 2>&1

echo -e "${GREEN}✅ Frontend image built and pushed${NC}"
echo "   - ${FRONTEND_IMAGE}:latest"
echo "   - ${FRONTEND_IMAGE}:${VERSION_TAG}"
echo ""

cd "${PROJECT_DIR}"

# Log version
echo "${TIMESTAMP}|${VERSION_TAG}|${BACKEND_IMAGE}:${VERSION_TAG}|${FRONTEND_IMAGE}:${VERSION_TAG}" >> "${VERSION_LOG}"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 Successfully pushed all images to Docker Hub!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Summary:"
echo "  📦 Version: ${VERSION_TAG}"
echo "  🐳 Backend: ${BACKEND_IMAGE}:${VERSION_TAG}"
echo "  🐳 Frontend: ${FRONTEND_IMAGE}:${VERSION_TAG}"
echo ""
echo "Next steps:"
echo "  1. Run migrations: ./migrate-render-db.sh"
echo "  2. Deploy to Render (use latest tag or ${VERSION_TAG})"
echo ""
