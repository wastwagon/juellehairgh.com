# 👥 Verify Users Migration - Complete Guide

## ✅ Quick Verification

**Run on Render Shell:**

```bash
npm run verify:users
```

**This will show:**
- Total user count
- Users by role (CUSTOMER, STAFF, MANAGER, ADMIN)
- Email verification status
- Sample users
- Admin/Manager users
- Users with orders

---

## 📋 What the Script Checks

### **1. User Count** ✅
- Total number of users in database
- Warns if no users found

### **2. Users by Role** ✅
- Counts users by role:
  - CUSTOMER
  - STAFF
  - MANAGER
  - ADMIN

### **3. Email Verification** ✅
- Verified vs unverified users
- Shows verification status

### **4. Sample Users** ✅
- Shows first 10 users
- Displays: name, email, role, verification status, creation date

### **5. Admin/Manager Users** ✅
- Lists all admin and manager users
- Warns if none found

### **6. Users with Orders** ✅
- Counts users who have placed orders
- Shows engagement level

---

## 🚀 Run Verification

### **On Render Shell:**

```bash
# You're in: ~/project/src/backend

# Run verification
npm run verify:users
```

---

## 📊 Expected Output

### **If Users Exist:**
```
👥 Verifying Users Migration...

📊 Total Users: 15

📋 Users by Role:
   CUSTOMER: 12
   ADMIN: 2
   MANAGER: 1

📧 Email Verification Status:
   Verified: 10
   Unverified: 5

👤 Sample Users (first 10):
   1. John Doe (john@example.com)
      Role: CUSTOMER, Verified: Yes
      Created: 2025-01-15
   ...

🔐 Admin/Manager Users:
   1. Admin User (admin@example.com)
      Role: ADMIN, Verified: Yes

🛒 Users with Orders:
   5 users have placed orders

📊 Summary:
   ✅ Total Users: 15
   ✅ Admin/Manager Users: 3
   ✅ Verified Users: 10
   ✅ Users with Orders: 5

✅ Users migration verified - Users exist in database!
```

### **If No Users:**
```
👥 Verifying Users Migration...

📊 Total Users: 0

⚠️  No users found in database!
💡 Users need to be created manually or via registration.

⚠️  No users found - Users may need to be created.
```

---

## 🔧 Create Users (If Needed)

### **Option 1: Via Registration**
- Users can register at: `/auth/register`
- Or: `/register`

### **Option 2: Via Admin Panel**
- Admin can create users at: `/admin/users`
- Requires admin login

### **Option 3: Via Script**
- Create a seed script (if needed)
- Or use Prisma Studio: `npx prisma studio`

---

## 🎯 Next Steps

### **If Users Exist:**
✅ Users are migrated - everything is working!

### **If No Users:**
1. **Create Admin User:**
   - Register via frontend
   - Or create via admin panel (if you have access)
   - Or use Prisma Studio

2. **Verify Admin Access:**
   - Login with admin credentials
   - Check admin panel access

3. **Test User Registration:**
   - Test registration flow
   - Verify email verification works

---

## 🚀 Ready to Verify!

**Run on Render Shell:**

```bash
npm run verify:users
```

**This will tell you:**
- ✅ If users exist
- ✅ How many users
- ✅ User roles
- ✅ Admin users
- ✅ User activity

**Check the output to see if users were migrated!** 🎉
