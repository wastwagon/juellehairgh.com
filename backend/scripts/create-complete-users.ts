import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create complete user base including:
 * - Admin users
 * - Manager users
 * - Staff users
 * - Diverse customer users with realistic Ghanaian data
 */
async function createCompleteUsers() {
  console.log("👥 Creating Complete User Base...\n");

  const bcrypt = require("bcrypt");
  const hashedPassword = await bcrypt.hash("password123", 10);

  try {
    // 1. Create Admin Users
    console.log("🔐 Step 1: Creating Admin Users...");
    const adminUsers = [
      {
        email: "admin@juellehairgh.com",
        password: hashedPassword,
        name: "Admin User",
        phone: "+233244123456",
        role: "ADMIN" as const,
        emailVerified: true,
        emailMarketing: false,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: false,
      },
      {
        email: "superadmin@juellehairgh.com",
        password: hashedPassword,
        name: "Super Admin",
        phone: "+233244123457",
        role: "ADMIN" as const,
        emailVerified: true,
        emailMarketing: false,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: false,
      },
    ];

    for (const userData of adminUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existing) {
        await prisma.user.create({ data: userData });
        console.log(`✅ Created admin: ${userData.name} (${userData.email})`);
      } else {
        console.log(`⏭️  Admin already exists: ${userData.email}`);
      }
    }

    // 2. Create Manager Users
    console.log("\n👔 Step 2: Creating Manager Users...");
    const managerUsers = [
      {
        email: "manager@juellehairgh.com",
        password: hashedPassword,
        name: "Kwame Mensah",
        phone: "+233244123458",
        role: "MANAGER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
      },
      {
        email: "operations@juellehairgh.com",
        password: hashedPassword,
        name: "Ama Osei",
        phone: "+233244123459",
        role: "MANAGER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
      },
    ];

    for (const userData of managerUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existing) {
        await prisma.user.create({ data: userData });
        console.log(`✅ Created manager: ${userData.name} (${userData.email})`);
      } else {
        console.log(`⏭️  Manager already exists: ${userData.email}`);
      }
    }

    // 3. Create Staff Users
    console.log("\n👨‍💼 Step 3: Creating Staff Users...");
    const staffUsers = [
      {
        email: "staff1@juellehairgh.com",
        password: hashedPassword,
        name: "Kofi Asante",
        phone: "+233244123460",
        role: "STAFF" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
      },
      {
        email: "staff2@juellehairgh.com",
        password: hashedPassword,
        name: "Akosua Boateng",
        phone: "+233244123461",
        role: "STAFF" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
      },
      {
        email: "customer.service@juellehairgh.com",
        password: hashedPassword,
        name: "Yaa Adjei",
        phone: "+233244123462",
        role: "STAFF" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
      },
    ];

    for (const userData of staffUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existing) {
        await prisma.user.create({ data: userData });
        console.log(`✅ Created staff: ${userData.name} (${userData.email})`);
      } else {
        console.log(`⏭️  Staff already exists: ${userData.email}`);
      }
    }

    // 4. Create Diverse Customer Users
    console.log("\n👤 Step 4: Creating Customer Users...");
    const customerUsers = [
      {
        email: "akosua.osei@gmail.com",
        password: hashedPassword,
        name: "Akosua Osei",
        phone: "+233541234567",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "kwame.asante@yahoo.com",
        password: hashedPassword,
        name: "Kwame Asante",
        phone: "+233541234568",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: false,
        displayCurrency: "GHS",
      },
      {
        email: "ama.mensah@gmail.com",
        password: hashedPassword,
        name: "Ama Mensah",
        phone: "+233541234569",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "kofi.boateng@outlook.com",
        password: hashedPassword,
        name: "Kofi Boateng",
        phone: "+233541234570",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: false,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "yaa.adjei@gmail.com",
        password: hashedPassword,
        name: "Yaa Adjei",
        phone: "+233541234571",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "nana.akoto@yahoo.com",
        password: hashedPassword,
        name: "Nana Akoto",
        phone: "+233541234572",
        role: "CUSTOMER" as const,
        emailVerified: false,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: false,
        displayCurrency: "GHS",
      },
      {
        email: "efua.darko@gmail.com",
        password: hashedPassword,
        name: "Efua Darko",
        phone: "+233541234573",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "kojo.appiah@outlook.com",
        password: hashedPassword,
        name: "Kojo Appiah",
        phone: "+233541234574",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: false,
        emailOrderUpdates: true,
        emailReviewReminders: false,
        emailNewsletter: false,
        displayCurrency: "GHS",
      },
      {
        email: "adwoa.owusu@gmail.com",
        password: hashedPassword,
        name: "Adwoa Owusu",
        phone: "+233541234575",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "kwabena.agyeman@yahoo.com",
        password: hashedPassword,
        name: "Kwabena Agyeman",
        phone: "+233541234576",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "maame.amponsah@gmail.com",
        password: hashedPassword,
        name: "Maame Amponsah",
        phone: "+233541234577",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "yaw.tetteh@outlook.com",
        password: hashedPassword,
        name: "Yaw Tetteh",
        phone: "+233541234578",
        role: "CUSTOMER" as const,
        emailVerified: false,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: false,
        displayCurrency: "GHS",
      },
      {
        email: "abena.quaye@gmail.com",
        password: hashedPassword,
        name: "Abena Quaye",
        phone: "+233541234579",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "fiifi.ansah@yahoo.com",
        password: hashedPassword,
        name: "Fiifi Ansah",
        phone: "+233541234580",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: false,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
      {
        email: "serwaa.ampofo@gmail.com",
        password: hashedPassword,
        name: "Serwaa Ampofo",
        phone: "+233541234581",
        role: "CUSTOMER" as const,
        emailVerified: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        displayCurrency: "GHS",
      },
    ];

    let createdCustomers = 0;
    let skippedCustomers = 0;

    for (const userData of customerUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existing) {
        await prisma.user.create({ data: userData });
        console.log(`✅ Created customer: ${userData.name} (${userData.email})`);
        createdCustomers++;
      } else {
        console.log(`⏭️  Customer already exists: ${userData.email}`);
        skippedCustomers++;
      }
    }

    // 5. Summary
    console.log("\n📊 Summary:");
    const stats = {
      totalUsers: await prisma.user.count(),
      admins: await prisma.user.count({ where: { role: "ADMIN" } }),
      managers: await prisma.user.count({ where: { role: "MANAGER" } }),
      staff: await prisma.user.count({ where: { role: "STAFF" } }),
      customers: await prisma.user.count({ where: { role: "CUSTOMER" } }),
      verified: await prisma.user.count({ where: { emailVerified: true } }),
      unverified: await prisma.user.count({ where: { emailVerified: false } }),
    };

    console.log(`  Total Users: ${stats.totalUsers}`);
    console.log(`  Admin Users: ${stats.admins}`);
    console.log(`  Manager Users: ${stats.managers}`);
    console.log(`  Staff Users: ${stats.staff}`);
    console.log(`  Customer Users: ${stats.customers}`);
    console.log(`  Verified: ${stats.verified}`);
    console.log(`  Unverified: ${stats.unverified}`);
    console.log(`\n  Created: ${createdCustomers} new customers`);
    console.log(`  Skipped: ${skippedCustomers} existing customers`);

    console.log("\n🎉 Complete user base created!");
    console.log("\n💡 Login Credentials:");
    console.log("   Admin: admin@juellehairgh.com / password123");
    console.log("   Manager: manager@juellehairgh.com / password123");
    console.log("   Staff: staff1@juellehairgh.com / password123");
    console.log("   Customer: akosua.osei@gmail.com / password123");
  } catch (error) {
    console.error("❌ Error creating users:", error);
    throw error;
  }
}

async function main() {
  try {
    await createCompleteUsers();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
