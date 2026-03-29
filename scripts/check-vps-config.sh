#!/bin/bash
# =============================================================================
# VPS Configuration Check for juellehairgh.com
# Run on your Coolify server to verify setup and avoid timeouts/instability
# Usage: bash check-vps-config.sh   OR   ./check-vps-config.sh
# =============================================================================

set -e

DOMAIN="juellehairgh.com"
WWW_DOMAIN="www.juellehairgh.com"
DYNAMIC_CONFIG_PATH="/data/coolify/proxy/dynamic/juellehairgh.yaml"
PROXY_CONTAINER="coolify-proxy"
FRONTEND_CONTAINER="juelle-hair-frontend-prod"
BACKEND_CONTAINER="juelle-hair-backend-prod"

PASS="✓"
FAIL="✗"
WARN="⚠"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass()  { echo -e "${GREEN}${PASS}${NC} $1"; }
fail()  { echo -e "${RED}${FAIL}${NC} $1"; }
warn()  { echo -e "${YELLOW}${WARN}${NC} $1"; }
info()  { echo -e "${BLUE}ℹ${NC}  $1"; }
section() { echo ""; echo -e "${BLUE}═══ $1 ═══${NC}"; }

# -----------------------------------------------------------------------------
# 1. Docker & Coolify Proxy
# -----------------------------------------------------------------------------
section "Docker & Coolify Proxy"
if command -v docker &>/dev/null; then
  pass "Docker is installed"
else
  fail "Docker is not installed or not in PATH"
  exit 1
fi

if docker ps &>/dev/null; then
  pass "Docker daemon is running"
else
  fail "Docker daemon is not running or user lacks permission"
  exit 1
fi

if docker ps --format '{{.Names}}' | grep -q "^${PROXY_CONTAINER}$"; then
  PROXY_STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$PROXY_CONTAINER" 2>/dev/null || docker inspect -f '{{.State.Status}}' "$PROXY_CONTAINER" 2>/dev/null)
  if [[ "$PROXY_STATUS" == "healthy" || "$PROXY_STATUS" == "running" ]]; then
    pass "coolify-proxy container is running ($PROXY_STATUS)"
  else
    warn "coolify-proxy is $PROXY_STATUS"
  fi
else
  fail "coolify-proxy container not found (run 'docker ps' to list containers)"
fi

# -----------------------------------------------------------------------------
# 2. Dynamic Traefik Config (critical for routing)
# -----------------------------------------------------------------------------
section "Traefik Dynamic Config"
if [[ -f "$DYNAMIC_CONFIG_PATH" ]]; then
  pass "Dynamic config exists: $DYNAMIC_CONFIG_PATH"
  if grep -q "Host(\`${DOMAIN}\`)" "$DYNAMIC_CONFIG_PATH" 2>/dev/null; then
    pass "Config contains correct Host rule for $DOMAIN"
  else
    warn "Config may not have correct Host rule; verify manually"
  fi
  if grep -q "http://frontend:3000" "$DYNAMIC_CONFIG_PATH" 2>/dev/null; then
    pass "Config points to frontend:3000 (correct for Coolify)"
  else
    warn "Config may use wrong backend URL; check servers section"
  fi
else
  fail "Dynamic config NOT found: $DYNAMIC_CONFIG_PATH"
  info "Add juellehairgh.yaml via Coolify UI: Proxy → Dynamic Configurations"
fi

# -----------------------------------------------------------------------------
# 3. Application Containers
# -----------------------------------------------------------------------------
section "Application Containers"
FRONTEND_FOUND=0
for name in $(docker ps --format '{{.Names}}'); do
  if [[ "$name" == *"frontend"* ]]; then
    if [[ "$name" == "$FRONTEND_CONTAINER" || "$name" == *"frontend"* ]]; then
      FRONTEND_FOUND=1
      STATUS=$(docker inspect -f '{{.State.Status}}' "$name" 2>/dev/null)
      HEALTH=$(docker inspect -f '{{.State.Health.Status}}' "$name" 2>/dev/null)
      if [[ "$STATUS" == "running" ]]; then
        if [[ "$HEALTH" == "healthy" ]]; then
          pass "Frontend ($name) is running and healthy"
        else
          pass "Frontend ($name) is running (health: ${HEALTH:-unknown})"
        fi
      else
        warn "Frontend ($name) status: $STATUS"
      fi
    fi
  fi
done
if [[ $FRONTEND_FOUND -eq 0 ]]; then
  warn "No frontend container found (expected: $FRONTEND_CONTAINER or similar)"
fi

BACKEND_FOUND=0
for name in $(docker ps --format '{{.Names}}'); do
  if [[ "$name" == *"backend"* ]]; then
    BACKEND_FOUND=1
    STATUS=$(docker inspect -f '{{.State.Status}}' "$name" 2>/dev/null)
    if [[ "$STATUS" == "running" ]]; then
      pass "Backend ($name) is running"
    else
      warn "Backend ($name) status: $STATUS"
    fi
  fi
done
if [[ $BACKEND_FOUND -eq 0 ]]; then
  warn "No backend container found"
fi

# -----------------------------------------------------------------------------
# 4. Networks
# -----------------------------------------------------------------------------
section "Networks"
if docker network inspect coolify &>/dev/null; then
  pass "coolify network exists"
  PROXY_ON_COOLIFY=$(docker network inspect coolify --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null | grep -c "$PROXY_CONTAINER" || true)
  if [[ "$PROXY_ON_COOLIFY" -gt 0 ]]; then
    pass "coolify-proxy is attached to coolify network"
  else
    warn "coolify-proxy may not be on coolify network"
  fi
else
  fail "coolify network not found"
fi

# -----------------------------------------------------------------------------
# 5. HTTP / HTTPS Reachability
# -----------------------------------------------------------------------------
section "HTTP/HTTPS Reachability"
if command -v curl &>/dev/null; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "https://${DOMAIN}" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "301" || "$HTTP_CODE" == "302" ]]; then
    pass "HTTPS $DOMAIN returns $HTTP_CODE"
  elif [[ "$HTTP_CODE" == "000" ]]; then
    warn "HTTPS $DOMAIN unreachable (timeout or connection failed)"
  else
    warn "HTTPS $DOMAIN returns $HTTP_CODE"
  fi

  HTTP_CODE_WWW=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "https://${WWW_DOMAIN}" 2>/dev/null || echo "000")
  if [[ "$HTTP_CODE_WWW" == "200" || "$HTTP_CODE_WWW" == "301" || "$HTTP_CODE_WWW" == "302" ]]; then
    pass "HTTPS $WWW_DOMAIN returns $HTTP_CODE_WWW"
  elif [[ "$HTTP_CODE_WWW" == "000" ]]; then
    warn "HTTPS $WWW_DOMAIN unreachable"
  else
    warn "HTTPS $WWW_DOMAIN returns $HTTP_CODE_WWW"
  fi
else
  info "curl not installed; skipping HTTP checks"
fi

# -----------------------------------------------------------------------------
# 6. Traefik Logs (common errors)
# -----------------------------------------------------------------------------
section "Traefik Proxy Logs"
if docker ps --format '{{.Names}}' | grep -q "^${PROXY_CONTAINER}$"; then
  if docker logs "$PROXY_CONTAINER" 2>&1 | tail -100 | grep -q "empty args for matcher Host"; then
    # Site works (200) = dynamic config takes precedence; these are likely old or harmless
    if command -v curl &>/dev/null && [[ "$(curl -s -o /dev/null -w '%{http_code}' -m 5 "https://${DOMAIN}" 2>/dev/null)" =~ ^(200|301|302)$ ]]; then
      warn "Traefik logs show 'empty Host' (Coolify bug) - site works; disable Coolify proxy for this app to clean logs"
    else
      fail "Traefik logs show 'empty args for matcher Host' (Coolify bug)"
    fi
  else
    pass "No 'empty Host' errors in recent Traefik logs"
  fi
  if docker logs "$PROXY_CONTAINER" 2>&1 | tail -100 | grep -qi "bad gateway\|502\|503"; then
    warn "Recent bad gateway/5xx errors in Traefik logs"
  fi
fi

# -----------------------------------------------------------------------------
# 7. System Resources
# -----------------------------------------------------------------------------
section "System Resources"
if command -v free &>/dev/null; then
  MEM_AVAIL=$(free -m | awk '/^Mem:/ {print $7}')
  if [[ "$MEM_AVAIL" -gt 512 ]]; then
    pass "Available memory: ${MEM_AVAIL}MB"
  else
    warn "Low memory: ${MEM_AVAIL}MB available"
  fi
fi

if command -v df &>/dev/null; then
  DISK_AVAIL=$(df -m / | awk 'NR==2 {print $4}')
  if [[ "$DISK_AVAIL" -gt 2048 ]]; then
    pass "Disk space: ${DISK_AVAIL}MB free on /"
  else
    warn "Low disk space: ${DISK_AVAIL}MB free"
  fi
fi

# -----------------------------------------------------------------------------
# 8. Recommendations
# -----------------------------------------------------------------------------
section "Recommendations"
echo "1. After deploy: dynamic config stays valid; no restart needed."
echo "2. If Bad Gateway: check that frontend container is running and on app network."
echo "3. Restart proxy only when changing juellehairgh.yaml: docker restart coolify-proxy"
echo "4. Monitor: docker logs -f coolify-proxy"
echo ""
