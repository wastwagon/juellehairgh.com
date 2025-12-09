#!/bin/bash

# Script to build and push Docker images to Docker Hub
# Usage: ./build-and-push.sh [your-dockerhub-username]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get Docker Hub username
DOCKER_USERNAME=${1:-${DOCKER_USERNAME}}
if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}Error: Docker Hub username is required${NC}"
    echo "Usage: ./build-and-push.sh [your-dockerhub-username]"
    echo "Or set DOCKER_USERNAME environment variable"
    exit 1
fi

# Image names
BACKEND_IMAGE="${DOCKER_USERNAME}/juelle-hair-backend"
FRONTEND_IMAGE="${DOCKER_USERNAME}/juelle-hair-frontend"

# Version tag (use timestamp)
VERSION=${VERSION:-$(date +%Y%m%d-%H%M%S)}
LATEST_TAG="latest"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Building and Pushing Docker Images${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Docker Hub Username: ${DOCKER_USERNAME}"
echo "Backend Image: ${BACKEND_IMAGE}:${VERSION}"
echo "Frontend Image: ${FRONTEND_IMAGE}:${VERSION}"
echo ""

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Warning: Not logged in to Docker Hub${NC}"
    echo "Please run: docker login"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build Backend (for Linux platform - Render uses Linux)
echo -e "${GREEN}Building Backend Image for Linux...${NC}"
cd backend
docker build --platform linux/amd64 -f Dockerfile.prod -t ${BACKEND_IMAGE}:${VERSION} -t ${BACKEND_IMAGE}:${LATEST_TAG} .
echo -e "${GREEN}✓ Backend image built${NC}"
cd ..

# Build Frontend (for Linux platform - Render uses Linux)
echo -e "${GREEN}Building Frontend Image for Linux...${NC}"
cd frontend
docker build --platform linux/amd64 -f Dockerfile.prod -t ${FRONTEND_IMAGE}:${VERSION} -t ${FRONTEND_IMAGE}:${LATEST_TAG} .
echo -e "${GREEN}✓ Frontend image built${NC}"
cd ..

# Push Backend
echo -e "${GREEN}Pushing Backend Image to Docker Hub...${NC}"
docker push ${BACKEND_IMAGE}:${VERSION}
docker push ${BACKEND_IMAGE}:${LATEST_TAG}
echo -e "${GREEN}✓ Backend image pushed${NC}"

# Push Frontend
echo -e "${GREEN}Pushing Frontend Image to Docker Hub...${NC}"
docker push ${FRONTEND_IMAGE}:${VERSION}
docker push ${FRONTEND_IMAGE}:${LATEST_TAG}
echo -e "${GREEN}✓ Frontend image pushed${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All images pushed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Backend Image: ${BACKEND_IMAGE}:${VERSION}"
echo "Frontend Image: ${FRONTEND_IMAGE}:${VERSION}"
echo ""
echo "You can now use these images on Render:"
echo "  - Backend: ${BACKEND_IMAGE}:${LATEST_TAG}"
echo "  - Frontend: ${FRONTEND_IMAGE}:${LATEST_TAG}"

