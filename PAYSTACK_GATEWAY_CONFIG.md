# 💳 Paystack Payment Gateway Server Configuration

## ✅ Current Configuration Status

**Test Results:** ✅ **ALL TESTS PASSED**

- ✅ Paystack Secret Key: Configured (LIVE)
- ✅ API Connection: Working
- ✅ Payment Initialization: Working

## 🔑 Keys Configuration

### Local Database (Admin Panel)
- **Secret Key (Backend):** `sk_live_80c6d6b5e9c2a38a8e6e1427e641e89e160e6c4d` ✅ LIVE
- **Public Key (Frontend):** `pk_live_ddadd10dc94b2c2910d10f0fe0d786768a099a06` ✅ LIVE

### Key Sources (Priority Order)
1. **Database Settings** (Admin Panel → Settings) - **Currently Active** ✅
2. Environment Variables (Fallback)

## 🌐 Payment Gateway Server URLs

### Paystack API
- **Base URL:** `https://api.paystack.co`
- **Transaction Initialize:** `POST https://api.paystack.co/transaction/initialize`
- **Transaction Verify:** `GET https://api.paystack.co/transaction/verify/{reference}`

### Your Backend Endpoints
- **Initialize Payment:** `POST https://juelle-hair-backend.onrender.com/api/payments/initialize`
- **Verify Payment:** `GET https://juelle-hair-backend.onrender.com/api/payments/verify/{reference}`
- **Webhook Callback:** `POST https://juelle-hair-backend.onrender.com/api/payments/callback`

### Frontend Redirect URLs
- **Payment Callback:** `https://juelle-hair-web.onrender.com/checkout/callback`
- **Order Confirmation:** `https://juelle-hair-web.onrender.com/checkout/thank-you?orderId={orderId}`

## 🔄 Payment Flow

```
1. User clicks "Pay Securely with Paystack"
   ↓
2. Frontend → Backend: POST /api/payments/initialize
   - Creates order with status: AWAITING_PAYMENT
   - Backend calls Paystack API
   ↓
3. Backend → Paystack: POST /transaction/initialize
   - Amount: Order total in pesewas (GHS * 100)
   - Currency: GHS
   - Callback URL: https://juelle-hair-web.onrender.com/checkout/callback
   ↓
4. User redirected to Paystack checkout page
   ↓
5. User completes payment on Paystack
   ↓
6. Paystack → Frontend: Redirect to /checkout/callback?reference={ref}
   ↓
7. Frontend → Backend: GET /api/payments/verify/{reference}
   - Backend verifies payment with Paystack
   - Updates order status: AWAITING_PAYMENT → PAID
   - Sends confirmation emails
   ↓
8. Frontend → Order Confirmation: /checkout/thank-you?orderId={orderId}
```

## 🔔 Webhook Configuration (Optional but Recommended)

**Webhook URL:** `https://juelle-hair-backend.onrender.com/api/payments/callback`

**Setup in Paystack Dashboard:**
1. Go to: https://paystack.com/dashboard/settings/developer
2. Click "Webhooks"
3. Add webhook URL: `https://juelle-hair-backend.onrender.com/api/payments/callback`
4. Enable event: `charge.success`
5. Save

**Why Webhooks?**
- Ensures payment verification even if user closes browser
- More reliable than redirect-only verification
- Handles edge cases better

## ⚙️ Backend Configuration

### Environment Variables (Render Backend Service)
```bash
# Required
PAYSTACK_SECRET_KEY=sk_live_80c6d6b5e9c2a38a8e6e1427e641e89e160e6c4d
FRONTEND_URL=https://juelle-hair-web.onrender.com

# Optional (if not using database settings)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_ddadd10dc94b2c2910d10f0fe0d786768a099a06
```

### Database Settings (Currently Active)
- `PAYSTACK_SECRET_KEY` - Stored in `settings` table
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - Stored in `settings` table

**Note:** Database settings take priority over environment variables.

## 🧪 Testing

### Test Payment Initialization
```bash
# Local test
docker compose exec backend npx ts-node scripts/test-paystack-connection.ts
```

### Test Results
✅ Secret Key: Configured  
✅ API Connection: Working  
✅ Payment Initialization: Working  

## 🔒 Security Notes

1. **Secret Key:** Never expose in frontend code
2. **Public Key:** Safe to use in frontend (already public)
3. **Webhook Verification:** Consider adding signature verification (future enhancement)
4. **HTTPS Only:** All URLs use HTTPS ✅

## 📋 Checklist for Production

- [x] Paystack Secret Key configured (LIVE)
- [x] Paystack Public Key configured (LIVE)
- [x] Backend API endpoints working
- [x] Frontend callback page working
- [x] Order confirmation page working
- [ ] Webhook configured in Paystack Dashboard (Optional but recommended)
- [ ] Test real payment flow end-to-end
- [ ] Monitor Paystack Dashboard for transactions

## 🐛 Troubleshooting

**If payments fail:**
1. Check backend logs for Paystack API errors
2. Verify secret key is correct in Paystack Dashboard
3. Check FRONTEND_URL is set correctly
4. Verify CORS is allowing requests
5. Check Paystack Dashboard → Transactions for failed attempts

**Common Issues:**
- **Invalid API Key:** Check secret key in admin settings
- **CORS Error:** Already fixed - clear browser cache
- **Payment Not Verified:** Check webhook/callback URL is accessible
- **Order Not Updated:** Check backend logs for verification errors

## 📞 Support

- **Paystack Support:** https://paystack.com/support
- **Paystack Dashboard:** https://paystack.com/dashboard
- **API Documentation:** https://paystack.com/docs/api

