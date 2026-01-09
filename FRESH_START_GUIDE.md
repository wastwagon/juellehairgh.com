# 🚀 FRESH START GUIDE - Splitting Services

**Goal:** Completely eliminate the Dockerfile mix-up bug by deploying Backend and Frontend as **separate Coolify resources**.

---

## 🛑 Step 1: Delete Old Project
1.  Confirm deletion of the current project in Coolify (as you planned).
2.  Ensure you have your **Secrets** backed up (see `ENV_BACKUP.md`).

---

## 🛠️ Step 2: Create "Backend" Resource
1.  **New Resource** -> **Docker Compose**.
2.  **Repository:** `wastwagon/juellehairgh.com`
3.  **Branch:** `main`
4.  **Docker Compose Path:** `docker-compose.backend.yml`  <-- **CRITICAL**
5.  **Environment Variables:**
    *   Copy **Database** and **Backend** variables from `ENV_BACKUP.md`.
    *   *Check "Available at Buildtime" for `POSTGRES_*` variables.*
    *   *Check "Available at Runtime" for all.*

| Variable | Value from Backup |
| :--- | :--- |
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `[YOUR_PASSWORD]` |
| `POSTGRES_DB` | `juellehair` |
| `JWT_SECRET` | `PCwgh...` |
| `PAYSTACK_SECRET_KEY` | `sk_...` |
| `FRONTEND_URL` | `http://31.97.57.75:3000` (or domain) |

6.  **Deploy Backend**. Verify it works (logs should show NestJS starting).

---

## 🎨 Step 3: Create "Frontend" Resource
1.  **New Resource** -> **Docker Compose**.
2.  **Repository:** `wastwagon/juellehairgh.com`
3.  **Branch:** `main`
4.  **Docker Compose Path:** `docker-compose.frontend.yml`  <-- **CRITICAL**
5.  **Environment Variables:**
    *   Copy **Frontend** variables from `ENV_BACKUP.md`.
    *   **CRITICAL:** Check "Available at Buildtime" for all `NEXT_PUBLIC_*` variables.

| Variable | Value from Backup | Buildtime? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://31.97.57.75:3001/api` | **YES** ✅ |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_...` | **YES** ✅ |
| `NEXT_PUBLIC_APP_NAME` | `Juelle Hair Ghana` | **YES** ✅ |
| `NEXT_PUBLIC_BASE_CURRENCY` | `GHS` | **YES** ✅ |
| `NEXTAUTH_URL` | `http://31.97.57.75:3000` | No |
| `NEXTAUTH_SECRET` | `fn5e...` | No |

6.  **Deploy Frontend**.

---

## ✅ Why This Fixes It
By using separate `docker-compose` files in separate Coolify resources, Coolify creates completely isolated build contexts. It cannot physically confuse the Dockerfiles because the Frontend resource *doesn't even know* about the Backend Dockerfile (and vice-versa).
