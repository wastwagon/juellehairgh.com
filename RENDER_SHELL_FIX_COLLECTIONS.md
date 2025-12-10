# 🚀 Render Shell Commands - Fix Collections, Reviews & Social Media

## ✅ Ready to Run on Render Shell

You're already in: `~/project/src/backend`

---

## 🎯 Single Command Fix

Run this **one command** to fix everything:

```bash
npm run setup:collections-reviews-social
```

**This will:**
1. ✅ Create 4 collections (New Arrivals, Best Sellers, Clearance, Wigs Under GH₵ 500)
2. ✅ Populate collections with products
3. ✅ Create sample reviews (with sample users if needed)
4. ✅ Setup social media settings (Facebook, Instagram, Twitter)

---

## 📋 What Gets Fixed

### **1. Shop by Collection** ✅
- Creates collections in database
- Populates with products
- Shows product images (not placeholders)
- Product counts display correctly

### **2. Reviews Section** ✅
- Creates sample users (if none exist)
- Creates 6 sample reviews
- Verified badges work
- Reviews show on homepage

### **3. Social Media Header** ✅
- Facebook link configured
- Instagram link configured
- Twitter link configured
- Icons show in header

---

## 🧪 Verify After Running

### **Test Collections:**
```bash
curl https://juelle-hair-backend.onrender.com/api/collections
```

### **Test Reviews:**
```bash
curl https://juelle-hair-backend.onrender.com/api/reviews/public?limit=12
```

### **Test Settings:**
```bash
curl https://juelle-hair-backend.onrender.com/api/settings/site
```

---

## 🚀 Run Now!

**On Render Shell:**

```bash
npm run setup:collections-reviews-social
```

**Wait for completion, then test:**
- https://juelle-hair-web.onrender.com (check Shop by Collection section)
- https://juelle-hair-web.onrender.com (scroll to Reviews section)
- Check header for social media icons

**Everything should be working!** 🎉
