# 🔍 Render Shell Diagnostic - Products Not Loading

## How to Run Diagnostic on Render

### **Option 1: Using Render Shell (Recommended)**

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Click: **`juelle-hair-backend`** service

2. **Open Shell:**
   - Click: **"Shell"** tab (or look for terminal/console icon)
   - This opens a web-based terminal

3. **Upload and Run Script:**
   ```bash
   # The script is already in your repo, but if you need to upload it:
   # Copy the script content and paste it into the shell, or:
   
   # Download from GitHub (if pushed):
   curl -o diagnose-production-products.sh https://raw.githubusercontent.com/wastwagon/juellehairgh-web/main/diagnose-production-products.sh
   
   # Make executable
   chmod +x diagnose-production-products.sh
   
   # Run it
   ./diagnose-production-products.sh
   ```

---

### **Option 2: Run Commands Manually**

If you can't upload the script, run these commands one by one in Render Shell:

```bash
# 1. Check backend health
curl -s https://juelle-hair-backend.onrender.com/api/health

# 2. Check database
curl -s https://juelle-hair-backend.onrender.com/api/health/db

# 3. Test products endpoint
curl -s https://juelle-hair-backend.onrender.com/api/products | head -50

# 4. Check CORS
curl -s -I -H "Origin: https://juelle-hair-web.onrender.com" \
  https://juelle-hair-backend.onrender.com/api/products | grep -i "access-control"

# 5. Test with frontend origin
curl -s -H "Origin: https://juelle-hair-web.onrender.com" \
  https://juelle-hair-backend.onrender.com/api/products | head -20
```

---

### **Option 3: Run Locally (Tests Production)**

You can also run the diagnostic script locally - it tests the production URLs:

```bash
cd /Users/OceanCyber/Downloads/juellehairgh.com
./diagnose-production-products.sh
```

---

## 📋 What the Script Checks

1. **Backend Health** - Is the backend responding?
2. **Database Connection** - Is the database connected?
3. **Products API** - Does `/api/products` return data?
4. **CORS Configuration** - Are CORS headers set correctly?
5. **Frontend API Config** - Is frontend pointing to correct backend?
6. **Network Connectivity** - Can frontend reach backend?

---

## 🔍 Expected Output

The script will show:
- ✅ Green checkmarks for working components
- ❌ Red X for failed components
- ⚠️ Yellow warnings for potential issues

---

## 🎯 Common Issues and Fixes

### **Issue 1: Products API Returns 500**

**Check backend logs:**
```bash
# In Render Shell or Dashboard → Logs
# Look for:
# - Prisma errors
# - Database connection errors
# - JWT_SECRET errors
```

**Fix:** Update JWT_SECRET or check database migrations

---

### **Issue 2: Database Not Connected**

**Check:**
```bash
curl https://juelle-hair-backend.onrender.com/api/health/db
```

**If returns error:**
- Check `DATABASE_URL` in Render environment variables
- Verify database is running
- Check if migrations ran: `prisma migrate deploy`

---

### **Issue 3: CORS Errors**

**Check:**
```bash
curl -I -H "Origin: https://juelle-hair-web.onrender.com" \
  https://juelle-hair-backend.onrender.com/api/products
```

**Should see:**
```
Access-Control-Allow-Origin: https://juelle-hair-web.onrender.com
```

**If missing:** Check `main.ts` CORS configuration

---

### **Issue 4: Frontend API URL Wrong**

**Check frontend HTML:**
```bash
curl -s https://juelle-hair-web.onrender.com | grep "NEXT_PUBLIC_API_BASE_URL"
```

**Should show:**
```json
{"NEXT_PUBLIC_API_BASE_URL":"https://juelle-hair-backend.onrender.com/api"}
```

**If wrong:** Update in Render Dashboard → `juelle-hair-web` → Environment

---

## 📊 Diagnostic Results Interpretation

### **All Green ✅**
- Backend is working
- Issue is likely in frontend JavaScript
- Check browser console for errors

### **Products API Red ❌**
- Backend has an error
- Check backend logs for specific error
- Most likely: Database or JWT_SECRET issue

### **Database Red ❌**
- Database not connected
- Check DATABASE_URL
- Run migrations if needed

### **CORS Red ❌**
- CORS not configured
- Check `main.ts` CORS settings
- Verify FRONTEND_URL environment variable

---

## 🚀 Quick Commands for Render Shell

```bash
# Quick health check
curl https://juelle-hair-backend.onrender.com/api/health

# Check database
curl https://juelle-hair-backend.onrender.com/api/health/db

# Test products (first 100 chars)
curl https://juelle-hair-backend.onrender.com/api/products | head -c 100

# Check environment variables (if accessible)
env | grep -E "DATABASE_URL|JWT_SECRET|FRONTEND_URL"

# Check if Prisma Client exists
ls -la node_modules/.prisma/client/ 2>/dev/null || echo "Prisma Client not found"

# Check recent backend logs (if tail available)
tail -50 /var/log/render.log 2>/dev/null || echo "Logs not accessible"
```

---

## 📝 After Running Diagnostic

1. **Share the output** - Copy the diagnostic results
2. **Check specific errors** - Look for red ❌ items
3. **Review backend logs** - Render Dashboard → Logs
4. **Test fixes** - After applying fixes, run diagnostic again

---

## 🎯 Next Steps

After running the diagnostic:

1. **If Products API fails:** Check backend logs for exact error
2. **If Database fails:** Verify DATABASE_URL and migrations
3. **If CORS fails:** Check CORS configuration in `main.ts`
4. **If all backend checks pass:** Issue is in frontend - check browser console

---

## 💡 Pro Tip

Run the diagnostic script **before and after** making changes to verify fixes work!
