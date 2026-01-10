# 🧪 Local Testing Guide

## Local URLs

### Using Docker Compose (Recommended)

**Frontend:**
```
http://localhost:8002
```

**Backend API:**
```
http://localhost:8001/api
```

**Backend Health Check:**
```
http://localhost:8001/api/health
http://localhost:8001/health
```

**Database:**
```
Host: localhost
Port: 5434
Database: juellehair
User: postgres
Password: postgres (default)
```

### Using npm directly (Without Docker)

**Frontend:**
```
http://localhost:3000
```

**Backend API:**
```
http://localhost:3001/api
```

**Backend Health Check:**
```
http://localhost:3001/api/health
```

---

## 🚀 Quick Start - Docker Compose

### 1. Start All Services

```bash
# From project root
docker-compose up -d

# Watch logs
docker-compose logs -f
```

This will start:
- ✅ PostgreSQL database on port 5434
- ✅ Backend API on port 8001
- ✅ Frontend on port 8002

### 2. Check Service Status

```bash
docker-compose ps
```

All services should show "Up" status.

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Database only
docker-compose logs -f postgres
```

### 4. Stop Services

```bash
docker-compose down
```

---

## 🔧 Running Without Docker

### Option 1: Backend Only (requires separate database)

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database connection

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start backend
npm run start:dev
```

Backend will run on: **http://localhost:3001**

### Option 2: Frontend Only (requires backend running)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-change-in-production
EOF

# Start frontend
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

## 📝 Environment Variables for Local Testing

### Backend `.env` (if running without Docker)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/juellehair?schema=public
JWT_SECRET=your-local-jwt-secret-change-this
PAYSTACK_SECRET_KEY=sk_test_your_test_key
CURRENCY_API_KEY=your_currency_api_key
FRONTEND_URL=http://localhost:8002
PORT=3001
NODE_ENV=development
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001/api
NEXTAUTH_URL=http://localhost:8002
NEXTAUTH_SECRET=local-dev-secret-change-in-production
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here
NEXT_PUBLIC_APP_NAME=Juelle Hair Ghana
NEXT_PUBLIC_BASE_CURRENCY=GHS
```

**Important:** 
- Use `http://localhost:8001/api` if using Docker Compose
- Use `http://localhost:3001/api` if running backend directly with npm

---

## 🗄️ Seed Shipping Data Locally

### Option 1: Using npm script

```bash
cd backend
npm run prisma:seed:shipping
```

### Option 2: Using ts-node directly

```bash
cd backend
npx ts-node prisma/seed-shipping.ts
```

### Option 3: Using Docker

```bash
docker-compose exec backend npm run prisma:seed:shipping
```

---

## 🧪 Testing the Shipping Regions Update

### 1. Check Shipping Zones

```bash
# Using curl
curl http://localhost:8001/api/shipping/zones

# Or open in browser
open http://localhost:8001/api/shipping/zones
```

### 2. Test Shipping Methods for a Region

```bash
# Test Greater Accra
curl "http://localhost:8001/api/shipping/methods?region=Greater%20Accra&orderTotal=500"

# Test Ashanti
curl "http://localhost:8001/api/shipping/methods?region=Ashanti&orderTotal=1000"
```

### 3. Test in Frontend

1. Open **http://localhost:8002**
2. Add items to cart
3. Go to checkout
4. Fill in shipping address
5. **Select a region from the dropdown** (should see all 17 Ghana regions)
6. Verify shipping methods appear correctly

---

## 🔍 Troubleshooting

### Backend not connecting to database

**Check database is running:**
```bash
docker-compose ps postgres
```

**Check database connection:**
```bash
docker-compose exec postgres psql -U postgres -d juellehair -c "SELECT 1;"
```

**Restart backend:**
```bash
docker-compose restart backend
```

### Frontend not connecting to backend

**Check backend is running:**
```bash
curl http://localhost:8001/api/health
```

**Check frontend .env.local:**
```bash
cat frontend/.env.local
```

Make sure `NEXT_PUBLIC_API_BASE_URL` matches your backend URL.

**Restart frontend:**
```bash
docker-compose restart frontend
# Or if running with npm:
# Stop (Ctrl+C) and run npm run dev again
```

### Database migrations needed

```bash
# Run migrations
docker-compose exec backend npm run prisma:migrate

# Or if running without Docker
cd backend
npm run prisma:migrate
```

### Port already in use

**Check what's using the port:**
```bash
# Check port 8001
lsof -i :8001

# Check port 8002
lsof -i :8002

# Check port 5434
lsof -i :5434
```

**Change ports in docker-compose.yml:**
```yaml
ports:
  - "${BACKEND_PORT:-8003}:3001"  # Change 8001 to 8003
  - "${FRONTEND_PORT:-8004}:3000" # Change 8002 to 8004
```

---

## 📊 Quick Test Checklist

- [ ] Database is running (port 5434)
- [ ] Backend API is accessible (http://localhost:8001/api/health)
- [ ] Frontend is accessible (http://localhost:8002)
- [ ] Frontend can fetch shipping zones
- [ ] Region dropdown shows all 17 Ghana regions
- [ ] Shipping methods appear when region is selected
- [ ] Free shipping threshold (GHS 950+) works correctly
- [ ] Checkout form submits successfully

---

## 🔗 Quick Links

- **Frontend:** http://localhost:8002
- **Backend API:** http://localhost:8001/api
- **API Health:** http://localhost:8001/api/health
- **Shipping Zones:** http://localhost:8001/api/shipping/zones
- **Shipping Methods:** http://localhost:8001/api/shipping/methods?region=Greater%20Accra&orderTotal=500

---

## 📝 Notes

- **Database:** Uses port 5434 locally (not standard 5432) to avoid conflicts
- **Hot Reload:** Both frontend and backend support hot reload in development
- **Logs:** Use `docker-compose logs -f` to watch all logs in real-time
- **Clean Start:** `docker-compose down -v` removes volumes (database data)
