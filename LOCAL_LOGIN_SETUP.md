# Local login and 500 errors – fix

## Why you see 500 and 401

- **500** on `/api/categories`, `/api/brands`, etc. = backend cannot use the database (DB not running, wrong `DATABASE_URL`, or migrations not applied).
- **401** on `/api/auth/login` = “Invalid credentials” (user not in DB or wrong password).

## 1. Use Docker for DB + backend (simplest)

From the project root:

```bash
# Start Postgres and backend (and optionally frontend)
docker-compose up -d postgres backend
```

Ensure a root `.env` exists with at least:

```env
JWT_SECRET=local-dev-secret-change-in-production
PAYSTACK_SECRET_KEY=sk_test_anything
```

Backend will use: `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/juellehair` (set by docker-compose).

## 2. Apply migrations (required once)

If the database is new or empty, create tables:

```bash
cd backend

# If backend runs in Docker, point to Postgres on host (Docker exposes 5435)
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/juellehair" npx prisma migrate deploy

# Or run inside the backend container
docker exec -it juelle-hair-backend npx prisma migrate deploy
```

## 3. Create a user you can log in with

From `backend/`:

```bash
npm run create:users
```

This creates (among others):

- **Email:** `admin@juellehairgh.com`  
- **Password:** `password123`

## 4. Run frontend and log in

- Frontend: `http://localhost:9002` (Docker) or `http://localhost:3000` (`cd frontend && npm run dev`).
- API base: `http://localhost:9001/api` (must match `NEXT_PUBLIC_API_BASE_URL` for the frontend).

Log in at `/auth/login` (or `/login`) with:

- **Email:** `admin@juellehairgh.com`  
- **Password:** `password123`

## 5. If you run backend on the host (no Docker for backend)

1. Start only Postgres: `docker-compose up -d postgres`
2. In `backend/` create or edit `.env`:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5435/juellehair"
   JWT_SECRET=local-dev-secret
   PAYSTACK_SECRET_KEY=sk_test_anything
   ```

3. Apply migrations: `npx prisma migrate deploy`
4. Create users: `npm run create:users`
5. Start backend: `npm run start:dev` (API on port 3001 by default; frontend must use that in `NEXT_PUBLIC_API_BASE_URL`).

---

**Summary:** Fix 500s by ensuring Postgres is running, `DATABASE_URL` is correct, and `prisma migrate deploy` has been run. Fix login by creating a user with `npm run create:users` and using `admin@juellehairgh.com` / `password123`.
