# 🔐 Coolify Environment Variables - Fill These Values

## ⚠️ IMPORTANT: Set "Available at Buildtime" ✅ for Frontend Variables

For these variables, make sure **"Available at Buildtime"** checkbox is **CHECKED**:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_BASE_CURRENCY`

---

## 📋 Required Environment Variables

### 🔴 CRITICAL - Must Fill These:

#### 1. **POSTGRES_PASSWORD**
```
Value: [CREATE A STRONG PASSWORD - Minimum 20 characters]
Example: MySecurePassword123!@#456
```
- **Available at Buildtime:** ✅ CHECKED
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** Database password

---

#### 2. **JWT_SECRET**
```
Value: PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=
```
- **Available at Buildtime:** ✅ CHECKED
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** Backend authentication secret
- **Generated:** Using `openssl rand -base64 32`

---

#### 3. **NEXTAUTH_SECRET**
```
Value: fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=
```
- **Available at Buildtime:** ✅ CHECKED
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** NextAuth.js authentication secret
- **Generated:** Using `openssl rand -base64 32`

---

#### 4. **FRONTEND_URL**
```
Value: http://31.97.57.75:3000
```
**OR if you have a domain:**
```
Value: https://juellehair.com
```
- **Available at Buildtime:** ✅ CHECKED
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** Backend needs to know frontend URL for CORS

---

#### 5. **NEXT_PUBLIC_API_BASE_URL**
```
Value: http://31.97.57.75:3001/api
```
**OR if backend is on different domain:**
```
Value: https://api.juellehair.com/api
```
- **Available at Buildtime:** ✅ CHECKED (CRITICAL!)
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** Frontend needs this to call backend API

---

#### 6. **NEXTAUTH_URL**
```
Value: http://31.97.57.75:3000
```
**OR if you have a domain:**
```
Value: https://juellehair.com
```
- **Available at Buildtime:** ✅ CHECKED
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** NextAuth callback URL

---

#### 7. **PAYSTACK_SECRET_KEY**
```
Value: sk_live_YOUR_ACTUAL_PAYSTACK_SECRET_KEY
```
**OR for testing:**
```
Value: sk_test_YOUR_TEST_SECRET_KEY
```
- **Available at Buildtime:** ✅ CHECKED
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** Backend payment processing
- **Get from:** Paystack Dashboard → Settings → API Keys & Webhooks

---

#### 8. **NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY**
```
Value: pk_live_YOUR_ACTUAL_PAYSTACK_PUBLIC_KEY
```
**OR for testing:**
```
Value: pk_test_YOUR_TEST_PUBLIC_KEY
```
- **Available at Buildtime:** ✅ CHECKED (CRITICAL!)
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** Frontend payment processing
- **Get from:** Paystack Dashboard → Settings → API Keys & Webhooks

---

### ✅ Already Set (Verify These):

#### 9. **POSTGRES_USER**
```
Value: postgres
```
- **Status:** ✅ Already set correctly

---

#### 10. **POSTGRES_DB**
```
Value: juellehair
```
- **Status:** ✅ Already set correctly

---

#### 11. **NEXT_PUBLIC_APP_NAME**
```
Value: Juelle Hair Ghana
```
- **Status:** ✅ Already set correctly
- **Available at Buildtime:** ✅ CHECKED

---

#### 12. **NEXT_PUBLIC_BASE_CURRENCY**
```
Value: GHS
```
- **Status:** ✅ Already set correctly
- **Available at Buildtime:** ✅ CHECKED

---

### 🔵 Optional Variables:

#### 13. **CURRENCY_API_KEY**
```
Value: [Leave empty or add your API key]
```
- **Available at Buildtime:** ✅ CHECKED
- **Available at Runtime:** ✅ CHECKED
- **Purpose:** Currency conversion (optional)

---

#### 14. **SERVICE_URL_FRONTEND**
```
Value: http://31.97.57.75:3000
```
- **Available at Buildtime:** ⬜ Optional
- **Available at Runtime:** ⬜ Optional

---

#### 15. **SERVICE_FQDN_BACKEND** (Preview Deployments)
```
Value: [Leave empty or set if needed]
```
- **Available at Buildtime:** ⬜ Optional
- **Available at Runtime:** ⬜ Optional

---

#### 16. **SERVICE_FQDN_FRONTEND** (Preview Deployments)
```
Value: [Leave empty or set if needed]
```
- **Available at Buildtime:** ⬜ Optional
- **Available at Runtime:** ⬜ Optional

---

## 📝 Quick Checklist

Copy and paste these values into Coolify:

- [ ] **POSTGRES_PASSWORD** = `[Your secure password]`
- [ ] **JWT_SECRET** = `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=`
- [ ] **NEXTAUTH_SECRET** = `fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=`
- [ ] **FRONTEND_URL** = `http://31.97.57.75:3000`
- [ ] **NEXT_PUBLIC_API_BASE_URL** = `http://31.97.57.75:3001/api` ✅ BUILD TIME
- [ ] **NEXTAUTH_URL** = `http://31.97.57.75:3000`
- [ ] **PAYSTACK_SECRET_KEY** = `sk_live_...` or `sk_test_...`
- [ ] **NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY** = `pk_live_...` or `pk_test_...` ✅ BUILD TIME

---

## 🎯 Step-by-Step Instructions

1. **Go to Coolify** → Your Project → Environment Variables

2. **For each variable above:**
   - Click on the variable name
   - Paste the value in the "Value" field
   - ✅ Check "Available at Buildtime" (especially for `NEXT_PUBLIC_*` variables)
   - ✅ Check "Available at Runtime"
   - Click "Update"

3. **After setting all variables:**
   - Go to Deployment tab
   - Click "Redeploy" or trigger a new deployment
   - Watch the build logs - it should now succeed!

---

## 🔍 How to Get Paystack Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to: **Settings** → **API Keys & Webhooks**
3. Copy:
   - **Public Key** → Use for `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - **Secret Key** → Use for `PAYSTACK_SECRET_KEY`
4. Use **Test keys** for development, **Live keys** for production

---

## ⚠️ Important Notes

1. **Build Time vs Runtime:**
   - Variables with `NEXT_PUBLIC_` prefix MUST be available at build time
   - These are baked into the Next.js build
   - If missing at build time, the build will fail

2. **URLs for localhost deployment:**
   - Backend: `http://31.97.57.75:3001`
   - Frontend: `http://31.97.57.75:3000`
   - API Base: `http://31.97.57.75:3001/api`

3. **If you have a domain later:**
   - Replace `http://31.97.57.75:3000` with `https://yourdomain.com`
   - Replace `http://31.97.57.75:3001/api` with `https://api.yourdomain.com/api`

4. **Database Password:**
   - Create a strong password (minimum 20 characters)
   - Use the same password in `POSTGRES_PASSWORD` and `DATABASE_URL` (if you set it manually)

---

## ✅ After Filling All Values

Once you've filled in all the required values:

1. **Save all changes** in Coolify
2. **Trigger a new deployment**
3. **Watch the build logs** - you should see:
   - ✅ Build environment variables printed
   - ✅ Next.js build starting
   - ✅ Build completing successfully
   - ✅ Frontend service starting

The build should now succeed! 🎉

