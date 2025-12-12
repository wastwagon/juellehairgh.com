# Footer Pages Review & Implementation Plan

## Current Status Review

### ✅ Pages That Exist and Work

1. **Terms & Conditions** (`/terms`)
   - ✅ Page exists: `frontend/app/terms/page.tsx`
   - ✅ Component exists: `frontend/components/pages/terms-page.tsx`
   - ✅ Fetches from API: `/settings/terms`
   - ⚠️ Has fallback content (hardcoded HTML)
   - ❌ Not editable in admin

2. **Privacy Policy** (`/privacy`)
   - ✅ Page exists: `frontend/app/privacy/page.tsx`
   - ✅ Component exists: `frontend/components/pages/privacy-page.tsx`
   - ✅ Fetches from API: `/settings/privacy`
   - ⚠️ Has fallback content (hardcoded HTML)
   - ❌ Not editable in admin

3. **Shipping Policy** (`/shipping`)
   - ✅ Page exists: `frontend/app/shipping/page.tsx`
   - ✅ Component exists: `frontend/components/pages/shipping-page.tsx`
   - ⚠️ Uses site settings for contact info
   - ⚠️ Has hardcoded content (not from API)
   - ❌ Not editable in admin

4. **Return & Refund Policy** (`/returns`)
   - ✅ Page exists: `frontend/app/returns/page.tsx`
   - ✅ Component exists: `frontend/components/pages/returns-page.tsx`
   - ⚠️ Uses site settings for contact info
   - ⚠️ Has hardcoded content (not from API)
   - ❌ Not editable in admin

5. **FAQ** (`/faq`)
   - ✅ Page exists: `frontend/app/faq/page.tsx`
   - ✅ Component exists: `frontend/components/pages/faq-page.tsx`
   - ⚠️ Has hardcoded FAQ data array
   - ❌ Not editable in admin

6. **Contact Us** (`/contact`)
   - ✅ Page exists: `frontend/app/contact/page.tsx`
   - ✅ Component exists: `frontend/components/pages/contact-page.tsx`
   - ✅ Uses site settings for contact info
   - ✅ Has working contact form
   - ✅ Form submits to `/contact` API endpoint
   - ⚠️ Content is mostly static (not editable)

7. **About Us** (`/about`)
   - ✅ Page exists: `frontend/app/about/page.tsx`
   - ✅ Component exists: `frontend/components/pages/about-page.tsx`
   - ✅ Fetches from API: `/settings/about`
   - ⚠️ Has fallback content (hardcoded HTML)
   - ❌ Not editable in admin

### Footer Links Analysis

**Shop Section:**
- ✅ `/categories/lace-wigs` - Category page (exists)
- ✅ `/categories/braids` - Category page (exists)
- ✅ `/categories/ponytails` - Category page (exists)
- ✅ `/categories/clip-ins` - Category page (exists)
- ✅ `/categories/hair-growth-oils` - Category page (exists)

**Collections Section:**
- ✅ `/collections/new-arrivals` - Collection page (exists)
- ✅ `/collections/best-sellers` - Collection page (exists)
- ✅ `/collections/featured-products` - Collection page (exists)
- ✅ `/collections/protective-styles` - Collection page (exists)
- ✅ `/collections/trending` - Collection page (exists)

**Customer Service Section:**
- ✅ `/account/orders` - Order tracking (exists)
- ✅ `/shipping` - Shipping Policy (exists, needs admin editing)
- ✅ `/returns` - Return & Refund Policy (exists, needs admin editing)
- ✅ `/faq` - FAQ (exists, needs admin editing)
- ✅ `/contact` - Contact Us (exists, needs admin editing)

**Legal Section (Footer Bottom):**
- ✅ `/terms` - Terms of Service (exists, needs admin editing)
- ✅ `/privacy` - Privacy Policy (exists, needs admin editing)

## Backend Infrastructure

### ✅ Existing Settings System

- **Database Model:** `Setting` model in Prisma schema
  - Fields: `id`, `key` (unique), `value` (Text), `category`, `createdAt`, `updatedAt`
  
- **Backend API:**
  - `GET /settings/site` - Returns site settings (phone, email, social links)
  - `GET /settings/terms` - Returns terms content
  - `GET /settings/privacy` - Returns privacy content
  - `GET /settings/about` - Returns about content
  
- **Admin API:**
  - `PUT /admin/settings/:key` - Update single setting
  - `PUT /admin/settings` - Update multiple settings (bulk)

### ❌ Missing Features

1. **No Admin UI for Page Content Management**
   - No admin page to edit Terms, Privacy, FAQ, Shipping, Returns, About content
   - Current admin settings only handles site settings (email, phone, etc.)

2. **No Rich Text Editor**
   - Page content stored as HTML strings
   - No WYSIWYG editor for admins to edit content

3. **FAQ Not Stored in Database**
   - FAQ is hardcoded as an array in the component
   - Should be stored in database with question/answer pairs

4. **Shipping/Returns Pages Not Using API**
   - Content is hardcoded in components
   - Should fetch from settings API

## Implementation Plan

### Phase 1: Backend Enhancements

1. **Add Page Content Settings Keys**
   - Ensure these keys exist in database:
     - `TERMS_CONDITIONS` (already exists)
     - `PRIVACY_POLICY` (already exists)
     - `ABOUT_US` (already exists)
     - `SHIPPING_POLICY` (needs to be added)
     - `RETURNS_POLICY` (needs to be added)
     - `FAQ_CONTENT` (needs to be added - JSON format)

2. **Create FAQ Model (Optional Enhancement)**
   - Consider creating a `FAQ` model for better management:
     ```prisma
     model FAQ {
       id        String   @id @default(uuid())
       question  String
       answer    String   @db.Text
       order     Int      @default(0)
       isActive  Boolean  @default(true)
       createdAt DateTime @default(now())
       updatedAt DateTime @updatedAt
     }
     ```
   - Or keep as JSON in settings: `FAQ_CONTENT` = JSON array

3. **Add API Endpoints**
   - `GET /settings/shipping` - Returns shipping policy content
   - `GET /settings/returns` - Returns returns policy content
   - `GET /settings/faq` - Returns FAQ content (JSON or structured)

### Phase 2: Frontend Page Updates

1. **Update Shipping Page**
   - Fetch content from `/settings/shipping` API
   - Keep structure but make content editable

2. **Update Returns Page**
   - Fetch content from `/settings/returns` API
   - Keep structure but make content editable

3. **Update FAQ Page**
   - Fetch FAQ items from `/settings/faq` API
   - Support both JSON array format and structured FAQ model

### Phase 3: Admin UI for Content Management

1. **Create Admin Page Content Manager**
   - New admin page: `/admin/pages` or `/admin/content`
   - List all editable pages:
     - Terms & Conditions
     - Privacy Policy
     - About Us
     - Shipping Policy
     - Return & Refund Policy
     - FAQ

2. **Add Rich Text Editor**
   - Install and integrate a WYSIWYG editor (e.g., `react-quill`, `tiptap`, or `lexical`)
   - Allow HTML editing for Terms, Privacy, About, Shipping, Returns
   - For FAQ: Provide form to add/edit/delete FAQ items

3. **Content Preview**
   - Show preview of how content will appear on frontend
   - Live preview option

### Phase 4: Populate Default Content

1. **Create Seed Script or Migration**
   - Populate default content for all pages
   - Professional, comprehensive content for each page type

2. **Content Guidelines**
   - Terms & Conditions: Legal terms, user agreements
   - Privacy Policy: Data collection, usage, GDPR compliance
   - Shipping Policy: Delivery times, costs, areas
   - Return Policy: Return period, conditions, process
   - FAQ: Common questions with detailed answers
   - About Us: Company mission, values, story

## Recommended Tech Stack

### Rich Text Editor Options

1. **React Quill** (Recommended)
   - Easy to integrate
   - Good HTML output
   - Lightweight
   - `npm install react-quill`

2. **TipTap** (Modern Alternative)
   - More modern, extensible
   - Better for complex editing
   - `npm install @tiptap/react @tiptap/starter-kit`

3. **Lexical** (Facebook/Meta)
   - Most powerful but complex
   - Better for advanced use cases

### Implementation Priority

1. **High Priority:**
   - Admin UI for editing Terms, Privacy, About
   - Populate default content
   - Update Shipping/Returns to use API

2. **Medium Priority:**
   - FAQ management system
   - Rich text editor integration
   - Content preview

3. **Low Priority:**
   - FAQ database model (can use JSON for now)
   - Advanced content features

## Files to Create/Modify

### Backend
- `backend/src/settings/settings.controller.ts` - Add shipping/returns/faq endpoints
- `backend/src/settings/settings.service.ts` - Add methods for new page types
- `backend/prisma/migrations/` - Migration to add default content (if needed)

### Frontend
- `frontend/components/admin/admin-pages.tsx` - NEW: Admin page content manager
- `frontend/components/pages/shipping-page.tsx` - Update to fetch from API
- `frontend/components/pages/returns-page.tsx` - Update to fetch from API
- `frontend/components/pages/faq-page.tsx` - Update to fetch from API
- `frontend/app/admin/pages/page.tsx` - NEW: Admin route for page management
- `frontend/components/admin/admin-layout.tsx` - Add "Pages" navigation item

## Shop & Collections Footer Links

### Current Status

**Shop Section (Categories):**
- ✅ Links are hardcoded in footer component
- ✅ Pages exist: `/categories/[slug]` dynamic route
- ✅ Backend API: `GET /categories` and `GET /categories/:slug`
- ⚠️ Footer links are static, not dynamic from database
- ❌ Footer doesn't fetch categories from API

**Collections Section:**
- ✅ Links are hardcoded in footer component
- ✅ Pages exist: `/collections/[slug]` dynamic route
- ✅ Backend API: `GET /collections` and `GET /collections/:slug`
- ⚠️ Footer links are static, not dynamic from database
- ❌ Footer doesn't fetch collections from API

### Recommended Enhancement

**Make Footer Links Dynamic:**
1. Fetch categories from `/categories` API
2. Fetch collections from `/collections` API
3. Display top/popular categories in Shop section
4. Display active collections in Collections section
5. Allow admin to configure which categories/collections appear in footer

**Implementation:**
- Update `footer.tsx` to fetch categories and collections
- Filter/limit to show most relevant items
- Add fallback to hardcoded links if API fails
- Consider adding admin setting for "Footer Categories" and "Footer Collections"

## Next Steps

1. Review this plan with the user
2. Decide on rich text editor choice
3. Make footer Shop/Collections links dynamic
4. Implement backend API endpoints for page content
5. Create admin UI for content management
6. Populate default content
7. Test all pages and admin editing functionality

