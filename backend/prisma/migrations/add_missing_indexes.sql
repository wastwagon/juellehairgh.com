-- Migration: Add missing indexes to prevent slow queries and 504 errors
-- Run this manually on your production database if Prisma migrations fail

-- Add index on Category.parentId (critical for category tree queries)
CREATE INDEX IF NOT EXISTS "categories_parentId_idx" ON "categories"("parentId");

-- Add index on Collection.slug (already unique but explicit index helps)
CREATE INDEX IF NOT EXISTS "collections_slug_idx" ON "collections"("slug");

-- Add index on Collection.isActive (for filtering active collections)
CREATE INDEX IF NOT EXISTS "collections_isActive_idx" ON "collections"("isActive");

-- Verify indexes were created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename IN ('categories', 'collections')
ORDER BY tablename, indexname;
