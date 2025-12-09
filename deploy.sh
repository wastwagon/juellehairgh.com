#!/bin/bash

# Main Deployment Script for Juelle Hair
# This script handles: backup → build → push → migrate → deploy
# Usage: ./deploy.sh [--skip-backup] [--skip-migrate] [--skip-deploy]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="flygonpriest"
BACKEND_IMAGE="${DOCKER_USERNAME}/juelle-hair-backend"
FRONTEND_IMAGE="${DOCKER_USERNAME}/juelle-hair-frontend"
PLATFORM="linux/amd64"
PROJECT_DIR="/Users/OceanCyber/Downloads/juellehairgh.com"
BACKUP_DIR="${PROJECT_DIR}/backups"
VERSION_LOG="${PROJECT_DIR}/version-log.txt"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VERSION_TAG="${TIMESTAMP}"

# Flags
SKIP_BACKUP=false
SKIP_MIGRATE=false
SKIP_DEPLOY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-migrate)
            SKIP_MIGRATE=true
            shift
            ;;
        --skip-deploy)
            SKIP_DEPLOY=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: ./deploy.sh [--skip-backup] [--skip-migrate] [--skip-deploy]"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Juelle Hair Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check if logged in to Docker Hub (try multiple methods)
DOCKER_LOGGED_IN=false
if docker info 2>/dev/null | grep -q "Username"; then
    DOCKER_LOGGED_IN=true
elif [ -f ~/.docker/config.json ] && grep -q "auth" ~/.docker/config.json 2>/dev/null; then
    DOCKER_LOGGED_IN=true
fi

if [ "$DOCKER_LOGGED_IN" = false ]; then
    echo -e "${YELLOW}⚠️  Docker Hub login status unclear.${NC}"
    echo "   Attempting to proceed with build..."
    echo "   If push fails, please run: docker login"
    echo ""
fi

echo -e "${GREEN}✅ Docker is running and logged in${NC}"
echo ""

# Step 1: Backup Code
if [ "$SKIP_BACKUP" = false ]; then
    echo -e "${BLUE}📦 Step 1: Backing up code...${NC}"
    mkdir -p "${BACKUP_DIR}"
    
    BACKUP_FILE="${BACKUP_DIR}/code-backup-${TIMESTAMP}.tar.gz"
    cd "${PROJECT_DIR}"
    
    tar -czf "${BACKUP_FILE}" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='backups' \
        --exclude='.git' \
        backend/ frontend/ docker-compose.yml \
        *.sh *.md 2>/dev/null || true
    
    echo -e "${GREEN}✅ Code backed up to: ${BACKUP_FILE}${NC}"
    echo ""
else
    echo -e "${YELLOW}⏭️  Skipping backup (--skip-backup)${NC}"
    echo ""
fi

# Step 2: Build and Push Docker Images
echo -e "${BLUE}🐳 Step 2: Building and pushing Docker images...${NC}"
echo "   Version Tag: ${VERSION_TAG}"
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

# Step 3: Log Version
echo "${TIMESTAMP}|${VERSION_TAG}|${BACKEND_IMAGE}:${VERSION_TAG}|${FRONTEND_IMAGE}:${VERSION_TAG}" >> "${VERSION_LOG}"
echo -e "${GREEN}✅ Version logged to version-log.txt${NC}"
echo ""

# Step 4: Run Database Migrations on Render
if [ "$SKIP_MIGRATE" = false ]; then
    echo -e "${BLUE}🗄️  Step 3: Running database migrations on Render...${NC}"
    
    if [ -f "${PROJECT_DIR}/migrate-render-db.sh" ]; then
        bash "${PROJECT_DIR}/migrate-render-db.sh"
    else
        echo -e "${YELLOW}⚠️  Migration script not found. Skipping migrations.${NC}"
        echo "   Run migrate-render-db.sh manually if needed."
    fi
    echo ""
else
    echo -e "${YELLOW}⏭️  Skipping migrations (--skip-migrate)${NC}"
    echo ""
fi

# Step 5: Deployment Instructions
if [ "$SKIP_DEPLOY" = false ]; then
    echo -e "${BLUE}🚀 Step 4: Render Deployment${NC}"
    echo ""
    echo -e "${YELLOW}To deploy to Render:${NC}"
    echo ""
    echo "1. Go to Render Dashboard: https://dashboard.render.com"
    echo ""
    echo "2. Backend Service:"
    echo "   - Go to your backend service"
    echo "   - Click 'Manual Deploy' → 'Deploy latest image'"
    echo "   - Or update image to: ${BACKEND_IMAGE}:${VERSION_TAG}"
    echo ""
    echo "3. Frontend Service:"
    echo "   - Go to your frontend service"
    echo "   - Click 'Manual Deploy' → 'Deploy latest image'"
    echo "   - Or update image to: ${FRONTEND_IMAGE}:${VERSION_TAG}"
    echo ""
    echo -e "${GREEN}✅ Images are ready on Docker Hub!${NC}"
    echo ""
else
    echo -e "${YELLOW}⏭️  Skipping deployment instructions (--skip-deploy)${NC}"
    echo ""
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Summary:"
echo "  📦 Version: ${VERSION_TAG}"
echo "  🐳 Backend: ${BACKEND_IMAGE}:${VERSION_TAG}"
echo "  🐳 Frontend: ${FRONTEND_IMAGE}:${VERSION_TAG}"
if [ "$SKIP_BACKUP" = false ]; then
    echo "  💾 Backup: ${BACKUP_FILE}"
fi
echo ""
echo "Next steps:"
echo "  1. Deploy to Render (see instructions above)"
echo "  2. Verify deployment at your Render URLs"
echo "  3. Check version-log.txt for version history"
echo ""
