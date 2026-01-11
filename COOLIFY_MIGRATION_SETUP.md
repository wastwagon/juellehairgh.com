# Coolify Migration Setup Guide

This guide explains how to set up automatic database migrations for your Coolify deployment.

## Overview

Your project uses Prisma for database management. To automatically run migrations on deployment, you have several options.

## Option 1: Entrypoint Script (Recommended)

This approach runs migrations before the application starts.

### 1. Update your Coolify Start Command

In your Coolify service settings, update the **Start Command** to:

```bash
./backend/scripts/entrypoint.sh
```

Or if your working directory is already `backend`:

```bash
./scripts/entrypoint.sh
```

### 2. Make sure the script is executable

The script should already be executable, but if needed:

```bash
chmod +x backend/scripts/entrypoint.sh
```

### 3. How it works

- The entrypoint script runs `prisma migrate deploy` first
- Then starts your NestJS application
- If migrations fail, the container won't start (fail-safe)

## Option 2: Separate Migration Script

Run migrations as a separate step in Coolify.

### 1. Add to Coolify Build Command

In your Coolify service settings, add this to the **Build Command** (after `npm install`):

```bash
cd backend && npx prisma migrate deploy
```

Or use the migration script:

```bash
cd backend && ./scripts/migrate.sh
```

### 2. Update package.json (Optional)

Add this script to `backend/package.json`:

```json
{
  "scripts": {
    "migrate": "prisma migrate deploy",
    "migrate:dev": "prisma migrate dev",
    "postinstall": "prisma generate"
  }
}
```

Then in Coolify, use:

```bash
npm run migrate
```

## Option 3: Coolify Health Checks

You can also trigger migrations via health check or initialization script.

### In Coolify Health Check

Add a custom health check that runs migrations:

```bash
cd backend && npx prisma migrate deploy && echo "Migrations OK"
```

## Important Notes

1. **DATABASE_URL**: Make sure `DATABASE_URL` is set in your Coolify environment variables
2. **Prisma Generate**: Ensure `prisma generate` runs during build (usually in `postinstall`)
3. **Migration Safety**: `prisma migrate deploy` is safe for production (doesn't create new migrations, only applies existing ones)
4. **Idempotent**: The migrations use `IF NOT EXISTS`, so they're safe to run multiple times

## Current Migration Files

Your migrations are in: `backend/prisma/migrations/`

The latest migration adds password reset columns:
- `passwordResetToken` (TEXT, nullable, unique)
- `passwordResetExpires` (TIMESTAMP(3), nullable)

## Testing Locally

Test the migration script locally:

```bash
cd backend
./scripts/migrate.sh
```

Or with Docker:

```bash
docker-compose exec backend ./scripts/migrate.sh
```

## Troubleshooting

### Migration fails

- Check `DATABASE_URL` is correct
- Verify database is accessible
- Check migration files are committed to git
- Review Prisma migration logs

### Migrations not running

- Verify the script is executable (`chmod +x`)
- Check Coolify logs for migration output
- Ensure the start command includes the entrypoint script
- Verify Prisma CLI is installed (`npx prisma --version`)

## Recommended Setup (Quick Start)

1. **In Coolify**, update your service's **Start Command** to:
   ```bash
   ./backend/scripts/entrypoint.sh
   ```

2. **Set environment variable** `DATABASE_URL` in Coolify

3. **Deploy** - migrations will run automatically before the app starts

That's it! 🎉
