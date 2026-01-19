# Cash on Delivery - Deployment Guide

## ✅ Migration Ready for Coolify

The Cash on Delivery feature has been fully implemented and the database migration is ready to run automatically on your next Coolify deployment.

## 📦 What Will Happen on Deployment

### Automatic Migration Execution

When you deploy to Coolify, the migration will run automatically because:

1. **Dockerfile Configuration**: `backend/Dockerfile.api` uses `./scripts/docker-entrypoint.sh` as the entrypoint
2. **Entrypoint Script**: The `docker-entrypoint.sh` script automatically runs `npx prisma migrate deploy` on container startup
3. **Migration File**: Located at `backend/prisma/migrations/20260119031827_add_payment_method_to_orders/migration.sql`

### Migration Details

**Migration Name**: `20260119031827_add_payment_method_to_orders`

**What it does**:
- Adds `paymentMethod` column to the `orders` table
- Column type: `TEXT`
- Default value: `'paystack'` (for backward compatibility)
- Nullable: Yes (allows existing orders without payment method)

**SQL Command**:
```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'paystack';
```

## 🚀 Deployment Process

### Step 1: Push to Repository
```bash
git add .
git commit -m "Add Cash on Delivery payment option"
git push
```

### Step 2: Deploy on Coolify

1. **Trigger Deployment**: Push to your main branch or manually trigger in Coolify
2. **Watch Logs**: The migration will run automatically during container startup
3. **Expected Output**: You'll see in the logs:
   ```
   → Checking for pending migrations...
   Applied migration: 20260119031827_add_payment_method_to_orders
   ✓ Migrations up to date
   ```

### Step 3: Verify Migration

After deployment, verify the migration was applied:

**Option A: Check Coolify Logs**
- Look for "Applied migration" message in container logs
- Should see: `Applied migration: 20260119031827_add_payment_method_to_orders`

**Option B: Database Query** (if you have access)
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'paymentMethod';
```

Expected result:
- `column_name`: paymentMethod
- `data_type`: text
- `column_default`: 'paystack'

## ✅ Post-Deployment Checklist

- [ ] Migration applied successfully (check logs)
- [ ] Cash on Delivery option appears in checkout
- [ ] Orders can be created with COD payment method
- [ ] Email notifications show correct payment method
- [ ] Admin can see payment method in order details

## 🔍 Troubleshooting

### Migration Not Running?

1. **Check DATABASE_URL**: Ensure it's set in Coolify environment variables
2. **Check Logs**: Look for migration-related messages in container startup logs
3. **Manual Run**: If needed, you can manually run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Migration Already Applied?

If you see "No pending migrations" or "Already applied", that's fine! The migration has already run.

### Column Already Exists?

The migration uses `IF NOT EXISTS`, so it's safe to run multiple times. If the column already exists, it will be skipped.

## 📝 Feature Summary

After deployment, customers will be able to:

1. ✅ Select "Cash on Delivery" as a payment method at checkout
2. ✅ Place orders without immediate payment
3. ✅ Pay when the order is delivered
4. ✅ See COD as the payment method in order confirmations

Orders with COD will have:
- `paymentMethod`: `"cash_on_delivery"`
- `paymentStatus`: `"PENDING"`
- `orderStatus`: `"AWAITING_PAYMENT"`

## 🎯 Next Steps

1. Deploy to Coolify
2. Test the checkout flow with COD
3. Verify order creation and email notifications
4. Monitor for any issues

---

**Migration File**: `backend/prisma/migrations/20260119031827_add_payment_method_to_orders/migration.sql`  
**Entrypoint Script**: `backend/scripts/docker-entrypoint.sh` (line 171)  
**Dockerfile**: `backend/Dockerfile.api` (uses docker-entrypoint.sh)
