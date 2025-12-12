# Seed Page Content

This script populates the database with professional default content for all public pages.

## What It Does

The script seeds the following page content:

1. **Terms & Conditions** (`TERMS_CONDITIONS`)
2. **Privacy Policy** (`PRIVACY_POLICY`)
3. **About Us** (`ABOUT_US`)
4. **Shipping Policy** (`SHIPPING_POLICY`)
5. **Return & Refund Policy** (`RETURNS_POLICY`)
6. **FAQ** (`FAQ_CONTENT`) - Stored as JSON array

## How to Run

### Local Development

```bash
cd backend
npm run seed:page-content
```

### Using ts-node directly

```bash
cd backend
npx ts-node scripts/seed-page-content.ts
```

### On Render (Backend Service)

1. Access your Render backend service shell
2. Navigate to the backend directory
3. Run:
   ```bash
   npm run seed:page-content
   ```

## What Happens

- The script uses `upsert` operations, so it's safe to run multiple times
- If content already exists, it will be updated
- If content doesn't exist, it will be created
- All content is stored in the `settings` table with category `"content"`

## Content Details

### Terms & Conditions
- Comprehensive legal terms
- Product information, pricing, shipping terms
- Return policy references
- Limitation of liability
- Contact information

### Privacy Policy
- Data collection practices
- How information is used
- Information sharing policies
- Data security measures
- User rights
- GDPR-compliant language

### About Us
- Company mission and values
- Our story
- What we offer
- Why choose us
- Contact information

### Shipping Policy
- Free shipping threshold (GHS 950)
- Standard and express shipping options
- Delivery areas and times
- Order processing information
- Tracking details

### Return & Refund Policy
- 14-day return period
- Return conditions
- Step-by-step return process
- Refund processing times
- Exchange policy

### FAQ
- 15 common questions and answers
- Payment methods
- Shipping information
- Returns and exchanges
- Product care
- Customer service

## After Seeding

1. **Verify Content:**
   - Visit `/admin/pages` in your admin panel
   - Check that all pages show content
   - Review the content to ensure it meets your needs

2. **Customize:**
   - Edit any page content through the admin panel
   - Update contact information if needed
   - Adjust policies to match your business practices

3. **Frontend Check:**
   - Visit `/terms`, `/privacy`, `/about`, `/shipping`, `/returns`, `/faq`
   - Verify content displays correctly
   - Check formatting and styling

## Notes

- All content is professional and comprehensive
- Contact information uses default values (can be updated in admin)
- Content follows best practices for e-commerce sites
- HTML formatting is included for proper display
- FAQ is stored as JSON for easy management

## Troubleshooting

**Error: Cannot find module**
- Make sure you're in the `backend` directory
- Run `npm install` if dependencies are missing

**Error: Database connection**
- Check your `.env` file has correct `DATABASE_URL`
- Ensure database is running and accessible

**Content not showing:**
- Check that the script ran successfully
- Verify settings exist in database: `SELECT * FROM settings WHERE category = 'content';`
- Clear frontend cache if needed

