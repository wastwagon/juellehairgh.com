# 🔧 Fix Collection Images - Complete Guide

## ✅ Issues Fixed

1. **Collection Images Not Showing** - Backend now serves static files from `/media/collections/`
2. **Products Under 500 GHS** - Script to verify and populate collection
3. **Image Path Resolution** - Fixed image URL handling

---

## 🚀 Quick Fix on Render Shell

**Run these commands:**

```bash
# 1. Fix collection images and verify products under 500 GHS
npm run fix:collection-images

# 2. Verify collections are set up
npm run setup:collections-reviews-social
```

---

## 📋 What Was Fixed

### **1. Static File Serving** ✅

**Problem:** Backend wasn't serving static files, so `/media/collections/` URLs returned 404.

**Solution:** Added static file serving in `backend/src/main.ts`:
- Serves files from `uploads/media/` directory
- Also checks `frontend/public/media/` for development
- Accessible via `/media/collections/`, `/media/products/`, etc.

---

### **2. Collection Images** ✅

**Problem:** Collection images uploaded but not accessible.

**Solution:**
- Backend now serves static files
- Frontend can access images via `/media/collections/filename.jpg`
- Images are copied to both backend and frontend directories

---

### **3. Products Under 500 GHS** ✅

**Script Created:** `fix-collection-images-and-products.ts`

**What it does:**
- Checks all collections and their images
- Verifies "Wigs Under GH₵ 500" collection exists
- Finds all products with `priceGhs <= 500`
- Adds products to collection
- Shows summary

---

## 🎯 Step-by-Step Fix

### **On Render Shell:**

```bash
# Step 1: Fix collection images and products
npm run fix:collection-images

# Step 2: Verify setup
npm run setup:collections-reviews-social
```

---

## 📊 Expected Results

### **After Running Scripts:**

1. **Collection Images:**
   - ✅ Backend serves `/media/collections/` files
   - ✅ Images accessible on production
   - ✅ Frontend can display collection images

2. **Wigs Under GH₵ 500:**
   - ✅ Collection exists
   - ✅ Has products with `priceGhs <= 500`
   - ✅ Products properly assigned

3. **All Collections:**
   - ✅ Images display correctly
   - ✅ Product counts accurate
   - ✅ Links work

---

## 🔍 Troubleshooting

### **If Images Still Don't Show:**

1. **Check image paths in database:**
   ```bash
   # On Render Shell
   npx prisma studio
   # Check collections table, look at `image` field
   ```

2. **Verify files exist:**
   ```bash
   # Check if files exist
   ls -la uploads/media/collections/
   # Or
   ls -la ../frontend/public/media/collections/
   ```

3. **Check image URLs:**
   - Should be: `/media/collections/filename.jpg`
   - Or: `https://juelle-hair-backend.onrender.com/media/collections/filename.jpg`

4. **Upload new images via admin:**
   - Go to admin panel
   - Edit collection
   - Upload new image
   - Image will be saved and URL updated

---

## 📝 Admin Panel Usage

### **To Upload Collection Images:**

1. Go to: `/admin/collections`
2. Click "Edit" on a collection
3. Click "Upload Image" or drag & drop
4. Image will be saved to:
   - `backend/uploads/media/collections/`
   - `frontend/public/media/collections/`
5. URL will be: `/media/collections/filename.jpg`

---

## 🚀 Ready to Deploy!

**Run on Render Shell:**

```bash
npm run fix:collection-images
```

**Then test:**
- https://juelle-hair-web.onrender.com (check Shop by Collection)
- Images should display (not placeholders)
- "Wigs Under GH₵ 500" should have products

**Everything should be working!** 🎉
