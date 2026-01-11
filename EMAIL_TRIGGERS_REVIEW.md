# 📧 Email Triggers Review - Juelle Hair Ghana E-commerce Platform

## Overview
This document provides a comprehensive review of all email triggers in the website for both users and administrators.

---

## 👤 USER EMAIL TRIGGERS

### 1. **Welcome Email** (`sendWelcomeEmail`)
- **Trigger:** User registration/signup
- **Location:** `backend/src/auth/auth.service.ts` (line 61)
- **When:** Immediately after a new user successfully creates an account
- **Template:** `customer/welcome.hbs`
- **Recipient:** New user's email address
- **Content:** Welcome message, account information, shopping links

### 2. **Order Confirmation Email** (`sendOrderConfirmation`)
- **Trigger:** Order creation (when customer places an order)
- **Location:** `backend/src/orders/orders.service.ts` (line 193)
- **When:** Immediately after order is successfully created
- **Template:** `customer/order-confirmation.hbs`
- **Recipient:** Customer's email (from user account or shipping address)
- **Content:** Order details, items, totals, shipping address, billing address, payment status, order tracking link

### 3. **Payment Confirmation Email** (`sendPaymentConfirmation`)
- **Trigger:** Payment received via Paystack webhook
- **Location:** `backend/src/payments/payments.service.ts` (line 239)
- **When:** When payment is successfully processed and order status changes to PAID
- **Template:** `customer/payment-confirmation.hbs`
- **Recipient:** Customer's email
- **Content:** Payment confirmation, order number, amount paid, order link

### 4. **Order Shipped Email** (`sendOrderShipped`)
- **Trigger:** Admin updates order status to "SHIPPED"
- **Location:** `backend/src/orders/orders.service.ts` (line 361)
- **When:** When admin changes order status to SHIPPED (via admin panel)
- **Template:** `customer/order-shipped.hbs`
- **Recipient:** Customer's email
- **Content:** Shipping notification, tracking number, shipping method, order items, tracking link

### 5. **Order Delivered Email** (`sendOrderDelivered`)
- **Trigger:** Admin updates order status to "DELIVERED"
- **Location:** `backend/src/orders/orders.service.ts` (line 364)
- **When:** When admin changes order status to DELIVERED (via admin panel)
- **Template:** `customer/order-delivered.hbs`
- **Recipient:** Customer's email
- **Content:** Delivery confirmation, delivery date, order items, review link

### 6. **Order Cancelled Email** (`sendOrderCancelled`)
- **Trigger:** Order cancellation (by admin OR customer)
- **Location:** 
  - `backend/src/orders/orders.service.ts` (line 367 - admin cancellation)
  - `backend/src/orders/orders.service.ts` (line 439 - customer cancellation)
- **When:** 
  - When admin changes order status to CANCELLED
  - When customer cancels their own order
- **Template:** `customer/order-cancelled.hbs`
- **Recipient:** Customer's email
- **Content:** Cancellation notice, reason, refund information (if payment was made)

---

## 🔧 ADMIN EMAIL TRIGGERS

### 1. **New Customer Notification** (`sendAdminNewCustomer`)
- **Trigger:** New user registration
- **Location:** `backend/src/auth/auth.service.ts` (line 68)
- **When:** Immediately after a new user successfully creates an account
- **Template:** `admin/new-customer.hbs`
- **Recipient:** Admin email (configured in settings: `ADMIN_EMAIL`)
- **Content:** New customer details (name, email, registration date), link to admin users page

### 2. **New Order Notification** (`sendAdminNewOrder`)
- **Trigger:** Order creation
- **Location:** `backend/src/orders/orders.service.ts` (line 199)
- **When:** Immediately after order is successfully created
- **Template:** `admin/new-order.hbs`
- **Recipient:** Admin email (configured in settings: `ADMIN_EMAIL`)
- **Content:** Order summary, customer details, order items, totals, payment status, shipping/billing addresses, link to admin order page

### 3. **Payment Received Notification** (`sendAdminPaymentReceived`)
- **Trigger:** Payment received via Paystack webhook
- **Location:** `backend/src/payments/payments.service.ts` (line 246)
- **When:** When payment is successfully processed and order status changes to PAID
- **Template:** `admin/payment-received.hbs`
- **Recipient:** Admin email (configured in settings: `ADMIN_EMAIL`)
- **Content:** Payment details, order number, amount, transaction reference, customer info, link to admin order page

---

## 📋 SUMMARY TABLE

| Email Type | Recipient | Trigger Event | Service File |
|------------|-----------|---------------|--------------|
| Welcome | User | User Registration | `auth.service.ts` |
| Order Confirmation | User | Order Created | `orders.service.ts` |
| Payment Confirmation | User | Payment Received | `payments.service.ts` |
| Order Shipped | User | Order Status → SHIPPED | `orders.service.ts` |
| Order Delivered | User | Order Status → DELIVERED | `orders.service.ts` |
| Order Cancelled | User | Order Cancelled (admin/customer) | `orders.service.ts` |
| New Customer | Admin | User Registration | `auth.service.ts` |
| New Order | Admin | Order Created | `orders.service.ts` |
| Payment Received | Admin | Payment Received | `payments.service.ts` |

---

## ⚙️ TECHNICAL DETAILS

### Email Service Location
- **Main Service:** `backend/src/email/email.service.ts`
- **Module:** `backend/src/email/email.module.ts`
- **Templates:** `backend/src/email/templates/`

### Email Configuration
- **SMTP Settings:** Stored in database `settings` table
- **Admin Email:** Configured via `ADMIN_EMAIL` setting (defaults to environment variable)
- **From Email:** Configured via `EMAIL_FROM` setting
- **From Name:** Configured via `EMAIL_FROM_NAME` setting

### Error Handling
- All email sends are **non-blocking** (errors don't prevent the main operation)
- Email failures are logged but don't throw errors
- Email sending is asynchronous (uses `.catch()` for error handling)

### Email Templates
All templates use Handlebars and are located in:
- Customer templates: `backend/src/email/templates/customer/`
- Admin templates: `backend/src/email/templates/admin/`
- Shared partials: `backend/src/email/templates/partials/`

---

## 🔍 TRIGGER POINTS

### User Registration Flow
1. User fills registration form
2. `POST /api/auth/register` endpoint called
3. User account created in database
4. **Two emails sent:**
   - ✅ Welcome email to user
   - ✅ New customer notification to admin

### Order Placement Flow
1. User completes checkout
2. `POST /api/orders` endpoint called
3. Order created in database
4. **Two emails sent:**
   - ✅ Order confirmation email to user
   - ✅ New order notification to admin

### Payment Processing Flow
1. User pays via Paystack
2. Paystack webhook received at `POST /api/payments/webhook`
3. Payment verified and order status updated to PAID
4. **Two emails sent:**
   - ✅ Payment confirmation email to user
   - ✅ Payment received notification to admin

### Order Status Update Flow (Admin)
1. Admin updates order status in admin panel
2. `PUT /api/admin/orders/:id/status` endpoint called
3. Order status updated in database
4. **Email sent based on status:**
   - ✅ SHIPPED → Order shipped email to user
   - ✅ DELIVERED → Order delivered email to user
   - ✅ CANCELLED → Order cancelled email to user

### Order Cancellation Flow (Customer)
1. Customer cancels their order
2. `POST /api/orders/:id/cancel` endpoint called
3. Order status updated to CANCELLED
4. **Email sent:**
   - ✅ Order cancelled email to user

---

## 📊 EMAIL STATISTICS

**Total Email Types:** 9
- **User Emails:** 6
- **Admin Emails:** 3

**Total Trigger Points:** 6
- User Registration: 2 emails (user + admin)
- Order Creation: 2 emails (user + admin)
- Payment Received: 2 emails (user + admin)
- Order Shipped: 1 email (user)
- Order Delivered: 1 email (user)
- Order Cancelled: 1 email (user)

---

## ✅ VERIFICATION STATUS

All email triggers are properly implemented and use the configured SMTP settings. The email system is fully functional with:
- ✅ SMTP configuration working
- ✅ Template system working
- ✅ Error handling in place
- ✅ Non-blocking email sends
- ✅ All triggers active

