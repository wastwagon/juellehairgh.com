# 🚀 Quick Domain Setup - juellehairgh.com

## ⚡ Quick Steps

### 1. Configure Domains in Coolify

**Frontend Service:**
- Add domain: `juellehairgh.com`
- Optionally add: `www.juellehairgh.com`

**Backend Service:**
- Add domain: `api.juellehairgh.com`

### 2. Update Environment Variables

#### Frontend Service:
```
NEXT_PUBLIC_API_BASE_URL=https://api.juellehairgh.com/api
NEXTAUTH_URL=https://juellehairgh.com
```
✅ **Check "Available at Buildtime"** for `NEXT_PUBLIC_API_BASE_URL`

#### Backend Service:
```
FRONTEND_URL=https://juellehairgh.com
```

### 3. Configure DNS Records

Add these A records at your domain registrar:

```
Type: A
Name: @ (or blank)
Value: 31.97.57.75

Type: A
Name: www
Value: 31.97.57.75

Type: A
Name: api
Value: 31.97.57.75
```

### 4. Wait for DNS & SSL (15-30 minutes)

### 5. Redeploy Services

**CRITICAL:** Redeploy both frontend and backend after updating environment variables.

---

## ✅ Test URLs

- Frontend: https://juellehairgh.com
- Backend: https://api.juellehairgh.com/api/health

---

## 📚 Full Guide

See `DOMAIN_SETUP_GUIDE.md` for detailed instructions and troubleshooting.
