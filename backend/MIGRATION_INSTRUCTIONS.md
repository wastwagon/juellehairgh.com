# Migration Instructions: Add Variant Sale Price

## Problem
The backend is returning 500 errors because the database is missing the `compareAtPriceGhs` column in the `product_variants` table.

## Solution
You need to run a database migration to add the new column.

## Option 1: Using Prisma Migrate (Recommended)

If you have DATABASE_URL configured in your `.env` file:

```bash
cd backend
npx prisma migrate deploy
```

Or for development:

```bash
cd backend
npx prisma migrate dev --name add_variant_sale_price
```

## Option 2: Manual SQL Execution

If you prefer to run the SQL manually, connect to your PostgreSQL database and run:

```sql
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "compareAtPriceGhs" DECIMAL(10,2);
```

## Option 3: Using psql Command Line

```bash
psql -h your-host -U your-user -d your-database -c "ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS \"compareAtPriceGhs\" DECIMAL(10,2);"
```

## After Migration

1. Regenerate Prisma Client (if needed):
```bash
cd backend
npx prisma generate
```

2. Restart your backend server

## Verify

After running the migration, the `/api/products` endpoint should work without 500 errors.
