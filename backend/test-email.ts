#!/usr/bin/env ts-node

/**
 * Test Email Configuration Script
 * 
 * This script tests the SMTP email configuration by sending a test email.
 * 
 * Usage:
 *   npm run test-email <recipient-email>
 *   or
 *   ts-node test-email.ts <recipient-email>
 */

import { PrismaClient } from '@prisma/client';
import * as nodemailer from 'nodemailer';

const prisma = new PrismaClient();

async function getSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting?.value || defaultValue;
  } catch (error) {
    console.warn(`Warning: Could not fetch ${key} from database, using default: ${defaultValue}`);
    return defaultValue;
  }
}

async function testEmail(toEmail: string) {
  try {
    console.log('📧 Testing Email Configuration...\n');

    // Get SMTP settings from database
    const emailProvider = await getSetting('EMAIL_PROVIDER', 'smtp');
    const smtpHost = await getSetting('SMTP_HOST', 'smtp.gmail.com');
    const smtpPort = parseInt(await getSetting('SMTP_PORT', '587'));
    const smtpUser = await getSetting('SMTP_USER', '');
    const smtpPassword = await getSetting('SMTP_PASSWORD', '');
    const emailFrom = await getSetting('EMAIL_FROM', 'noreply@juellehairgh.com');
    const emailFromName = await getSetting('EMAIL_FROM_NAME', 'Juelle Hair Ghana');
    const adminEmail = await getSetting('ADMIN_EMAIL', 'admin@juellehairgh.com');

    console.log('📋 Current Configuration:');
    console.log(`   Provider: ${emailProvider}`);
    console.log(`   SMTP Host: ${smtpHost}`);
    console.log(`   SMTP Port: ${smtpPort}`);
    console.log(`   SMTP User: ${smtpUser || '(not set)'}`);
    console.log(`   SMTP Password: ${smtpPassword ? '***' : '(not set)'}`);
    console.log(`   From Email: ${emailFrom}`);
    console.log(`   From Name: ${emailFromName}`);
    console.log(`   Admin Email: ${adminEmail}`);
    console.log(`   Test Recipient: ${toEmail}\n`);

    if (!smtpUser || !smtpPassword) {
      console.error('❌ Error: SMTP_USER and SMTP_PASSWORD must be configured!');
      console.log('   Please configure SMTP settings in the admin panel or database.\n');
      process.exit(1);
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log(`📤 Sending test email to ${toEmail}...`);
    const info = await transporter.sendMail({
      from: `"${emailFromName}" <${emailFrom}>`,
      to: toEmail,
      subject: 'Test Email from Juelle Hair Ghana',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your Juelle Hair Ghana e-commerce platform.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>SMTP Host: ${smtpHost}</li>
          <li>SMTP Port: ${smtpPort}</li>
          <li>From: ${emailFromName} &lt;${emailFrom}&gt;</li>
          <li>Admin Email: ${adminEmail}</li>
        </ul>
        <p>If you received this email, your SMTP configuration is working correctly! ✅</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated test email sent at ${new Date().toLocaleString()}</p>
      `,
      text: `
Test Email from Juelle Hair Ghana

This is a test email from your e-commerce platform.

Configuration Details:
- SMTP Host: ${smtpHost}
- SMTP Port: ${smtpPort}
- From: ${emailFromName} <${emailFrom}>
- Admin Email: ${adminEmail}

If you received this email, your SMTP configuration is working correctly!
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}\n`);
    console.log('📬 Please check your inbox (and spam folder) for the test email.\n');

  } catch (error: any) {
    console.error('❌ Error sending test email:');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'EAUTH') {
      console.error('💡 Authentication Error:');
      console.error('   - Check that SMTP_USER and SMTP_PASSWORD are correct');
      console.error('   - For Gmail, make sure you\'re using an App Password');
      console.error('   - Verify that your email account allows less secure apps\n');
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 Connection Error:');
      console.error('   - Check that SMTP_HOST is correct');
      console.error('   - Verify that SMTP_PORT is correct (587 for TLS, 465 for SSL)');
      console.error('   - Check your firewall/network settings\n');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get recipient email from command line arguments
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('❌ Error: Recipient email address is required!\n');
  console.log('Usage:');
  console.log('  npm run test-email <recipient-email>');
  console.log('  or');
  console.log('  ts-node test-email.ts <recipient-email>\n');
  console.log('Example:');
  console.log('  npm run test-email admin@gmail.com\n');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
  console.error(`❌ Error: "${recipientEmail}" is not a valid email address!\n`);
  process.exit(1);
}

testEmail(recipientEmail);
