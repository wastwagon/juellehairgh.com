# 🔐 Production Environment Variables (Domain Setup)

**Domain:** `juellehairgh.com`
**API Domain:** `api.juellehairgh.com`

---

## 1. Backend Resource (Environment Variables)

Copy these into the **Backend** resource in Coolify.

| Variable Name | Value | Build Variable? |
| :--- | :--- | :--- |
| `POSTGRES_USER` | `postgres` | No |
| `POSTGRES_PASSWORD` | `[YOUR_SECURE_DB_PASSWORD]` | Yes (Recommended) |
| `POSTGRES_DB` | `juellehair` | No |
| `JWT_SECRET` | `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=` | No |
| `PAYSTACK_SECRET_KEY` | `[YOUR_PAYSTACK_SECRET_KEY]` | No |
| `FRONTEND_URL` | `https://juellehairgh.com` | No |
| `PORT` | `3001` | No |
| `NODE_ENV` | `production` | No |

*   **Domains Setting (General Tab):** `https://api.juellehairgh.com`

---

## 2. Frontend Resource (Environment Variables)

Copy these into the **Frontend** resource in Coolify.

| Variable Name | Value | **Build Variable?** (CRITICAL) |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.juellehairgh.com/api` | **YES** ✅ |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `[YOUR_PAYSTACK_PUBLIC_KEY]` | **YES** ✅ |
| `NEXT_PUBLIC_APP_NAME` | `Juelle Hair Ghana` | **YES** ✅ |
| `NEXT_PUBLIC_BASE_CURRENCY` | `GHS` | **YES** ✅ |
| `NEXTAUTH_URL` | `https://juellehairgh.com` | No |
| `NEXTAUTH_SECRET` | `fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=` | No |
| `NODE_ENV` | `production` | No |

*   **Domains Setting (General Tab):** `https://juellehairgh.com` (and optionally `https://www.juellehairgh.com`)

---

### ⚠️ Before Deploying:
1.  **DNS Records:** Ensure you have added `A` records in your domain provider (Namecheap/GoDaddy/etc.) pointing to your Coolify server IP (`31.97.57.75`):
    *   `@` (root) -> `31.97.57.75`
    *   `www` -> `31.97.57.75`
    *   `api` -> `31.97.57.75`
2.  **HTTPS:** Coolify will automatically provision SSL certificates for these domains once the DNS propagates.
