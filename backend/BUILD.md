# Docker Build and Versioning Guide

## Quick Start

Build and push a new Docker image with automatic version tagging:

```bash
./build-and-push.sh
```

Or specify a custom version tag:

```bash
./build-and-push.sh v1.2.3
```

Or use npm script:

```bash
npm run build:docker
```

## Version Tag Format

By default, versions are generated as: `vYYYYMMDD-HHMMSS`

Example: `v20251208-231811`

## Verifying Deployment

After deploying to Render, verify the version is correct:

```bash
# Check version endpoint
curl https://your-backend-url.onrender.com/version

# Check health endpoint (also includes version)
curl https://your-backend-url.onrender.com/health
```

## Using Specific Versions in Render

1. Go to your Render service settings
2. Find "Docker Image" or "Image Name" field
3. Update to: `flygonpriest/juelle-hair-backend:v20251208-231811` (use your specific version tag)
4. Save and redeploy

## Version Endpoints

- `GET /version` - Returns build version, build date, and environment info
- `GET /health` - Health check endpoint (includes version)
- `GET /` - Root endpoint (includes version)

## Build Process

1. Generates version tag (timestamp-based or custom)
2. Builds Docker image with `--no-cache` for clean builds
3. Tags image with both version tag and `latest`
4. Pushes to Docker Hub
5. Outputs instructions for using the version in Render

## Environment Variables

The build script sets these build arguments:
- `BUILD_VERSION` - The version tag
- `BUILD_DATE` - ISO timestamp of when the build was created

These are available in the application at runtime via the `/version` endpoint.
