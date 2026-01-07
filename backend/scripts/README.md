# Backend Scripts

## Migration & Deployment Scripts

### `export-production-database.sh`

Exports your local Docker database and creates a production-ready SQL file.

**Usage:**
```bash
cd backend/scripts
./export-production-database.sh
```

**What it does:**
- Exports complete database from Docker container
- Removes test users (@example.com)
- Creates `production-baseline.sql` (~3MB)
- Ready to commit and deploy

**Output:** `backend/prisma/migrations/production-baseline.sql`

---

### `import-production-database.sh`

Imports the production baseline database (auto-run by Docker).

**Usage:**
```bash
cd backend/scripts
./import-production-database.sh
```

**Environment Required:**
- `DATABASE_URL` - PostgreSQL connection string

**Safety:**
- Only imports if database is empty
- Set `FORCE_IMPORT=true` to override

**What it imports:**
- Complete schema (43 tables)
- 46 products with variants
- 19 categories, 15 brands
- 3 production users (no test users)
- Orders, reviews, all data

---

### `docker-entrypoint.sh`

Auto-runs on Docker container startup.

**Usage:** Automatic (via Dockerfile)

**Process:**
1. Checks environment variables
2. Waits for database (max 30s)
3. Generates Prisma Client
4. Checks if database is empty
5. Imports baseline if empty, or runs migrations
6. Starts application

**Manual Run:**
```bash
cd backend
DATABASE_URL=postgresql://... JWT_SECRET=... ./scripts/docker-entrypoint.sh node dist/src/main.js
```

---

## Common Tasks

### Export Fresh Database

```bash
# After adding products locally
cd backend/scripts
./export-production-database.sh

# Commit and deploy
git add ../prisma/migrations/production-baseline.sql
git commit -m "Update product catalog"
git push origin main
```

### Force Reimport on Production

```bash
# SSH to server or use Coolify console
docker-compose down backend
FORCE_IMPORT=true docker-compose up -d backend
docker-compose logs -f backend
```

### Test Migration Locally

```bash
# Create test database
docker exec juelle-hair-db psql -U postgres -c "CREATE DATABASE test_import;"

# Set temp DATABASE_URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5434/test_import?schema=public"

# Run import
cd backend/scripts
./import-production-database.sh

# Verify
docker exec juelle-hair-db psql -U postgres -d test_import -c \
  "SELECT COUNT(*) FROM products;"

# Cleanup
docker exec juelle-hair-db psql -U postgres -c "DROP DATABASE test_import;"
```

---

## Troubleshooting

### "Container not running"

```bash
# Start Docker services
cd /path/to/juellehairgh.com
docker-compose up -d
```

### "Database connection failed"

Check `DATABASE_URL` format:
```
postgresql://user:password@host:port/database?schema=public
```

### "Import failed"

```bash
# Check SQL file
ls -lh backend/prisma/migrations/production-baseline.sql

# Validate SQL syntax
docker exec juelle-hair-db psql -U postgres -d juellehair --dry-run \
  -f /path/to/production-baseline.sql
```

---

## Script Dependencies

All scripts require:
- **bash** (v4+)
- **docker** (for database access)
- **psql** (PostgreSQL client) - installed via Dockerfile
- **npx** (for Prisma commands)

Docker image includes:
- `postgresql-client` - for psql command
- `netcat-openbsd` - for connectivity checks

---

## Environment Variables Reference

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PAYSTACK_SECRET_KEY` - Payment gateway key

### Optional

- `FORCE_IMPORT` - Set to `true` to force database reimport
- `PORT` - Application port (default: 3001)
- `NODE_ENV` - Environment (production/development)

---

_Last updated: January 2026_

