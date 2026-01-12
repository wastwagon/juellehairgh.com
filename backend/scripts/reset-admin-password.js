#!/usr/bin/env node
/**
 * Reset Admin Password Script
 * 
 * Usage (in backend container terminal):
 *   node scripts/reset-admin-password.js <email> <new-password>
 * 
 * Example:
 *   node scripts/reset-admin-password.js admin@juellehairgh.com MyNewPassword123
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name || user.email} (${user.role})`);
    console.log(`🔒 Hashing new password...`);

    // Hash password with same salt rounds as backend (10)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`💾 Updating password in database...`);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password reset successfully!`);
    console.log(`📧 User: ${user.email}`);
    console.log(`👤 Name: ${user.name || 'N/A'}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`\n🎉 You can now login with the new password.`);

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('❌ Usage: node scripts/reset-admin-password.js <email> <new-password>');
  console.error('   Example: node scripts/reset-admin-password.js admin@juellehairgh.com MyNewPassword123');
  process.exit(1);
}

const [email, newPassword] = args;

if (newPassword.length < 6) {
  console.error('❌ Password must be at least 6 characters long.');
  process.exit(1);
}

resetPassword(email, newPassword);
