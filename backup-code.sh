#!/bin/bash

# Code Backup Script
# Creates timestamped backups of your codebase
# Usage: ./backup-code.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/Users/OceanCyber/Downloads/juellehairgh.com"
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/code-backup-${TIMESTAMP}.tar.gz"

echo -e "${BLUE}📦 Creating code backup...${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create backup
cd "${PROJECT_DIR}"

tar -czf "${BACKUP_FILE}" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='backups' \
    --exclude='.git' \
    --exclude='*.log' \
    backend/ frontend/ docker-compose.yml \
    *.sh *.md 2>/dev/null || true

# Get backup size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

echo -e "${GREEN}✅ Backup created successfully!${NC}"
echo ""
echo "  📁 Location: ${BACKUP_FILE}"
echo "  📊 Size: ${BACKUP_SIZE}"
echo ""

# List recent backups
echo -e "${BLUE}Recent backups:${NC}"
ls -lh "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | tail -5 | awk '{print "  " $9 " (" $5 ")"}' || echo "  No previous backups found"
echo ""

# Cleanup old backups (keep last 10)
echo -e "${BLUE}🧹 Cleaning up old backups (keeping last 10)...${NC}"
cd "${BACKUP_DIR}"
ls -t *.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""
