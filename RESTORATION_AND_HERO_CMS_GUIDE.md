# Restoration & Hero Banner CMS Guide

This guide helps you restore the project after losing the PostgreSQL database and set up safe hero banner CMS development without affecting production.

---

## Part 1: Restore Local Development (PostgreSQL)

### 1.1 Start PostgreSQL via Docker

Since you lost the database from Docker Desktop, start fresh:

```bash
# Start only PostgreSQL (or use full stack)
docker compose up -d postgres

# Verify it's running
docker compose ps
```

**Note:** `postgres_data` volume will be recreated if it was removed. This gives you a clean database.

### 1.2 Run Migrations & Seed

Once PostgreSQL is healthy:

```bash
# Option A: Full stack (postgres + backend + frontend)
docker compose up -d
# Backend runs migrations automatically on start

# Option B: Run migrations manually (if backend runs locally)
cd backend
npm install
npx prisma migrate deploy
npx prisma generate

# Seed essential data
npm run setup:features
npm run populate:banners   # For promotional banners
# Add more seeds as needed (setup-collections-reviews-social, etc.)
```

### 1.3 Port Consistency

Your `.env` uses `FRONTEND_PORT=9002` and `FRONTEND_URL=http://localhost:8002`. Ensure they match:
- Frontend runs on **9002** (per docker-compose default)
- Use `FRONTEND_URL=http://localhost:9002` and `NEXTAUTH_URL=http://localhost:9002`

---

## Part 2: Change Hero Banner on Production (Without CMS)

The hero banner currently uses **hardcoded images** (no database):

- **Mobile:** `/Mobile-hero-banner.jpeg`
- **Desktop:** `/NewPoroHeroBanner.jpeg`

### To change the hero image on live production:

1. **Upload new images** to `frontend/public/`:
   - e.g. `Mobile-hero-banner.jpeg` (mobile)
   - e.g. `NewPoroHeroBanner.jpeg` (desktop)

2. **Replace existing files** (or update `hero-banner.tsx` to use new filenames)

3. **Redeploy** the frontend to your production server (Coolify/VPS)

No database or API changes needed. The component reads from static paths.

---

## Part 3: Develop Hero Banner CMS (Without Affecting Production)

### Strategy: Feature Branch + Fallback

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/hero-banner-cms
   ```

2. **Design decisions:**
   - Existing `Banner` model is for *promotional* banners (used by `PromotionalBanners`).
   - Hero needs **2 images** (mobile + desktop) and optionally a link.
   - Options:
     - **A)** Add `HeroBanner` table (id, mobileImage, desktopImage, link, isActive)
     - **B)** Add `type` to `Banner` model (`hero` vs `promotional`) + extra fields for mobile/desktop

3. **Implementation outline:**
   - Add Prisma model / migration for hero banner settings
   - Create backend API: `GET /api/hero-banner`, `PUT /api/admin/hero-banner`
   - Add admin UI under `/admin` (e.g. Hero Banner section)
   - Update `HeroBanner` component to:
     - Fetch from API when available
     - **Fallback** to current static images if API fails or returns empty
   - This way, production keeps working until you deploy the CMS changes

4. **Deploy only when ready:** Merge and deploy when CMS is tested locally.

---

## Quick Reference: Current Hero Banner Flow

| Item | Location | Notes |
|------|----------|-------|
| Hero component | `frontend/components/home/hero-banner.tsx` | Static paths only |
| Mobile image | `frontend/public/Mobile-hero-banner.jpeg` | Served at `/Mobile-hero-banner.jpeg` |
| Desktop image | `frontend/public/NewPoroHeroBanner.jpeg` | Served at `/NewPoroHeroBanner.jpeg` |
| Promotional banners | `Banner` model, `/admin/banners` | Already CMS-managed (different from hero) |

---

## Production Database (Coolify/VPS)

Production uses `docker-compose.database.yml` or Coolify-managed PostgreSQL. Ensure:

- `DATABASE_URL` points to your production DB
- Run `prisma migrate deploy` on deploy
- Do **not** run seed scripts on production unless you have idempotent seeds

For hero image changes on production right now: **only replace the image files** and redeploy the frontend. No DB changes required.
