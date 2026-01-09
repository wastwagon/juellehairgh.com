# ✅ Environment Variables - Prefilled Summary

## 🎯 Quick Reference: What's Already Set vs What Needs Updating

---

## ✅ Prefilled Values (Ready to Use)

These values are already filled in from your existing setup and don't need changes:

| Variable | Value | Status |
|----------|-------|--------|
| `JWT_SECRET` | `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=` | ✅ Prefilled |
| `NEXTAUTH_SECRET` | `fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=` | ✅ Prefilled |
| `POSTGRES_USER` | `postgres` | ✅ Prefilled |
| `POSTGRES_DB` | `juellehair` | ✅ Prefilled |
| `NEXT_PUBLIC_APP_NAME` | `Juelle Hair Ghana` | ✅ Prefilled |
| `NEXT_PUBLIC_BASE_CURRENCY` | `GHS` | ✅ Prefilled |

---

## ⚠️ Must Update Before Deploying

These values have placeholders and **must be updated** with your actual values:

| Variable | Current Value | What to Change |
|----------|--------------|----------------|
| `POSTGRES_PASSWORD` | `ChangeThisToSecurePassword123!@#` | ⚠️ Set your secure database password |
| `FRONTEND_URL` | `https://juellehair.com` | ⚠️ Update to your actual domain |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.juellehair.com/api` | ⚠️ Update to your backend API URL |
| `NEXTAUTH_URL` | `https://juellehair.com` | ⚠️ Must match FRONTEND_URL |
| `PAYSTACK_SECRET_KEY` | `sk_live_YOUR_PAYSTACK_SECRET_KEY` | ⚠️ Add your Paystack secret key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_YOUR_PAYSTACK_PUBLIC_KEY` | ⚠️ Add your Paystack public key |

---

## 📝 Example: Updating to Your Domain

If your domain is `juellehairgh.com`, update these:

```env
# Before (IP address)
FRONTEND_URL=http://31.97.57.75:3000
NEXT_PUBLIC_API_BASE_URL=http://31.97.57.75:3001/api
NEXTAUTH_URL=http://31.97.57.75:3000

# After (your domain)
FRONTEND_URL=https://juellehairgh.com
NEXT_PUBLIC_API_BASE_URL=https://api.juellehairgh.com/api
NEXTAUTH_URL=https://juellehairgh.com
```

**Or if backend and frontend are on the same domain:**

```env
FRONTEND_URL=https://juellehairgh.com
NEXT_PUBLIC_API_BASE_URL=https://juellehairgh.com/api
NEXTAUTH_URL=https://juellehairgh.com
```

---

## 🚀 Quick Setup Steps

1. **Copy the prefilled file:**
   ```bash
   cp env.production.prefilled .env.production
   ```

2. **Edit `.env.production`** and update the 6 variables marked with ⚠️ above

3. **Deploy:**
   ```bash
   docker-compose -f docker-compose.new.yml --env-file .env.production up -d --build
   ```

---

## 📋 Complete Variable List

### Database Variables
- `POSTGRES_USER` = `postgres` ✅
- `POSTGRES_PASSWORD` = ⚠️ **UPDATE**
- `POSTGRES_DB` = `juellehair` ✅
- `DATABASE_URL` = Auto-generated from above ✅

### Backend Variables
- `JWT_SECRET` = `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=` ✅
- `PAYSTACK_SECRET_KEY` = ⚠️ **UPDATE**
- `FRONTEND_URL` = ⚠️ **UPDATE** (currently `https://juellehair.com`)
- `CURRENCY_API_KEY` = (optional, can leave empty)

### Frontend Variables (Build Time - CRITICAL!)
- `NEXT_PUBLIC_API_BASE_URL` = ⚠️ **UPDATE** (currently `https://api.juellehair.com/api`)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` = ⚠️ **UPDATE**
- `NEXT_PUBLIC_APP_NAME` = `Juelle Hair Ghana` ✅
- `NEXT_PUBLIC_BASE_CURRENCY` = `GHS` ✅

### Frontend Variables (Runtime)
- `NEXTAUTH_URL` = ⚠️ **UPDATE** (must match FRONTEND_URL)
- `NEXTAUTH_SECRET` = `fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=` ✅

---

## 🔐 Security Notes

- Never commit `.env.production` to Git (it's in `.gitignore`)
- Keep your `POSTGRES_PASSWORD` secure (minimum 20 characters)
- Rotate secrets periodically
- Use environment variables in Coolify, not hardcoded values

---

**Last Updated:** January 8, 2026
