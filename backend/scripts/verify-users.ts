import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Verify if users were migrated to the database
 * Shows user count, roles, and sample users
 */
async function verifyUsers() {
  console.log("👥 Verifying Users Migration...\n");

  try {
    // 1. Count total users
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total Users: ${totalUsers}`);

    if (totalUsers === 0) {
      console.log("\n⚠️  No users found in database!");
      console.log("💡 Users need to be created manually or via registration.");
      return;
    }

    // 2. Count by role
    console.log("\n📋 Users by Role:");
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    for (const group of usersByRole) {
      console.log(`   ${group.role}: ${group._count.role}`);
    }

    // 3. Count verified vs unverified
    const verifiedUsers = await prisma.user.count({
      where: { emailVerified: true },
    });
    const unverifiedUsers = await prisma.user.count({
      where: { emailVerified: false },
    });

    console.log("\n📧 Email Verification Status:");
    console.log(`   Verified: ${verifiedUsers}`);
    console.log(`   Unverified: ${unverifiedUsers}`);

    // 4. Show sample users (first 10)
    console.log("\n👤 Sample Users (first 10):");
    const sampleUsers = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (sampleUsers.length === 0) {
      console.log("   No users found");
    } else {
      sampleUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name || "No name"} (${user.email})`);
        console.log(`      Role: ${user.role}, Verified: ${user.emailVerified ? "Yes" : "No"}`);
        console.log(`      Created: ${user.createdAt.toISOString().split("T")[0]}`);
      });
    }

    // 5. Check for admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "MANAGER"],
        },
      },
      select: {
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
    });

    console.log("\n🔐 Admin/Manager Users:");
    if (adminUsers.length === 0) {
      console.log("   ⚠️  No admin or manager users found!");
      console.log("   💡 You may need to create an admin user manually.");
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name || "No name"} (${user.email})`);
        console.log(`      Role: ${user.role}, Verified: ${user.emailVerified ? "Yes" : "No"}`);
      });
    }

    // 6. Check users with orders
    const usersWithOrders = await prisma.user.count({
      where: {
        orders: {
          some: {},
        },
      },
    });

    console.log("\n🛒 Users with Orders:");
    console.log(`   ${usersWithOrders} users have placed orders`);

    // 7. Summary
    console.log("\n📊 Summary:");
    console.log(`   ✅ Total Users: ${totalUsers}`);
    console.log(`   ✅ Admin/Manager Users: ${adminUsers.length}`);
    console.log(`   ✅ Verified Users: ${verifiedUsers}`);
    console.log(`   ✅ Users with Orders: ${usersWithOrders}`);

    if (totalUsers > 0) {
      console.log("\n✅ Users migration verified - Users exist in database!");
    } else {
      console.log("\n⚠️  No users found - Users may need to be created.");
    }
  } catch (error) {
    console.error("❌ Error verifying users:", error);
    throw error;
  }
}

async function main() {
  try {
    await verifyUsers();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
