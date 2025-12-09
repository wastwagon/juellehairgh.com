#!/bin/bash

# Build and push script with version tagging
# Usage: ./build-and-push.sh [optional-version-tag]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Generate version tag if not provided
if [ -z "$1" ]; then
  # Format: vYYYYMMDD-HHMMSS
  VERSION_TAG="v$(date +%Y%m%d-%H%M%S)"
else
  VERSION_TAG="$1"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Building Docker Image${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Version Tag: ${VERSION_TAG}${NC}"
echo -e "${GREEN}Image: flygonpriest/juelle-hair-backend:${VERSION_TAG}${NC}"
echo -e "${GREEN}Also tagging as: latest${NC}"
echo ""

# Create a version file for the build
VERSION_FILE=".build-version"
echo "$VERSION_TAG" > "$VERSION_FILE"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$VERSION_FILE"
echo "Build completed at: $(date)" >> "$VERSION_FILE"

# Build and push the image
echo -e "${YELLOW}Building with docker buildx...${NC}"
docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  --build-arg BUILD_VERSION="$VERSION_TAG" \
  --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -t "flygonpriest/juelle-hair-backend:${VERSION_TAG}" \
  -t "flygonpriest/juelle-hair-backend:latest" \
  --push \
  .

# Clean up version file
rm -f "$VERSION_FILE"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Version Tag: ${VERSION_TAG}${NC}"
echo -e "${GREEN}Image: flygonpriest/juelle-hair-backend:${VERSION_TAG}${NC}"
echo ""
echo -e "${YELLOW}To use this specific version in Render:${NC}"
echo -e "${BLUE}Update Docker Image to: flygonpriest/juelle-hair-backend:${VERSION_TAG}${NC}"
echo ""
echo -e "${YELLOW}To verify deployment, check:${NC}"
echo -e "${BLUE}curl https://your-backend-url.onrender.com/version${NC}"
