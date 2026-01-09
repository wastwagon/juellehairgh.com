# 🚨 QUICK RESTORE - Environment Variables

**Use this to quickly restore variables when they reset**

---

## ⚡ Copy-Paste Values (In Order)

### 1. FRONTEND_URL
```
http://31.97.57.75:3000
```
✅ Buildtime ✅ Runtime

---

### 2. JWT_SECRET
```
PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=
```
✅ Buildtime ✅ Runtime

---

### 3. NEXTAUTH_SECRET
```
fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=
```
✅ Buildtime ✅ Runtime

---

### 4. NEXT_PUBLIC_API_BASE_URL ⚠️ CRITICAL
```
http://31.97.57.75:3001/api
```
✅ **BUILDTIME** (MUST CHECK!) ✅ Runtime

---

### 5. NEXTAUTH_URL
```
http://31.97.57.75:3000
```
✅ Buildtime ✅ Runtime

---

### 6. POSTGRES_PASSWORD
```
[Your database password - create a strong one]
```
✅ Buildtime ✅ Runtime

---

### 7. PAYSTACK_SECRET_KEY
```
[Your Paystack secret key - sk_live_... or sk_test_...]
```
✅ Buildtime ✅ Runtime

---

### 8. NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ⚠️ CRITICAL
```
[Your Paystack public key - pk_live_... or pk_test_...]
```
✅ **BUILDTIME** (MUST CHECK!) ✅ Runtime

---

## 🔒 After Setting Each Variable:

1. Click **"Update"** button
2. Click **"Lock"** button (prevents accidental deletion)
3. Move to next variable

---

## ✅ Quick Checklist

- [ ] FRONTEND_URL = `http://31.97.57.75:3000` + LOCKED 🔒
- [ ] JWT_SECRET = `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=` + LOCKED 🔒
- [ ] NEXTAUTH_SECRET = `fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=` + LOCKED 🔒
- [ ] NEXT_PUBLIC_API_BASE_URL = `http://31.97.57.75:3001/api` + BUILD TIME ✅ + LOCKED 🔒
- [ ] NEXTAUTH_URL = `http://31.97.57.75:3000` + LOCKED 🔒
- [ ] POSTGRES_PASSWORD = `[your password]` + LOCKED 🔒
- [ ] PAYSTACK_SECRET_KEY = `[your key]` + LOCKED 🔒
- [ ] NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = `[your key]` + BUILD TIME ✅ + LOCKED 🔒

---

## 🛡️ Prevent Future Resets:

1. **LOCK each variable** after setting it (click "Lock" button)
2. **Check Coolify Settings** → Look for "Shared Variables" or "Team Variables"
3. **Document changes** - Update this file when you change values
4. **Check if redeploy is clearing variables** - Try stopping service before redeploying

---

## 🌐 Updating to Your Own Domain

**If you want to change from IP addresses to your domain:**

### Variables to Update:

1. **FRONTEND_URL**
   - Change from: `http://31.97.57.75:3000`
   - Change to: `https://yourdomain.com` (or `https://www.yourdomain.com`)

2. **NEXT_PUBLIC_API_BASE_URL**
   - Change from: `http://31.97.57.75:3001/api`
   - Change to: `https://api.yourdomain.com/api` (or `https://yourdomain.com/api`)

3. **NEXTAUTH_URL**
   - Change from: `http://31.97.57.75:3000`
   - Change to: `https://yourdomain.com` (must match FRONTEND_URL)

### How to Edit Locked Variables:

**If variables are locked and you can't edit them:**

1. **Click on the variable NAME** (not the lock icon) - this opens the edit dialog
2. **Or try the "Developer view" button** at the top
3. **Or delete and recreate** the variable (make sure you have the value first!)

📖 **See `UNLOCK_ENV_VARS.md` for detailed instructions on unlocking variables**

### After Updating:

1. ✅ Save all changes
2. ✅ Trigger a new deployment (Redeploy)
3. ✅ Test your domain - make sure everything works

---

**Last Updated:** January 8, 2026

