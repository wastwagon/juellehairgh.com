# 🔍 Hardcoded Environment Variables Analysis

Based on the Coolify screenshot and codebase analysis, here's what's **hardcoded** vs what's **managed in Coolify**:

## ✅ Variables Managed in Coolify (NOT Hardcoded)

These variables are correctly configured in Coolify and **NOT** hardcoded in the codebase:

1. **`POSTGRES_PASSWORD`** - ✅ Set in Coolify (value: `JuelleHair2026`)
2. **`SERVICE_FQDN_BACKEND`** - ✅ Set in Coolify (value: `api.juellehairgh.com`)
3. **`SERVICE_URL_BACKEND`** - ✅ Set in Coolify (value: `https://api.juellehairgh.com`)
4. **`DATABASE_URL`** - ✅ Set in Coolify (but missing pool parameters - needs fix)
5. **`JWT_SECRET`** - ✅ Set in Coolify (value: `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=`)
6. **`FRONTEND_URL`** - ✅ Set in Coolify (value: `https://juellehairgh.com`)
7. **`POSTGRES_USER`** - ✅ Set in Coolify (value: `postgres`)
8. **`POSTGRES_DB`** - ✅ Set in Coolify (value: `juellehair`)
9. **`POSTGRES_HOST`** - ✅ Set in Coolify (value: `wg4kgo8g08c4gcsk080ssoww`)
10. **`POSTGRES_PORT`** - ✅ Set in Coolify (value: `5432`)

## ⚠️ Hardcoded Values Found in Codebase

These values are **hardcoded** in the code and should be moved to environment variables:

### 1. **Domain Names (Hardcoded in Multiple Files)**

**Location:** `backend/src/main.ts` (lines 14-15)
```typescript
const allowedOriginsList = [
  "https://juellehairgh.com",        // ⚠️ HARDCODED
  "https://www.juellehairgh.com",    // ⚠️ HARDCODED
  // ...
];
```

**Should be:** Use `FRONTEND_URL` environment variable instead

**Also found in:**
- `backend/src/main.ts:43` - CORS check: `origin.includes("juellehairgh.com")`
- Multiple email templates and components (acceptable for display purposes)

### 2. **Email Addresses (Hardcoded Defaults)**

**Location:** `backend/src/email/email.service.ts` (line 23)
```typescript
"noreply@juellehairgh.com";  // ⚠️ HARDCODED DEFAULT
```

**Location:** `backend/src/email/email.module.ts` (multiple lines)
```typescript
"noreply@juellehairgh.com"  // ⚠️ HARDCODED DEFAULT
"admin@juellehairgh.com"    // ⚠️ HARDCODED DEFAULT
```

**Should be:** These are fallback defaults (acceptable), but ensure Coolify sets:
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`
- `ADMIN_EMAIL`

### 3. **Database Password Fallback**

**Location:** `backend/scripts/init-postgres-password.sh` (line 9)
```bash
NEW_PASSWORD="${POSTGRES_PASSWORD:-JuelleHair2026}"  # ⚠️ HARDCODED FALLBACK
```

**Should be:** Remove hardcoded fallback or use a secure default

### 4. **Frontend API URLs (Hardcoded Fallbacks)**

**Location:** Multiple frontend files
```typescript
process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9001/api'  // ⚠️ HARDCODED FALLBACK
```

**Should be:** Ensure `NEXT_PUBLIC_API_BASE_URL` is set in Coolify for production

## 📋 Variables That Should Be in Coolify (But May Be Missing)

Check if these are configured in Coolify:

1. **`NEXT_PUBLIC_API_BASE_URL`** - Should be: `https://api.juellehairgh.com/api`
2. **`NEXTAUTH_URL`** - Should be: `https://juellehairgh.com`
3. **`NEXTAUTH_SECRET`** - Should be set (different from JWT_SECRET)
4. **`EMAIL_FROM`** - Should be: `noreply@juellehairgh.com` or similar
5. **`EMAIL_FROM_NAME`** - Should be: `Juelle Hair Ghana`
6. **`ADMIN_EMAIL`** - Should be: `admin@juellehairgh.com` or similar
7. **`SMTP_HOST`** - Should be: `mail.juellehairgh.com` (if using custom SMTP)
8. **`SMTP_USER`** - Should be set if using custom SMTP
9. **`SMTP_PASSWORD`** - Should be set if using custom SMTP
10. **`PAYSTACK_SECRET_KEY`** - Should be set for payment processing
11. **`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`** - Should be set for frontend

## 🔧 Recommended Actions

### Immediate Fixes:

1. **Update `backend/src/main.ts`** to use environment variables:
   ```typescript
   const allowedOriginsList = [
     process.env.FRONTEND_URL,
     process.env.FRONTEND_URL?.replace('https://', 'https://www.'),
     "http://localhost:9002",
     "http://localhost:3000",
   ].filter(Boolean);
   ```

2. **Remove hardcoded password fallback** from `backend/scripts/init-postgres-password.sh`:
   ```bash
   NEW_PASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
   ```

3. **Verify all frontend environment variables** are set in Coolify:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`

### Acceptable Hardcoded Values:

These are **OK** to keep hardcoded as they're for display/UI purposes:
- Email addresses in templates (e.g., `support@juellehairgh.com`)
- Domain names in UI components (e.g., contact information)
- Default fallbacks for local development

## 🎯 Summary

**Good News:** Most critical secrets (`POSTGRES_PASSWORD`, `JWT_SECRET`) are **NOT** hardcoded and are properly managed in Coolify.

**Issues Found:**
1. CORS origins hardcoded in `backend/src/main.ts` (should use `FRONTEND_URL`)
2. Database password fallback hardcoded in init script (should require env var)
3. Some email defaults hardcoded (acceptable as fallbacks, but should be set in Coolify)

**Action Required:**
- Fix CORS configuration to use environment variables
- Remove password fallback from init script
- Verify all frontend environment variables are set in Coolify
