# 🔧 Fix Docker Local Services - Permission Error

## Problem
Frontend container showing `EPERM: operation not permitted, scandir '/app/app'` error, causing Internal Server Error on `localhost:8002`.

## Root Cause
MacOS Docker volume permission issue with Next.js file watcher trying to scan the `/app/app` directory.

## ✅ Fix Applied

I've updated `docker-compose.yml` to:

1. **Add `CHOKIDAR_USEPOLLING` environment variable** - Forces Next.js to use polling instead of native file watching (fixes macOS permission issues)
2. **Fix permissions on startup** - Added `chmod -R 755 /app` before starting dev server
3. **Exclude `.next` from volume mount** - Prevents permission conflicts with build cache

---

## 🚀 How to Fix

### **Option 1: Restart Containers (Recommended)**

```bash
cd /Users/OceanCyber/Downloads/juellehairgh.com
docker-compose down
docker-compose up -d
```

Wait 30-60 seconds for services to start, then check:

```bash
docker-compose logs frontend --tail=50
```

You should see Next.js starting without permission errors.

---

### **Option 2: Rebuild Frontend Container**

If Option 1 doesn't work:

```bash
cd /Users/OceanCyber/Downloads/juellehairgh.com
docker-compose stop frontend
docker-compose rm -f frontend
docker-compose build frontend
docker-compose up -d frontend
```

---

### **Option 3: Fix Permissions Manually**

If you still see errors:

```bash
# Fix permissions in container
docker exec juelle-hair-frontend chmod -R 755 /app

# Restart frontend
docker-compose restart frontend
```

---

## ✅ Verify Fix

1. **Check frontend logs:**
```bash
docker-compose logs frontend --tail=20
```

Should see:
```
✓ Ready in XXXms
○ Compiling / ...
```

**NOT:**
```
[Error: EPERM: operation not permitted, scandir '/app/app']
```

2. **Test frontend:**
Open browser: http://localhost:8002

Should load the homepage (not Internal Server Error).

3. **Test backend:**
Open browser: http://localhost:8001/api/health

Should return: `{"status":"ok",...}`

---

## 🔍 Additional Troubleshooting

### **If Still Getting Errors:**

1. **Check Docker Desktop Settings:**
   - Docker Desktop → Settings → Resources → File Sharing
   - Ensure your project directory is shared

2. **Clear Next.js Cache:**
```bash
docker exec juelle-hair-frontend rm -rf /app/.next
docker-compose restart frontend
```

3. **Check Volume Mounts:**
```bash
docker inspect juelle-hair-frontend | grep -A 10 Mounts
```

4. **Full Reset (Last Resort):**
```bash
docker-compose down -v  # Removes volumes
docker-compose build --no-cache
docker-compose up -d
```

---

## 📋 What Changed

**File: `docker-compose.yml`**

**Before:**
```yaml
environment:
  WATCHPACK_POLLING: "true"
volumes:
  - ./frontend:/app
  - /app/node_modules
command: npm run dev
```

**After:**
```yaml
environment:
  WATCHPACK_POLLING: "true"
  CHOKIDAR_USEPOLLING: "true"  # ✅ Added
volumes:
  - ./frontend:/app
  - /app/node_modules
  - /app/.next  # ✅ Added (exclude from mount)
command: sh -c "chmod -R 755 /app && npm run dev"  # ✅ Added chmod
```

---

## 🎯 Expected Result

After applying the fix:
- ✅ Frontend starts without permission errors
- ✅ `localhost:8002` loads correctly
- ✅ File watching works for hot reload
- ✅ No more `EPERM` errors in logs

---

## 💡 Why This Works

1. **`CHOKIDAR_USEPOLLING`** - Forces Next.js to use polling file watcher instead of native macOS file events (which have permission issues with Docker volumes)

2. **`chmod -R 755 /app`** - Ensures all files are readable/executable by the Node.js process

3. **`/app/.next` volume** - Excludes the build cache from the bind mount, preventing permission conflicts

---

## 🚨 If Nothing Works

Try running frontend **without Docker**:

```bash
cd frontend
npm install
npm run dev
```

This will run on `localhost:3000` (not 8002) but will help verify if it's a Docker-specific issue.

---

## 📞 Next Steps

1. **Apply the fix** (restart containers)
2. **Verify** frontend loads
3. **Test** hot reload works
4. **Report** if issues persist

The fix should resolve the permission errors and get your local Docker services running! 🎉
