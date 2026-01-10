# 🔧 Local Development Setup - Frontend

## Problem

When running the frontend locally, you're getting this error:
```
Maintenance check failed: [TypeError: fetch failed] {
cause: [Error: getaddrinfo ENOTFOUND api.juellehairgh.com]
}
```

This happens because the frontend is trying to connect to the production API URL (`api.juellehairgh.com`) which isn't accessible from your local machine.

## Solution: Create Local Environment File

### Step 1: Create `.env.local` file

In the `frontend` folder, create a file named `.env.local` with this content:

```env
# Local Development Environment Variables
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-change-in-production
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here
NEXT_PUBLIC_APP_NAME=Juelle Hair Ghana
NEXT_PUBLIC_BASE_CURRENCY=GHS
```

**Important:** Use the port where your backend is running locally:
- If backend runs on port `3001`: `http://localhost:3001/api`
- If backend runs on port `8001`: `http://localhost:8001/api`
- If using Docker Compose: `http://localhost:8001/api` (based on your docker-compose.yml)

### Step 2: Restart Frontend Dev Server

After creating `.env.local`:
1. Stop the frontend dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. The error should be gone!

## Alternative: Use Environment Variable

If you're running from terminal, you can set it inline:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api npm run dev
```

Or export it:
```bash
export NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
npm run dev
```

## Check Your Backend Port

To find out which port your backend is running on locally:

**If using Docker Compose:**
```bash
docker ps | grep backend
# Look at the port mapping (e.g., 8001:3001 means backend is on port 8001)
```

**If running backend directly:**
- Check `backend/package.json` for the port
- Or check your terminal where backend is running
- Usually it's `3001` or `8001`

## Quick Fix Command

If you just want to quickly fix it, run this in the `frontend` directory:

```bash
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api" > .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
```

Then restart your dev server.

## For Production

When deploying to production (Coolify):
- **Don't** use `.env.local` 
- Set `NEXT_PUBLIC_API_BASE_URL=https://api.juellehairgh.com/api` in Coolify environment variables
- Production will automatically use the correct URL

## Environment Variable Priority

Next.js uses this priority (highest to lowest):
1. `.env.local` (local development)
2. `.env.development` (development mode)
3. `.env.production` (production mode)
4. `.env` (all environments)
5. System environment variables

For local development, `.env.local` takes precedence and won't affect production!
