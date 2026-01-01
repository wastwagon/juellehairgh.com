# How to Seed Categories and Brands in Production

## Quick Start

### Option 1: Using the Shell Script (Easiest)

```bash
cd backend
export DATABASE_URL="postgresql://user:password@host:port/database"
./scripts/run-seed-production.sh
```

### Option 2: Direct TypeScript Execution

```bash
cd backend
export DATABASE_URL="postgresql://user:password@host:port/database"
npx ts-node scripts/seed-categories-brands.ts
```

### Option 3: Using npm script (if added to package.json)

```bash
cd backend
export DATABASE_URL="postgresql://user:password@host:port/database"
npm run seed:production
```

## Getting Your Production DATABASE_URL

### If using Render.com:
1. Go to your Render dashboard
2. Select your database service
3. Copy the "Internal Database URL" or "External Database URL"
4. Use it as: `export DATABASE_URL="postgresql://..."`

### If using other hosting:
- Check your hosting provider's database settings
- Look for connection string or DATABASE_URL environment variable

## Troubleshooting

### Error: "DATABASE_URL is not set"
- Make sure you export the DATABASE_URL before running the script
- Or run: `DATABASE_URL="your-url" ./scripts/run-seed-production.sh`

### Error: "Cannot find module '@prisma/client'"
- Run: `npm install` in the backend directory
- Then: `npx prisma generate`

### Error: "Connection refused" or "Cannot connect to database"
- Check your DATABASE_URL is correct
- Verify database is accessible from your location
- Check firewall/security group settings

### Error: "Permission denied"
- Make script executable: `chmod +x scripts/run-seed-production.sh`

## What Gets Created

### Categories:
- Shop All
- Braids (with 4 subcategories)
- Ponytails (with 2 subcategories)
- Lace Wigs (with 3 subcategories)
- Clip-Ins (with 2 subcategories)
- Hair Growth Oils
- Wig Care

### Brands:
- Sensationnel
- Outre
- Freetress
- Bobbi Boss
- Model Model
- Zury
- X-Pression
- Kanekalon
- Marley
- Afro Kinky

## Verification

After running, verify the data was created:

```bash
# Check categories via API
curl https://your-api-url.com/api/categories

# Check brands via API
curl https://your-api-url.com/api/brands
```

Or check in your admin panel at `/admin/categories` and `/admin/brands`

