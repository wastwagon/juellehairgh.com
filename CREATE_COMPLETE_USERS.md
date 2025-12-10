# 👥 Create Complete User Base - Guide

## ✅ Quick Create

**Run on Render Shell:**

```bash
npm run create:users
```

**This will create:**
- ✅ 2 Admin users
- ✅ 2 Manager users
- ✅ 3 Staff users
- ✅ 15 Diverse customer users (Ghanaian names)
- ✅ All with realistic data

---

## 📋 What Gets Created

### **1. Admin Users** 🔐
- `admin@juellehairgh.com` - Admin User
- `superadmin@juellehairgh.com` - Super Admin

**Password:** `password123`

---

### **2. Manager Users** 👔
- `manager@juellehairgh.com` - Kwame Mensah
- `operations@juellehairgh.com` - Ama Osei

**Password:** `password123`

---

### **3. Staff Users** 👨‍💼
- `staff1@juellehairgh.com` - Kofi Asante
- `staff2@juellehairgh.com` - Akosua Boateng
- `customer.service@juellehairgh.com` - Yaa Adjei

**Password:** `password123`

---

### **4. Customer Users** 👤
15 diverse customers with:
- ✅ Realistic Ghanaian names
- ✅ Various email providers (Gmail, Yahoo, Outlook)
- ✅ Ghana phone numbers (+233)
- ✅ Mix of verified/unverified emails
- ✅ Different email preferences

**Sample Customers:**
- Akosua Osei (akosua.osei@gmail.com)
- Kwame Asante (kwame.asante@yahoo.com)
- Ama Mensah (ama.mensah@gmail.com)
- Kofi Boateng (kofi.boateng@outlook.com)
- Yaa Adjei (yaa.adjei@gmail.com)
- And 10 more...

**Password:** `password123` (for all)

---

## 🚀 Run Script

### **On Render Shell:**

```bash
# You're in: ~/project/src/backend

# Create all users
npm run create:users
```

---

## 📊 Expected Output

```
👥 Creating Complete User Base...

🔐 Step 1: Creating Admin Users...
✅ Created admin: Admin User (admin@juellehairgh.com)
✅ Created admin: Super Admin (superadmin@juellehairgh.com)

👔 Step 2: Creating Manager Users...
✅ Created manager: Kwame Mensah (manager@juellehairgh.com)
✅ Created manager: Ama Osei (operations@juellehairgh.com)

👨‍💼 Step 3: Creating Staff Users...
✅ Created staff: Kofi Asante (staff1@juellehairgh.com)
✅ Created staff: Akosua Boateng (staff2@juellehairgh.com)
✅ Created staff: Yaa Adjei (customer.service@juellehairgh.com)

👤 Step 4: Creating Customer Users...
✅ Created customer: Akosua Osei (akosua.osei@gmail.com)
✅ Created customer: Kwame Asante (kwame.asante@yahoo.com)
... (more customers)

📊 Summary:
  Total Users: 22
  Admin Users: 2
  Manager Users: 2
  Staff Users: 3
  Customer Users: 15
  Verified: 20
  Unverified: 2

🎉 Complete user base created!

💡 Login Credentials:
   Admin: admin@juellehairgh.com / password123
   Manager: manager@juellehairgh.com / password123
   Staff: staff1@juellehairgh.com / password123
   Customer: akosua.osei@gmail.com / password123
```

---

## 🔐 Login Credentials

### **Admin Access:**
- Email: `admin@juellehairgh.com`
- Password: `password123`

### **Manager Access:**
- Email: `manager@juellehairgh.com`
- Password: `password123`

### **Staff Access:**
- Email: `staff1@juellehairgh.com`
- Password: `password123`

### **Customer Access:**
- Email: `akosua.osei@gmail.com`
- Password: `password123`

---

## ✅ After Running

**Verify users:**
```bash
npm run verify:users
```

**Should show:**
- ✅ Total Users: 22+
- ✅ Admin/Manager Users: 4
- ✅ Staff Users: 3
- ✅ Customer Users: 18+ (including existing 3)

---

## 🎯 Features

- ✅ **No Duplicates** - Checks if users exist before creating
- ✅ **Realistic Data** - Ghanaian names, phone numbers, emails
- ✅ **Email Preferences** - Mix of marketing/newsletter preferences
- ✅ **Verification Status** - Mix of verified/unverified
- ✅ **All Roles** - Admin, Manager, Staff, Customer

---

## 🚀 Ready to Create!

**Run on Render Shell:**

```bash
npm run create:users
```

**Then verify:**

```bash
npm run verify:users
```

**Your complete user base will be ready!** 🎉
