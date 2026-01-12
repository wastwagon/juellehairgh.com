#!/usr/bin/env node
/**
 * List Admin Users Script
 * 
 * Usage (in backend container terminal):
 *   node scripts/list-admin-users.js
 * 
 * This script lists all admin and manager users in the database
 * so you can see what emails are available for password reset.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAdminUsers() {
  try {
    console.log('🔍 Finding admin users...\n');
    
    // Find all ADMIN and MANAGER users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER'],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin or manager users found.');
      console.log('\n📋 All users in database:');
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          name: true,
          role: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.name || 'N/A'}) - ${user.role}`);
      });
    } else {
      console.log(`✅ Found ${adminUsers.length} admin/manager user(s):\n`);
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt.toISOString().split('T')[0]}`);
        console.log('');
      });
      
      console.log('💡 To reset password, use:');
      console.log(`   node scripts/reset-admin-password.js ${adminUsers[0].email} YourNewPassword123`);
    }

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listAdminUsers();
