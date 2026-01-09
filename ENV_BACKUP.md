# 🔐 Environment Variables Backup - Juelle Hair Ghana

**Created:** January 8, 2026  
**Purpose:** Quick restore reference for Coolify environment variables

---

## ⚠️ IMPORTANT: Always Check "Available at Buildtime" ✅

For `NEXT_PUBLIC_*` variables, **MUST** check "Available at Buildtime"

---

## 📋 All Environment Variables

### Database
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[YOUR_SECURE_PASSWORD]
POSTGRES_DB=juellehair
```

### Backend Secrets
```
JWT_SECRET=PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=
PAYSTACK_SECRET_KEY=[YOUR_PAYSTACK_SECRET_KEY]
CURRENCY_API_KEY=[OPTIONAL - LEAVE EMPTY IF NOT NEEDED]
FRONTEND_URL=http://31.97.57.75:3000
```

### Frontend - Build Time Variables (CRITICAL!)
```
NEXT_PUBLIC_API_BASE_URL=http://31.97.57.75:3001/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=[YOUR_PAYSTACK_PUBLIC_KEY]
NEXT_PUBLIC_APP_NAME=Juelle Hair Ghana
NEXT_PUBLIC_BASE_CURRENCY=GHS
```

### Frontend - Runtime Variables
```
NEXTAUTH_URL=http://31.97.57.75:3000
NEXTAUTH_SECRET=fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=
```

### Optional Service URLs
```
SERVICE_URL_FRONTEND=http://31.97.57.75:3000
SERVICE_FQDN_BACKEND=[OPTIONAL]
SERVICE_FQDN_FRONTEND=[OPTIONAL]
```

---

## ✅ Quick Restore Checklist

Copy each value into Coolify and check the boxes:

### Required Variables (Fill These):

- [ ] **POSTGRES_PASSWORD** = `[Your password]`
  - ✅ Available at Buildtime
  - ✅ Available at Runtime

- [ ] **JWT_SECRET** = `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=`
  - ✅ Available at Buildtime
  - ✅ Available at Runtime

- [ ] **NEXTAUTH_SECRET** = `fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=`
  - ✅ Available at Buildtime
  - ✅ Available at Runtime

- [ ] **FRONTEND_URL** = `http://31.97.57.75:3000`
  - ✅ Available at Buildtime
  - ✅ Available at Runtime

- [ ] **NEXT_PUBLIC_API_BASE_URL** = `http://31.97.57.75:3001/api`
  - ✅ **Available at Buildtime** (CRITICAL!)
  - ✅ Available at Runtime

- [ ] **NEXTAUTH_URL** = `http://31.97.57.75:3000`
  - ✅ Available at Buildtime
  - ✅ Available at Runtime

- [ ] **PAYSTACK_SECRET_KEY** = `[Your Paystack secret key]`
  - ✅ Available at Buildtime
  - ✅ Available at Runtime

- [ ] **NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY** = `[Your Paystack public key]`
  - ✅ **Available at Buildtime** (CRITICAL!)
  - ✅ Available at Runtime

### Already Set (Verify):

- [x] **POSTGRES_USER** = `postgres` ✅
- [x] **POSTGRES_DB** = `juellehair` ✅
- [x] **NEXT_PUBLIC_APP_NAME** = `Juelle Hair Ghana` ✅
- [x] **NEXT_PUBLIC_BASE_CURRENCY** = `GHS` ✅

---

## 🔄 How to Restore Quickly

1. **Open Coolify** → Your Project → Environment Variables
2. **For each variable above:**
   - Click on the variable
   - Paste the value
   - Check "Available at Buildtime" ✅
   - Check "Available at Runtime" ✅
   - Click "Update"
3. **After all are set:** Trigger a new deployment

---

## 💾 How to Prevent Future Resets

1. **Export/Backup:** Coolify might have an export feature - check Settings
2. **Document:** Keep this file updated when you change values
3. **Version Control:** Consider using Coolify's shared variables feature
4. **Lock Variables:** Use the "Lock" button in Coolify to prevent accidental changes

---

## 📝 Notes

- Replace `[YOUR_PAYSTACK_SECRET_KEY]` with your actual Paystack secret key
- Replace `[YOUR_PAYSTACK_PUBLIC_KEY]` with your actual Paystack public key
- Replace `[YOUR_SECURE_PASSWORD]` with your database password
- If you have a domain, replace IP addresses with domain names

---

**Last Updated:** January 8, 2026

