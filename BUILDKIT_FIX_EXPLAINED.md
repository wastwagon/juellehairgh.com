# 🔧 BuildKit Multi-Stage Build Fix Explained

## Problem

Deployment was failing with this error:
```
target frontend: failed to solve: pull access denied, repository does not exist or may require authorization
Error: Dockerfile.prod:223
>>> COPY --from=builder /app/public ./public
```

Docker BuildKit was trying to pull `builder:latest` as an external Docker image instead of recognizing it as a build stage.

## Root Cause

When Coolify modifies Dockerfiles for build secrets, it injects ARG declarations at the top of each stage. This can cause Docker BuildKit to misinterpret stage references when using `COPY --from=builder`.

BuildKit was trying to resolve `builder` as an external image reference before it understood it was a build stage defined earlier in the Dockerfile.

## Solution

Changed from using the **stage name** to using the **stage index**:

**Before:**
```dockerfile
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
```

**After:**
```dockerfile
COPY --from=0 /app/public ./public
COPY --from=0 /app/.next/standalone ./
COPY --from=0 /app/.next/static ./.next/static
```

## Why This Works

In multi-stage Docker builds, stages are numbered starting from 0:
- **Stage 0**: `FROM node:18-alpine AS builder` (the builder stage)
- **Stage 1**: `FROM node:18-alpine AS runner` (the runner stage)

Using `--from=0` explicitly references the first stage by index, which BuildKit resolves correctly even when Coolify modifies the Dockerfile.

## Benefits

1. ✅ **More Reliable**: Stage indices are always resolved correctly by BuildKit
2. ✅ **Coolify Compatible**: Works even when Coolify injects ARG declarations
3. ✅ **Clear Intent**: Makes it explicit which stage we're copying from
4. ✅ **No External Dependencies**: Prevents BuildKit from trying to pull external images

## Testing

After this fix:
1. Push the changes to your repository
2. Redeploy in Coolify
3. The build should now succeed without trying to pull `builder:latest`

---

**Note:** This is a common issue when using multi-stage builds with platforms that modify Dockerfiles (like Coolify). Using stage indices is a more robust approach than stage names in these scenarios.
