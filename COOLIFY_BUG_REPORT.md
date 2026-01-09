# 🐛 Coolify Bug Report: Dockerfile Mix-Up in Docker Compose Builds

## Issue Summary

Coolify is incorrectly using the backend Dockerfile for the frontend build, even when Dockerfiles have completely distinct names and are correctly configured in docker-compose.yml.

## Coolify Version

v4.0.0-beta.460

## Problem Description

When deploying a docker-compose application with multiple services that have different Dockerfiles, Coolify reads the correct Dockerfile but then uses the wrong one during the build process.

## Evidence

### Configuration
- **Backend Dockerfile:** `backend/Dockerfile.backend.prod` (uses `node:20-slim`, contains `COPY prisma`)
- **Frontend Dockerfile:** `frontend/Dockerfile.frontend.prod` (uses `node:18-alpine`, NO `COPY prisma`)
- **docker-compose.prod.yml:** Correctly configured with distinct dockerfile paths

### What Happens

1. **Coolify reads correct files:**
   ```
   #2 [frontend internal] load build definition from Dockerfile.frontend.prod
   #3 [backend internal] load build definition from Dockerfile.backend.prod
   ```

2. **But then uses wrong content:**
   ```
   #6 [frontend internal] load metadata for docker.io/library/node:20-slim
   #16 [frontend stage-0 5/11] COPY prisma ./prisma/
   #17 [frontend stage-0 2/11] RUN ... apt-get update (Debian command, not Alpine)
   ```

3. **Error:**
   ```
   Error: Dockerfile.frontend.prod:42
   >>> COPY prisma ./prisma/
   target frontend: failed to solve: "/prisma": not found
   ```

## Expected Behavior

Frontend build should:
- Use `node:18-alpine` (not `node:20-slim`)
- Use `apk` commands (not `apt-get`)
- NOT try to `COPY prisma` (doesn't exist in frontend)

## Actual Behavior

Frontend build:
- Uses `node:20-slim` (backend's image)
- Uses `apt-get` commands (backend's package manager)
- Tries to `COPY prisma` (backend's command)

## Steps to Reproduce

1. Create a docker-compose.yml with two services:
   - Backend service with `dockerfile: Dockerfile.backend.prod`
   - Frontend service with `dockerfile: Dockerfile.frontend.prod`
2. Ensure Dockerfiles have different base images and commands
3. Deploy via Coolify
4. Observe that frontend build uses backend Dockerfile content

## Workarounds Attempted

1. ✅ Renamed Dockerfiles to be distinct (`Dockerfile.backend.prod` vs `Dockerfile.frontend.prod`)
2. ✅ Added clear header comments to distinguish files
3. ✅ Verified docker-compose.yml configuration is correct
4. ❌ Issue persists - Coolify still mixes up Dockerfiles

## Impact

**Critical** - Prevents deployment of multi-service docker-compose applications where services have different Dockerfiles.

## Suggested Fix

Coolify's Dockerfile modification process (for build secrets) appears to be mixing up files. The issue likely occurs when Coolify:
1. Reads Dockerfiles correctly
2. Modifies them to inject ARG declarations
3. Somehow applies the wrong modified content to the wrong service

## Additional Information

- Docker version: 29.1.3
- BuildKit: Enabled
- Buildx: Enabled
- Build secrets: Enabled

## Files for Reference

- `docker-compose.prod.yml` - Correctly configured compose file
- `backend/Dockerfile.backend.prod` - Backend Dockerfile (node:20-slim, COPY prisma)
- `frontend/Dockerfile.frontend.prod` - Frontend Dockerfile (node:18-alpine, NO COPY prisma)

---

**Status:** Unresolved - Requires Coolify fix
