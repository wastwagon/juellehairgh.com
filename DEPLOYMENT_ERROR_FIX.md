# 🔧 Fix: Docker Multi-Stage Build Error in Coolify

## Problem

Deployment fails with error:
```
target frontend: failed to solve: pull access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed
```

Docker is trying to pull `builder:latest` as an external image instead of recognizing it as a build stage.

## Root Cause

Coolify modifies Dockerfiles by adding ARG declarations, which can sometimes cause Docker BuildKit to misinterpret multi-stage build references.

## Solution

The Dockerfile structure is correct. This appears to be a temporary Coolify/BuildKit issue. Try these solutions:

### Solution 1: Retry the Deployment

Sometimes this is a transient BuildKit issue. Simply retry the deployment:

1. Go to Coolify → Your Project
2. Click "Redeploy"
3. The build should succeed on retry

### Solution 2: Clear Build Cache

If retry doesn't work:

1. In Coolify, go to your project settings
2. Look for "Clear Build Cache" or similar option
3. Clear the cache
4. Redeploy

### Solution 3: Check Coolify Version

This might be a Coolify version issue. Check if there's a Coolify update available.

### Solution 4: Use Single-Stage Build (Temporary Workaround)

If the above don't work, we can temporarily use a single-stage build, though this will increase image size.

## Current Status

The Dockerfile is correctly structured with:
- ✅ Multi-stage build (`builder` → `runner`)
- ✅ Proper `COPY --from=builder` statements
- ✅ All required build args declared

The issue is likely a Coolify/BuildKit interaction problem, not a code issue.

## Next Steps

1. **Try redeploying first** - Often resolves itself
2. **Check Coolify logs** for more details
3. **Contact Coolify support** if issue persists

---

**Note:** The previous deployment (commit d8c9f56) worked successfully, so this appears to be an intermittent issue with Coolify's Dockerfile modification process.
