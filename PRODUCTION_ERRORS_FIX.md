# 🔧 Production Errors Fix Guide

## Issues Found

### 1. NextAuth SessionProvider Error (404)
**Error:** `/api/auth/session` returns 404

**Problem:** The app uses `SessionProvider` from `next-auth/react` but doesn't have NextAuth API routes configured. The app uses custom JWT authentication instead.

**Solution:** Remove NextAuth SessionProvider or create a minimal NextAuth setup.

### 2. Media Files 404 Errors
**Error:** Media files returning 404, paths like `/.juellehairgh.com/api/media/...`

**Problem:** URLs are being constructed incorrectly, possibly with double slashes or wrong base URL.

### 3. Image Optimization Errors (400)
**Error:** Next.js Image optimization returning 400 errors

**Problem:** Image URLs are malformed or the optimization endpoint can't process them.

---

## 🔧 Fixes

### Fix 1: Remove NextAuth SessionProvider

The app uses custom JWT authentication, so NextAuth is not needed.

**File:** `frontend/components/providers.tsx`

**Current code:**
```tsx
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* ... */}
    </SessionProvider>
  );
}
```

**Fixed code:**
```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Remove SessionProvider wrapper */}
      {/* ... */}
    </>
  );
}
```

**OR create a minimal NextAuth route** (if you want to keep it for future use):

Create `frontend/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";

// Minimal NextAuth configuration (not actually used for auth)
const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### Fix 2: Check Environment Variables

Make sure these are set correctly in Coolify:

**Frontend Environment Variables:**
```
NEXT_PUBLIC_API_BASE_URL=https://api.juellehairgh.com/api
NEXTAUTH_URL=https://juellehairgh.com
```

**Important:** 
- Make sure "Available at Buildtime" is checked for `NEXT_PUBLIC_API_BASE_URL`
- The `/api` suffix is required!

### Fix 3: Verify Media Proxy Route

The media proxy route should handle requests correctly. Check:

1. Backend API is accessible: `https://api.juellehairgh.com/api/health`
2. Media files exist on backend: `https://api.juellehairgh.com/api/admin/upload/media/...`
3. Frontend proxy route is working: `https://juellehairgh.com/api/media/...`

### Fix 4: Image URLs Construction

Check how image URLs are being constructed. The error `/.juellehairgh.com/api/media/...` suggests a double slash or incorrect base URL.

**Common causes:**
- Missing protocol (http/https)
- Double slashes in URL
- Incorrect base URL configuration

---

## 🚀 Quick Fix Steps

### Step 1: Update Providers Component

Remove NextAuth SessionProvider since it's not being used:

```bash
# Edit frontend/components/providers.tsx
# Remove SessionProvider import and wrapper
```

### Step 2: Verify Environment Variables

1. Go to Coolify → Frontend Service → Environment Variables
2. Verify:
   - `NEXT_PUBLIC_API_BASE_URL=https://api.juellehairgh.com/api` ✅
   - `NEXTAUTH_URL=https://juellehairgh.com` ✅
   - "Available at Buildtime" checked for `NEXT_PUBLIC_API_BASE_URL`

### Step 3: Redeploy Frontend

**CRITICAL:** After making changes, redeploy the frontend service!

### Step 4: Test

1. Check backend health: `https://api.juellehairgh.com/api/health`
2. Test a media URL: `https://juellehairgh.com/api/media/products/some-image.jpg`
3. Check browser console for remaining errors

---

## 🔍 Debugging

### Check Backend API

```bash
curl https://api.juellehairgh.com/api/health
```

### Check Media Proxy

```bash
curl https://juellehairgh.com/api/media/products/test.jpg
```

### Check Browser Console

Open browser DevTools (F12) and check:
- Network tab for failed requests
- Console tab for JavaScript errors
- Verify API calls go to `api.juellehairgh.com`

---

## ✅ Expected Results After Fix

- ✅ No `/api/auth/session` 404 errors
- ✅ Media files load correctly
- ✅ Images display properly
- ✅ No NextAuth errors in console
- ✅ All API calls go to `api.juellehairgh.com`
