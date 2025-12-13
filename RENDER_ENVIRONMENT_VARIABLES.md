# 🔧 Render Environment Variables Setup Guide

## ✅ YES - You Need to Set Up Environment Variables!

Both **Frontend** and **Backend** services on Render need environment variables configured.

---

## 🎯 Frontend Service Environment Variables

Go to: **Render Dashboard → Frontend Service → Environment**

### Required Variables:

```bash
# API Configuration (CRITICAL - fixes CORS and API calls)
NEXT_PUBLIC_API_BASE_URL=https://juelle-hair-backend.onrender.com/api

# Application Settings
NODE_ENV=production
PORT=3000

# App Configuration
NEXT_PUBLIC_APP_NAME=Juelle Hair Ghana
NEXT_PUBLIC_BASE_CURRENCY=GHS

# Paystack (if using frontend SDK directly)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_ddadd10dc94b2c2910d10f0fe0d78...

# Render URL (auto-set by Render, but can be explicit)
RENDER_EXTERNAL_URL=https://juelle-hair-web.onrender.com
```

### Important Notes:
- ✅ `NEXT_PUBLIC_API_BASE_URL` must end with `/api`
- ✅ Use HTTPS (not HTTP)
- ✅ No trailing slash after `/api`
- ✅ This is the **most critical** variable for fixing CORS and API calls

---

## 🔧 Backend Service Environment Variables

Go to: **Render Dashboard → Backend Service → Environment**

### Required Variables:

```bash
# Database (CRITICAL)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Server Configuration
NODE_ENV=production
PORT=3001
# Note: PORT is usually auto-set by Render, but can be explicit

# Frontend URL (CRITICAL for CORS)
FRONTEND_URL=https://juelle-hair-web.onrender.com

# JWT Authentication (CRITICAL)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-a-random-string

# Paystack Payment Gateway (CRITICAL for payments)
PAYSTACK_SECRET_KEY=sk_live_80c6d6b5e9c2a38a8e6e1427e641...

# Currency API (Optional - for currency conversion)
CURRENCY_API_KEY=your-currency-api-key-if-using-paid-service

# Render URL (auto-set by Render)
RENDER_EXTERNAL_URL=https://juelle-hair-backend.onrender.com
```

### Important Notes:
- ✅ `FRONTEND_URL` must match your frontend service URL exactly
- ✅ `DATABASE_URL` should use the Internal Database URL from Render
- ✅ `JWT_SECRET` should be a strong random string (generate with: `openssl rand -base64 32`)
- ✅ `PAYSTACK_SECRET_KEY` should be your LIVE key (starts with `sk_live_`)

---

## 📋 Step-by-Step Setup Instructions

### Step 1: Set Frontend Environment Variables

1. Go to **Render Dashboard**
2. Click on your **Frontend Service** (`juelle-hair-web`)
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add each variable:
   - **Key**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://juelle-hair-backend.onrender.com/api`
   - Click **"Save Changes"**
6. Repeat for other variables
7. **Redeploy** the service (or it will auto-deploy)

### Step 2: Set Backend Environment Variables

1. Go to **Render Dashboard**
2. Click on your **Backend Service** (`juelle-hair-backend`)
3. Click **"Environment"** tab
4. Verify/Add each variable:
   - `FRONTEND_URL=https://juelle-hair-web.onrender.com`
   - `DATABASE_URL=...` (should be auto-set if database is linked)
   - `JWT_SECRET=...` (generate a new one if not set)
   - `PAYSTACK_SECRET_KEY=...` (your live key)
   - `NODE_ENV=production`
5. Click **"Save Changes"**
6. **Redeploy** the service (or it will auto-deploy)

---

## 🔍 Verification Checklist

### Frontend Verification:

1. **Check Browser Console:**
   - Open your site: `https://juelle-hair-web.onrender.com`
   - Open DevTools → Console
   - Look for: `🔧 API Base URL configured: https://juelle-hair-backend.onrender.com/api`
   - ✅ Should NOT show `http://localhost:8001/api`

2. **Check Network Tab:**
   - Open DevTools → Network
   - Make a request (e.g., browse products)
   - Verify API calls go to: `https://juelle-hair-backend.onrender.com/api/...`
   - ✅ Should NOT go to `localhost`

### Backend Verification:

1. **Check Backend Logs:**
   - Go to Render Dashboard → Backend Service → Logs
   - Look for: `🌐 CORS Configuration:`
   - Should show: `Allowed Origins: https://juelle-hair-web.onrender.com, ...`

2. **Test API Endpoint:**
   ```bash
   curl https://juelle-hair-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok",...}`

---

## 🚨 Common Issues & Fixes

### Issue 1: "API Base URL configured: http://localhost:8001/api"

**Cause:** `NEXT_PUBLIC_API_BASE_URL` not set in frontend environment

**Fix:**
1. Set `NEXT_PUBLIC_API_BASE_URL=https://juelle-hair-backend.onrender.com/api` in Render
2. Redeploy frontend service

### Issue 2: CORS Errors Still Occurring

**Cause:** `FRONTEND_URL` not set correctly in backend

**Fix:**
1. Verify `FRONTEND_URL=https://juelle-hair-web.onrender.com` in backend environment
2. Ensure no trailing slash
3. Redeploy backend service

### Issue 3: Checkout Fails with "Checkout failed"

**Cause:** Multiple possible issues:
- CORS not configured (see Issue 2)
- `PAYSTACK_SECRET_KEY` not set
- `NEXT_PUBLIC_API_BASE_URL` not set

**Fix:**
1. Set all required environment variables
2. Redeploy both services
3. Check browser console for specific errors

---

## 📝 Quick Reference

### Frontend Service:
```
✅ NEXT_PUBLIC_API_BASE_URL=https://juelle-hair-backend.onrender.com/api
✅ NODE_ENV=production
✅ PORT=3000
```

### Backend Service:
```
✅ FRONTEND_URL=https://juelle-hair-web.onrender.com
✅ DATABASE_URL=postgresql://...
✅ JWT_SECRET=...
✅ PAYSTACK_SECRET_KEY=sk_live_...
✅ NODE_ENV=production
```

---

## 🎯 Priority Order

If you can only set a few variables, set these **CRITICAL** ones first:

1. **Frontend**: `NEXT_PUBLIC_API_BASE_URL` ← **MOST IMPORTANT**
2. **Backend**: `FRONTEND_URL` ← **MOST IMPORTANT**
3. **Backend**: `DATABASE_URL`
4. **Backend**: `JWT_SECRET`
5. **Backend**: `PAYSTACK_SECRET_KEY`

---

**After setting these variables, redeploy both services and test!** 🚀

