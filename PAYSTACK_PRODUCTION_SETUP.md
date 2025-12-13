# 🔐 Paystack Payment Gateway - Production Setup Guide

## 📋 Overview

This guide will help you configure Paystack payment gateway for live production on your e-commerce site.

## 🔑 Step 1: Get Your Paystack Live Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** → **Developer** → **API Keys & Webhooks**
3. Copy your **Live Secret Key** (starts with `sk_live_...`)
4. Copy your **Live Public Key** (starts with `pk_live_...`)

**Important:** Make sure you're copying **LIVE** keys, not test keys!

## 🌐 Step 2: Configure Webhook URL in Paystack Dashboard

1. In Paystack Dashboard → **Settings** → **Developer** → **Webhooks**
2. Click **"Add Webhook URL"** or edit existing webhook
3. Enter your webhook URL:
   ```
   https://juelle-hair-backend.onrender.com/api/payments/callback
   ```
4. Select events to listen for:
   - ✅ `charge.success` (Required)
   - ✅ `charge.failed` (Optional but recommended)
   - ✅ `transfer.success` (Optional)
   - ✅ `transfer.failed` (Optional)
5. Click **"Save"**

**Note:** The webhook URL must be publicly accessible. Render automatically exposes your backend service.

## ⚙️ Step 3: Configure Keys in Admin Dashboard (Recommended)

### Option A: Via Admin Dashboard (Easiest)

1. Go to your production admin: `https://juelle-hair-web.onrender.com/admin/settings`
2. Scroll to **"Paystack Payment Settings"** section
3. Enter your **Live Secret Key**: `sk_live_80c6d6b5e9c2a38a8e6e1427e641...`
4. Enter your **Live Public Key**: `pk_live_ddadd10dc94b2c2910d10f0fe0d78...`
5. Click **"Save Settings"**

**Benefits:**
- ✅ Keys stored securely in database
- ✅ Can be updated without redeploying
- ✅ Easy to switch between test/live keys

### Option B: Via Render Environment Variables

1. Go to Render Dashboard → Your Backend Service → **Environment** tab
2. Add/Update these environment variables:

```
PAYSTACK_SECRET_KEY=sk_live_80c6d6b5e9c2a38a8e6e1427e641...
```

**Note:** Public key is only needed if you're using Paystack's frontend SDK directly. Our implementation uses backend-only.

3. Click **"Save Changes"**
4. Render will automatically restart your service

## 🔍 Step 4: Verify Configuration

### Test Payment Flow:

1. **Create a Test Order:**
   - Go to your production site
   - Add products to cart
   - Proceed to checkout
   - Fill in shipping details
   - Select "Paystack" as payment method
   - Click "Pay Securely with Paystack"

2. **Check Payment Initialization:**
   - You should be redirected to Paystack payment page
   - Verify the amount is correct
   - Use Paystack test card: `4084 0840 8408 4081` (CVV: 408, Expiry: any future date)

3. **Complete Payment:**
   - Complete the payment on Paystack
   - You should be redirected back to your site
   - Order status should update to "PAID"

4. **Verify Webhook:**
   - Check Render backend logs for webhook callbacks
   - Order should be automatically updated when payment succeeds

## 🛠️ Step 5: Troubleshooting

### Issue: "Payment service is not configured"

**Solution:**
- Ensure `PAYSTACK_SECRET_KEY` is set in admin settings or environment variables
- Check that you're using **LIVE** keys, not test keys
- Restart backend service after setting environment variables

### Issue: "Invalid Paystack API key"

**Solution:**
- Verify the key starts with `sk_live_` (not `sk_test_`)
- Check for extra spaces or characters
- Ensure key is copied completely

### Issue: Webhook not receiving callbacks

**Solution:**
- Verify webhook URL is correct: `https://juelle-hair-backend.onrender.com/api/payments/callback`
- Check that webhook is enabled in Paystack dashboard
- Verify `charge.success` event is selected
- Check Render backend logs for incoming webhook requests
- Ensure backend service is publicly accessible

### Issue: Payment succeeds but order not updating

**Solution:**
- Check webhook endpoint is working: `POST /api/payments/callback`
- Verify webhook URL in Paystack dashboard matches your backend URL
- Check backend logs for webhook processing errors
- Manually verify payment using: `GET /api/payments/verify/{reference}`

## 📝 Current Configuration

Based on your Paystack dashboard:

- **Live Secret Key:** `sk_live_80c6d6b5e9c2a38a8e6e1427e641...`
- **Live Public Key:** `pk_live_ddadd10dc94b2c2910d10f0fe0d78...`
- **Webhook URL:** `https://juelle-hair-backend.onrender.com/api/payments/callback`

## 🔒 Security Best Practices

1. **Never commit keys to Git:**
   - Keys are stored in environment variables or database
   - `.env` files are in `.gitignore`

2. **Use Live Keys Only in Production:**
   - Test keys (`sk_test_`, `pk_test_`) should only be used in development
   - Live keys (`sk_live_`, `pk_live_`) should only be used in production

3. **Rotate Keys Periodically:**
   - Update keys in Paystack dashboard
   - Update in admin settings or environment variables
   - Old keys will stop working after rotation

4. **Monitor Webhook Logs:**
   - Regularly check backend logs for webhook activity
   - Set up alerts for failed payments

## ✅ Verification Checklist

- [ ] Live Secret Key configured in admin settings or environment variables
- [ ] Live Public Key configured in admin settings (if needed)
- [ ] Webhook URL set in Paystack dashboard: `https://juelle-hair-backend.onrender.com/api/payments/callback`
- [ ] `charge.success` event enabled in webhook settings
- [ ] Test payment completed successfully
- [ ] Order status updated to "PAID" after payment
- [ ] Payment confirmation email sent to customer
- [ ] Admin payment notification email received

## 🚀 Quick Setup Commands

### Set Keys via Admin Dashboard:
1. Go to: `https://juelle-hair-web.onrender.com/admin/settings`
2. Enter keys in "Paystack Payment Settings"
3. Click "Save Settings"

### Set Keys via Render Environment:
1. Go to Render Dashboard → Backend Service → Environment
2. Add: `PAYSTACK_SECRET_KEY=sk_live_...`
3. Save and wait for service restart

### Test Webhook Endpoint:
```bash
curl -X POST https://juelle-hair-backend.onrender.com/api/payments/callback \
  -H "Content-Type: application/json" \
  -d '{"event":"charge.success","data":{"reference":"test_ref"}}'
```

## 📞 Support

If you encounter issues:
1. Check Paystack Dashboard → **Settings** → **Developer** → **Webhooks** for webhook logs
2. Check Render backend logs for errors
3. Verify keys are correct in admin settings
4. Test with a small amount first

---

**Your Paystack is now configured for production!** 🎉

