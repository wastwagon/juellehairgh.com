# 🔧 Fix Collections, Reviews & Social Media - Complete Guide

## ✅ Issues Fixed

1. **Shop by Collection** - Collections now created and populated with products
2. **Reviews Section** - Sample reviews created with verified users
3. **Social Media Header** - Facebook, Instagram, Twitter URLs configured

---

## 🚀 Quick Deploy on Render Shell

**Run this command:**

```bash
npm run setup:collections-reviews-social
```

**Or run the full deployment:**

```bash
npm run deploy:all
```

---

## 📋 What Gets Created

### **1. Collections** ✅

Creates 4 collections:
- **New Arrivals** - Latest 8 products
- **Best Sellers** - Top 8 products (by reviews or random)
- **Clearance** - Products on sale (or random if none)
- **Wigs Under GH₵ 500** - Affordable products (or cheapest if none)

**Each collection is populated with products from your database.**

---

### **2. Sample Reviews** ✅

Creates:
- **Sample users** (if none exist):
  - Sarah Mensah (customer1@example.com)
  - Ama Asante (customer2@example.com)
  - Kofi Osei (customer3@example.com)
- **6 sample reviews** with:
  - Ratings (4-5 stars)
  - Titles and comments
  - Verified badges
  - Linked to products

---

### **3. Social Media Settings** ✅

Sets up:
- **Facebook**: https://www.facebook.com/juellehairgh
- **Instagram**: https://www.instagram.com/juellehairgh
- **Twitter**: https://www.twitter.com/juellehairgh

**These will now show in the header!**

---

## 🎯 Step-by-Step Deployment

### **On Render Shell:**

```bash
# You're in: ~/project/src/backend

# Option 1: Run just collections/reviews/social
npm run setup:collections-reviews-social

# Option 2: Run full deployment (includes everything)
npm run deploy:all
```

---

## ✅ Expected Results

### **After Running:**

1. **Shop by Collection** section:
   - ✅ Shows 4 collection cards
   - ✅ Each has product images (not placeholders)
   - ✅ Shows product count
   - ✅ Links work: `/collections/new-arrivals`, etc.

2. **Reviews Section**:
   - ✅ Shows 6+ reviews
   - ✅ Verified badges visible
   - ✅ Product links work
   - ✅ Carousel navigation works

3. **Social Media Header**:
   - ✅ Facebook icon/link visible
   - ✅ Instagram icon/link visible
   - ✅ Twitter icon/link visible
   - ✅ Links to social media pages

---

## 🧪 Verify Deployment

### **Test Collections API:**
```bash
curl https://juelle-hair-backend.onrender.com/api/collections
```

### **Test Reviews API:**
```bash
curl https://juelle-hair-backend.onrender.com/api/reviews/public?limit=12
```

### **Test Settings API:**
```bash
curl https://juelle-hair-backend.onrender.com/api/settings/site
```

Should return:
```json
{
  "phone": "+233 539506949",
  "email": "sales@juellehairgh.com",
  "facebook": "https://www.facebook.com/juellehairgh",
  "instagram": "https://www.instagram.com/juellehairgh",
  "twitter": "https://www.twitter.com/juellehairgh"
}
```

---

## 📝 Script Details

### **Collections Logic:**

- **New Arrivals**: Latest 8 products (by `createdAt`)
- **Best Sellers**: Products with most reviews, or random if none
- **Clearance**: Products with `compareAtPriceGhs < priceGhs`, or random
- **Wigs Under GH₵ 500**: Products with `priceGhs <= 500`, or cheapest 8

### **Reviews Logic:**

- Creates sample users if none exist
- Links reviews to first 10 products
- Mix of verified and unverified reviews
- Ratings: 4-5 stars

### **Social Media:**

- Updates/creates settings in database
- Uses standard social media URLs (update if needed)

---

## 🔧 Update Social Media URLs

If you need different URLs, update in Render Shell:

```bash
# Connect to database and update
# Or update via admin panel
```

Or edit the script: `backend/scripts/setup-collections-reviews-social.ts`

---

## 🚀 Ready to Deploy!

**Run on Render Shell:**

```bash
npm run setup:collections-reviews-social
```

**Then test:**
- https://juelle-hair-web.onrender.com (check Shop by Collection)
- https://juelle-hair-web.onrender.com (scroll to Reviews section)
- Check header for social media icons

**Everything should be working!** 🎉
