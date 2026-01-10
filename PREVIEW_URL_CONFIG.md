# 🔧 Preview URL Configuration - Exact Values

## Your Preview URLs (with HTTPS)

**Backend:** `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io`  
**Frontend:** `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io`

**Note:** Use `https://` instead of `http://` for SSL/HTTPS support.

---

## Backend Service Environment Variables

Go to **Backend service** → **Environment Variables** and set:

```
POSTGRES_HOST=wg4kgo8g08c4gcsk080ssoww
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=JuelleHair2026
POSTGRES_DB=juellehair
JWT_SECRET=PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=
FRONTEND_URL=https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
PORT=3001
NODE_ENV=production
```

**Key variable:** `FRONTEND_URL` = Frontend preview URL (HTTPS)

---

## Frontend Service Environment Variables

Go to **Frontend service** → **Environment Variables** and set:

**⚠️ IMPORTANT: Check "Available at Buildtime" ✅ for all `NEXT_PUBLIC_*` variables!**

```
NEXT_PUBLIC_API_BASE_URL=https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
NEXTAUTH_URL=https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
NEXTAUTH_SECRET=fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<your-paystack-public-key>
NEXT_PUBLIC_APP_NAME=Juelle Hair Ghana
NEXT_PUBLIC_BASE_CURRENCY=GHS
NODE_ENV=production
```

**Key variables:**
- `NEXT_PUBLIC_API_BASE_URL` = Backend preview URL + `/api` (HTTPS)
- `NEXTAUTH_URL` = Frontend preview URL (HTTPS)

---

## Step-by-Step Instructions

### Step 1: Update Backend Environment Variables

1. Go to **Backend service** in Coolify
2. Click **"Environment Variables"** tab
3. Update or add:
   - `FRONTEND_URL` = `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io`
   - Make sure `POSTGRES_HOST`, `POSTGRES_PASSWORD`, etc. are set correctly
4. **Save** changes

### Step 2: Update Frontend Environment Variables

1. Go to **Frontend service** in Coolify
2. Click **"Environment Variables"** tab
3. Update or add:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api`
   - `NEXTAUTH_URL` = `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io`
   - **CRITICAL:** Check ✅ "Available at Buildtime" for `NEXT_PUBLIC_API_BASE_URL`
   - **CRITICAL:** Check ✅ "Available at Buildtime" for all other `NEXT_PUBLIC_*` variables
4. **Save** changes

### Step 3: Update Domains in Coolify (Optional but Recommended)

**Backend Service:**
1. Go to **Backend** → **Configuration** → **General**
2. In **Domains** section, add or update:
   - `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io`

**Frontend Service:**
1. Go to **Frontend** → **Configuration** → **General**
2. In **Domains** section, add or update:
   - `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io`

### Step 4: Redeploy Services

1. **Redeploy Backend** service (use updated FRONTEND_URL)
2. **Redeploy Frontend** service (must rebuild with new API URL)

**Important:** Frontend **must** be redeployed because `NEXT_PUBLIC_*` variables are embedded at build time!

---

## Complete Environment Variables Checklist

### ✅ Backend Service

- [ ] `POSTGRES_HOST` = `wg4kgo8g08c4gcsk080ssoww`
- [ ] `POSTGRES_PORT` = `5432`
- [ ] `POSTGRES_USER` = `postgres`
- [ ] `POSTGRES_PASSWORD` = `JuelleHair2026`
- [ ] `POSTGRES_DB` = `juellehair`
- [ ] `JWT_SECRET` = `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=`
- [ ] `FRONTEND_URL` = `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io` ⚠️ **IMPORTANT**
- [ ] `PORT` = `3001`
- [ ] `NODE_ENV` = `production`

### ✅ Frontend Service

- [ ] `NEXT_PUBLIC_API_BASE_URL` = `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api` ⚠️ **CRITICAL - Must end with /api**
- [ ] `NEXTAUTH_URL` = `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io` ⚠️ **IMPORTANT**
- [ ] `NEXTAUTH_SECRET` = `fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=`
- [ ] `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` = `<your-key>`
- [ ] `NEXT_PUBLIC_APP_NAME` = `Juelle Hair Ghana`
- [ ] `NEXT_PUBLIC_BASE_CURRENCY` = `GHS`
- [ ] `NODE_ENV` = `production`
- [ ] ✅ **"Available at Buildtime" checked** for all `NEXT_PUBLIC_*` variables

---

## Testing After Deployment

1. **Test Frontend:**
   ```
   https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
   ```
   - Should load your website
   - Check browser console for errors

2. **Test Backend Health:**
   ```
   https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/health
   ```
   - Should return JSON health status

3. **Test Database Connection:**
   ```
   https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/health/db
   ```
   - Should return database status

4. **Test API Connection from Frontend:**
   - Open browser DevTools → Network tab
   - Visit frontend URL
   - Check if API calls are going to: `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/...`

---

## Common Issues

### Frontend can't connect to backend

**Check:**
- `NEXT_PUBLIC_API_BASE_URL` ends with `/api`
- `NEXT_PUBLIC_API_BASE_URL` uses `https://` not `http://`
- Frontend was **redeployed** after changing the variable
- "Available at Buildtime" is checked for `NEXT_PUBLIC_API_BASE_URL`

### CORS errors

**Check:**
- `FRONTEND_URL` in Backend matches frontend preview URL exactly
- Both use `https://` not `http://`
- Backend was restarted after changing `FRONTEND_URL`

### SSL/HTTPS errors

**Solution:**
- Coolify auto-generates SSL certificates for `.sslip.io` domains
- Wait 1-2 minutes after generating domain for SSL to activate
- Use `https://` URLs, not `http://`

---

## When Ready for Your Real Domain

When you're ready to switch to `juellehairgh.com`:

1. **Update Backend:**
   - `FRONTEND_URL` = `https://juellehairgh.com`

2. **Update Frontend:**
   - `NEXT_PUBLIC_API_BASE_URL` = `https://api.juellehairgh.com/api`
   - `NEXTAUTH_URL` = `https://juellehairgh.com`

3. **Add domains in Coolify:**
   - Backend: `api.juellehairgh.com`
   - Frontend: `juellehairgh.com` and `www.juellehairgh.com`

4. **Update DNS records** at your domain provider

5. **Redeploy both services**

---

## Quick Copy-Paste Values

**Backend Environment Variables:**
```
FRONTEND_URL=https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
```

**Frontend Environment Variables:**
```
NEXT_PUBLIC_API_BASE_URL=https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
NEXTAUTH_URL=https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
```

That's it! Set these and redeploy.
