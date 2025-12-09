# 🔧 Complete Guide to Fix Backend 500 Errors

## 🎯 Problem Summary
All backend API endpoints are returning **500 Server Error**, preventing the frontend from loading data. The health endpoint (`/health`) works fine, but data endpoints like `/api/products` fail.

## 🔍 Root Causes (Most Likely)

### 1. **Database Migrations Not Run** ⚠️ **MOST LIKELY**
The database tables don't exist because `prisma migrate deploy` hasn't been executed successfully.

### 2. **Prisma Client Not Generated**
Prisma Client binaries are missing or generated incorrectly.

### 3. **Database Connection Issues**
The database connection string is incorrect or the database is unreachable.

### 4. **Missing Environment Variables**
`JWT_SECRET` or other required environment variables are missing or invalid.

---

## ✅ Step-by-Step Fix

### **Step 1: Check Backend Logs on Render** 🔴 **DO THIS FIRST**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on **`juelle-hair-backend`** service
3. Click **"Logs"** tab
4. Look for error messages that contain:
   - `PrismaClientInitializationError`
   - `Table "Product" does not exist`
   - `relation "Product" does not exist`
   - `Cannot find module '@prisma/client'`
   - `JWT_SECRET`
   - Any red error messages

**📋 Copy the exact error message and share it with me.**

---

### **Step 2: Test Database Diagnostic Endpoint**

I've added a new diagnostic endpoint. Test it:

```bash
curl https://juelle-hair-backend.onrender.com/api/health/db
```

**Expected Output (if working):**
```json
{
  "status": "ok",
  "database": "connected",
  "tables": {
    "products": 0,
    "categories": 0,
    "brands": 0
  }
}
```

**If you see an error**, it will tell us exactly what's wrong:
- `Table "Product" does not exist` → Migrations not run
- `Connection refused` → Database connection issue
- `PrismaClientInitializationError` → Prisma Client not generated

---

### **Step 3: Verify Database Migrations**

The `render.yaml` includes `prisma:deploy` in the start command, but it might be failing silently.

**Check Render Logs for:**
```
Running: npm run prisma:deploy
```

**If you see errors like:**
- `No migrations found`
- `Migration failed`
- `Database schema is not in sync`

**Then you need to:**

1. **Check if migrations exist:**
   ```bash
   ls -la backend/prisma/migrations
   ```

2. **If migrations don't exist**, you need to create them locally first:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

3. **Then commit and push to GitHub:**
   ```bash
   git add backend/prisma/migrations
   git commit -m "Add database migrations"
   git push origin main
   ```

4. **Render will automatically redeploy** and run `prisma migrate deploy`.

---

### **Step 4: Update JWT_SECRET** 🔐

The `JWT_SECRET` in `render.yaml` is a placeholder. You **MUST** update it:

1. **Generate a secure secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Update in Render Dashboard:**
   - Go to **`juelle-hair-backend`** service
   - Click **"Environment"** tab
   - Find `JWT_SECRET`
   - Replace `CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32` with your generated secret
   - Click **"Save Changes"**
   - Render will automatically redeploy

---

### **Step 5: Verify Database Connection**

1. **Check `DATABASE_URL` in Render:**
   - Go to **`juelle-hair-backend`** → **"Environment"** tab
   - Verify `DATABASE_URL` exists and points to `juelle-hair-postgres`
   - It should look like: `postgresql://juellehair_user:...@dpg-xxx.oregon-postgres.render.com/juellehair`

2. **Test connection manually** (if you have `psql` installed):
   ```bash
   psql "YOUR_DATABASE_URL_FROM_RENDER"
   ```
   Then run:
   ```sql
   \dt  -- List all tables
   SELECT COUNT(*) FROM "Product";  -- Test Product table
   ```

---

### **Step 6: Force Prisma Client Regeneration**

If Prisma Client is the issue, force regeneration:

1. **Update `render.yaml` build command** to ensure Prisma generates:
   ```yaml
   buildCommand: npm ci --include=dev && npm run prisma:generate && npm run build
   ```

2. **Commit and push:**
   ```bash
   git add render.yaml
   git commit -m "Force Prisma Client regeneration"
   git push origin main
   ```

---

### **Step 7: Check for Missing Environment Variables**

Verify these are set in Render Dashboard → `juelle-hair-backend` → Environment:

- ✅ `DATABASE_URL` (auto-linked from database)
- ✅ `JWT_SECRET` (you must set this)
- ✅ `NODE_ENV=production`
- ✅ `FRONTEND_URL=https://juelle-hair-web.onrender.com`
- ⚠️ `PAYSTACK_SECRET_KEY` (optional, but needed for payments)
- ⚠️ `SENDGRID_API_KEY` (optional, for emails)

---

## 🧪 Testing After Fix

Once you've made changes, test:

```bash
# 1. Test health endpoint (should work)
curl https://juelle-hair-backend.onrender.com/api/health

# 2. Test database diagnostic (should show connected)
curl https://juelle-hair-backend.onrender.com/api/health/db

# 3. Test products endpoint (should return data or empty array, not 500)
curl https://juelle-hair-backend.onrender.com/api/products
```

---

## 📊 Error Log Analysis Guide

### **If you see in logs:**
```
❌ Error in findAll: Table "Product" does not exist
```
**→ Solution:** Run `prisma migrate deploy` (should happen automatically, but check logs)

---

### **If you see:**
```
PrismaClientInitializationError: Query Engine not found
```
**→ Solution:** Prisma Client not generated. Check `buildCommand` includes `prisma:generate`

---

### **If you see:**
```
Error: connect ECONNREFUSED
```
**→ Solution:** Database connection issue. Check `DATABASE_URL` in Render environment variables.

---

### **If you see:**
```
JWT_SECRET is required
```
**→ Solution:** Update `JWT_SECRET` in Render Dashboard environment variables.

---

## 🚀 Quick Fix Checklist

- [ ] Check Render backend logs for exact error message
- [ ] Test `/api/health/db` endpoint
- [ ] Verify `DATABASE_URL` is set correctly
- [ ] Update `JWT_SECRET` with a secure value
- [ ] Check if migrations exist in `backend/prisma/migrations`
- [ ] Verify `prisma:deploy` runs successfully in Render logs
- [ ] Test `/api/products` endpoint after fixes

---

## 📞 Next Steps

1. **Share the exact error from Render logs** (Step 1)
2. **Share the output of `/api/health/db`** (Step 2)
3. I'll provide specific fixes based on the actual error messages.

The error logging I added will now show detailed error messages in Render logs, making it much easier to diagnose the exact issue.
