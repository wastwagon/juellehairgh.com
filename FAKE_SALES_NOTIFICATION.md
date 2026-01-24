# Fake Sales Notification Implementation

## Overview
A "fake sales pop-up notification" component that displays at the bottom-left corner of the website, showing random products from your inventory with simulated purchase timestamps.

## Features

### ✅ Safe Implementation
- **Non-intrusive**: Only appears after 3 seconds delay
- **Dismissible**: Users can close it permanently (stored in localStorage)
- **Smart hiding**: Automatically hidden on admin, checkout, cart, and account pages
- **Error handling**: Gracefully handles API failures and missing images
- **Performance**: Caches products for 5 minutes, doesn't refetch on window focus

### 🎨 Design
- Matches your website's design system
- Responsive (mobile and desktop)
- Smooth animations
- Positioned at bottom-left (doesn't conflict with WhatsApp button on bottom-right)

### 🔄 Dynamic Content
- Fetches real products from your API
- Only shows in-stock products
- Rotates to different products every 8-15 seconds
- Random timestamps (5 minutes to 2 hours ago)
- Shows product image, title, price, and "View Product" link

## Files Created/Modified

### New Files
- `frontend/components/layout/fake-sales-notification.tsx` - Main component

### Modified Files
- `frontend/app/layout.tsx` - Added component to root layout

## How It Works

1. **Initial Load**: Component checks if user dismissed it before (localStorage)
2. **Page Check**: Hides on admin/checkout/cart/account pages
3. **Delay**: Shows notification after 3 seconds
4. **Product Fetch**: Fetches up to 50 active, in-stock products
5. **Random Selection**: Picks a random product and generates fake timestamp
6. **Rotation**: Changes to a new product every 8-15 seconds
7. **Dismissal**: User can close permanently (saved in localStorage)

## Safety Features

### ✅ Won't Break Your Site
- Uses React Query for safe data fetching
- Error boundaries prevent crashes
- Fallback images if product image fails to load
- Only renders if products are available
- No impact on existing functionality

### ✅ Performance Optimized
- Caches products for 5 minutes
- Doesn't refetch on window focus
- Lightweight component (~5KB)
- Only loads when visible

### ✅ User Experience
- Non-intrusive (3 second delay)
- Can be dismissed permanently
- Doesn't show on important pages (checkout, cart)
- Smooth animations
- Mobile-friendly

## Configuration

### Customization Options

You can modify these values in `fake-sales-notification.tsx`:

```typescript
// Delay before showing (line ~45)
setTimeout(() => setIsVisible(true), 3000); // Change 3000 to your preferred delay

// Product rotation interval (line ~80)
Math.floor(Math.random() * 7000) + 8000 // 8-15 seconds (adjust as needed)

// Number of products to fetch (line ~50)
api.get("/products?limit=50&isActive=true") // Change 50 to fetch more/fewer products

// Time range for fake timestamps (line ~12)
const minutes = Math.floor(Math.random() * 115) + 5; // 5-120 minutes (adjust range)
```

### Hide on Specific Pages

Add paths to the `hideOnPaths` array (line ~38):

```typescript
const hideOnPaths = ["/admin", "/checkout", "/cart", "/account", "/your-page"];
```

## Testing

### Before Deploying
1. Test locally: `npm run dev`
2. Verify it appears on homepage
3. Check it hides on admin/checkout pages
4. Test dismissal and localStorage persistence
5. Verify product images load correctly
6. Test on mobile devices

### After Deploying
1. Monitor for any console errors
2. Check product rotation works
3. Verify it doesn't interfere with other components
4. Test dismissal functionality

## Disabling the Feature

### Option 1: Remove from Layout
Remove `<FakeSalesNotification />` from `frontend/app/layout.tsx`

### Option 2: Feature Flag (Recommended)
Add environment variable check:

```typescript
// In fake-sales-notification.tsx
const isEnabled = process.env.NEXT_PUBLIC_ENABLE_SALES_NOTIFICATION === "true";

if (!isEnabled) {
  return null;
}
```

Then set `NEXT_PUBLIC_ENABLE_SALES_NOTIFICATION=true` in your environment variables.

## Troubleshooting

### Notification Not Showing
- Check browser console for errors
- Verify products API is working: `/api/products?limit=50`
- Check localStorage: `localStorage.getItem("fakeSalesNotificationDismissed")`
- Ensure you're not on admin/checkout/cart pages

### Products Not Loading
- Check API endpoint is accessible
- Verify products have images and are in stock
- Check network tab for API errors

### Image Not Loading
- Verify product image URLs are correct
- Check image paths match your media structure
- Component has fallback for missing images

## Future Enhancements

Potential improvements:
- Admin toggle to enable/disable
- Customizable time ranges
- Show only specific product categories
- Analytics tracking for clicks
- A/B testing different messages

---

**Status**: ✅ Ready for deployment
**Risk Level**: Low (isolated component, error handling, no breaking changes)
**Impact**: Positive (social proof, increased engagement)
