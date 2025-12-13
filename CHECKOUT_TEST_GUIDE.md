# 🧪 Checkout Flow Testing Guide

## Overview
This guide helps you test the complete checkout flow with both Paystack and Wallet payment methods.

## Prerequisites
- ✅ Backend service running (`docker-compose up backend`)
- ✅ Frontend service running (`docker-compose up frontend`)
- ✅ Database connected and running
- ✅ Paystack keys configured (see `PAYSTACK_PRODUCTION_SETUP.md`)

## Test Scenarios

### Test 1: Paystack Payment (Logged In User)

**Steps:**
1. **Login:**
   - Go to `http://localhost:8002/login`
   - Login with test credentials

2. **Add Products to Cart:**
   - Browse products
   - Add products with variations (color, length)
   - Add products without variations
   - Go to cart: `http://localhost:8002/cart`

3. **Proceed to Checkout:**
   - Click "Proceed to Checkout"
   - URL: `http://localhost:8002/checkout`

4. **Fill Shipping Information:**
   - Enter shipping address
   - Select region (e.g., "Greater Accra")
   - Select shipping method
   - Verify shipping cost is calculated

5. **Select Payment Method:**
   - ✅ Should see "Paystack" option (always visible)
   - ✅ Should see "Wallet Balance" option (if logged in)
   - Select "Paystack"

6. **Review Order Summary:**
   - Verify subtotal
   - Verify shipping cost
   - Verify total amount
   - Check currency conversion (if not GHS)

7. **Submit Order:**
   - Click "Pay Securely with Paystack"
   - Should redirect to Paystack payment page
   - Use test card: `4084 0840 8408 4081` (CVV: 408, Expiry: any future date)

8. **Complete Payment:**
   - Complete payment on Paystack
   - Should redirect back to: `/checkout/thank-you?orderId={orderId}`
   - Verify order confirmation page shows order details

9. **Verify Order:**
   - Check order status in admin: `/admin/orders`
   - Order status should be: `PAID`
   - Payment status should be: `PAID`
   - Check email confirmation (if email service configured)

### Test 2: Wallet Payment (Logged In User with Sufficient Balance)

**Steps:**
1. **Ensure Wallet Balance:**
   - Go to account: `/account`
   - Top up wallet if needed
   - Ensure balance >= order total

2. **Add Products to Cart:**
   - Add products to cart
   - Go to checkout

3. **Fill Shipping Information:**
   - Enter shipping address
   - Select shipping method

4. **Select Payment Method:**
   - Select "Wallet Balance"
   - ✅ Should show wallet balance
   - ✅ Should show "✓ Sufficient balance available" if balance >= total
   - ✅ Should show "Insufficient balance" if balance < total

5. **Submit Order:**
   - Click "Pay with Wallet ({balance})"
   - Should immediately redirect to: `/checkout/thank-you?orderId={orderId}`
   - No Paystack redirect

6. **Verify Order:**
   - Check order status: Should be `PAID` immediately
   - Check wallet balance: Should be deducted
   - Check wallet transactions: Should show payment transaction

### Test 3: Wallet Payment (Insufficient Balance)

**Steps:**
1. **Ensure Low Wallet Balance:**
   - Wallet balance < order total

2. **Add Products to Cart:**
   - Add products totaling more than wallet balance

3. **Go to Checkout:**
   - Fill shipping information
   - Select "Wallet Balance"
   - ✅ Should show "Insufficient balance. Need {amount} more"
   - ✅ Wallet option should be disabled (grayed out)
   - ✅ Submit button should be disabled

4. **Switch to Paystack:**
   - Select "Paystack"
   - ✅ Submit button should be enabled
   - Complete checkout with Paystack

### Test 4: Guest Checkout (Not Logged In)

**Steps:**
1. **Logout:**
   - Ensure you're logged out

2. **Add Products to Cart:**
   - Add products
   - Go to checkout

3. **Check Payment Methods:**
   - ✅ Should see "Paystack" option
   - ❌ Should NOT see "Wallet Balance" option
   - ✅ Should see login prompt

4. **Login:**
   - Click "Login to checkout"
   - Login
   - Should return to checkout with saved addresses

5. **Complete Checkout:**
   - Fill shipping information
   - Select Paystack
   - Complete payment

### Test 5: Shipping Method Selection

**Steps:**
1. **Add Products to Cart:**
   - Go to checkout

2. **Enter Shipping Address:**
   - Enter address in "Greater Accra" region
   - ✅ Should see shipping methods for Greater Accra
   - ✅ Should show free shipping if order >= threshold

3. **Change Region:**
   - Change to different region (e.g., "Ashanti")
   - ✅ Should update shipping methods
   - ✅ Should recalculate shipping cost

4. **Select Shipping Method:**
   - Select different shipping method
   - ✅ Order total should update
   - ✅ Free shipping should show if applicable

### Test 6: Order with Variations

**Steps:**
1. **Add Variable Product:**
   - Add product with color and length variations
   - Select specific color and length
   - Add to cart

2. **Go to Checkout:**
   - ✅ Cart should show selected variations
   - ✅ Order summary should show correct variant details

3. **Complete Checkout:**
   - Select payment method
   - Complete order
   - ✅ Order should include variant information

## Expected Behaviors

### Payment Method Selection
- ✅ Paystack option always visible
- ✅ Wallet option only visible when logged in
- ✅ Wallet option disabled if insufficient balance
- ✅ Submit button disabled if wallet selected but insufficient balance

### Order Creation
- ✅ Order created with correct payment method
- ✅ Wallet payment: Order status = PAID immediately
- ✅ Paystack payment: Order status = AWAITING_PAYMENT
- ✅ Order includes shipping address
- ✅ Order includes billing address
- ✅ Order includes shipping method and cost

### Payment Processing
- ✅ Paystack: Redirects to Paystack, then back to thank you page
- ✅ Wallet: Immediate redirect to thank you page
- ✅ Cart cleared after successful order
- ✅ Order confirmation email sent (if configured)

### Error Handling
- ✅ Insufficient wallet balance: Clear error message
- ✅ Paystack API error: Clear error message
- ✅ Network error: User-friendly error message
- ✅ Invalid shipping address: Validation error

## Troubleshooting

### Issue: Wallet option not showing
**Solution:**
- Ensure user is logged in
- Check browser console for errors
- Verify wallet balance query is working

### Issue: Paystack redirect not working
**Solution:**
- Check Paystack keys are configured
- Verify backend `/payments/initialize` endpoint
- Check browser console for errors
- Verify `FRONTEND_URL` environment variable

### Issue: Order not updating after Paystack payment
**Solution:**
- Check webhook URL in Paystack dashboard
- Verify webhook endpoint: `/api/payments/callback`
- Check backend logs for webhook calls
- Manually verify payment: `/api/payments/verify/{reference}`

### Issue: Wallet payment not deducting
**Solution:**
- Check wallet balance before order
- Verify order creation includes `paymentMethod: "wallet"`
- Check backend logs for wallet deduction
- Verify wallet transaction was created

## Test Checklist

- [ ] Paystack payment flow (logged in)
- [ ] Paystack payment flow (guest)
- [ ] Wallet payment flow (sufficient balance)
- [ ] Wallet payment flow (insufficient balance)
- [ ] Payment method selection visibility
- [ ] Shipping method selection
- [ ] Order with variations
- [ ] Order confirmation email
- [ ] Cart clearing after order
- [ ] Error handling

## Quick Test Commands

```bash
# Check backend logs
docker-compose logs -f backend

# Check frontend logs
docker-compose logs -f frontend

# Test Paystack API connection
docker-compose exec backend npm run verify:paystack

# Check database orders
docker-compose exec backend npx prisma studio
```

---

**Ready to test!** 🚀

