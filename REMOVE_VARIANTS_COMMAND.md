# 🗑️ Remove Variants - Direct Command

## Option 1: Run Direct Command (No Git Push Needed)

Run this directly on **Backend Shell**:

```bash
npx ts-node scripts/remove-auto-variants.ts
```

This will work even if the npm script isn't in package.json yet.

---

## Option 2: Use Prisma Studio (Interactive)

1. **Open Prisma Studio:**
   ```bash
   npm run prisma:studio
   ```

2. **Navigate to ProductVariant table**
3. **Select all variants**
4. **Delete them**

---

## Option 3: Direct SQL Command

**⚠️ WARNING: This deletes ALL variants immediately!**

```bash
npx prisma db execute --stdin <<< "DELETE FROM product_variants;"
```

Or using psql (if you have database access):

```sql
DELETE FROM product_variants;
```

---

## Option 4: Wait for Git Push

1. **Push changes to GitHub:**
   ```bash
   git push origin main
   ```

2. **Wait for Render to deploy** (automatic)

3. **Then run:**
   ```bash
   npm run remove:variants
   ```

---

## ✅ Recommended: Option 1

**Run this now on Backend Shell:**

```bash
npx ts-node scripts/remove-auto-variants.ts
```

This will work immediately without waiting for deployment!
