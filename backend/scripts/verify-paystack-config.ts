/**
 * Verify Paystack configuration for production
 * 
 * Usage:
 *   ts-node backend/scripts/verify-paystack-config.ts
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
import axios from "axios";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function verifyPaystackConfig() {
  console.log("🔍 Verifying Paystack Configuration...\n");

  try {
    await prisma.$connect();
    console.log("✅ Connected to database\n");

    // Check database settings
    console.log("📊 Checking Database Settings:\n");
    const dbSecretKey = await prisma.setting.findUnique({
      where: { key: "PAYSTACK_SECRET_KEY" },
    });
    const dbPublicKey = await prisma.setting.findUnique({
      where: { key: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY" },
    });

    if (dbSecretKey?.value) {
      const keyPreview = dbSecretKey.value.substring(0, 15) + "...";
      const keyType = dbSecretKey.value.startsWith("sk_live_") ? "LIVE ✅" : 
                     dbSecretKey.value.startsWith("sk_test_") ? "TEST ⚠️" : "UNKNOWN ❌";
      console.log(`   Secret Key: ${keyPreview} (${keyType})`);
    } else {
      console.log(`   Secret Key: ❌ Not set in database`);
    }

    if (dbPublicKey?.value) {
      const keyPreview = dbPublicKey.value.substring(0, 15) + "...";
      const keyType = dbPublicKey.value.startsWith("pk_live_") ? "LIVE ✅" : 
                     dbPublicKey.value.startsWith("pk_test_") ? "TEST ⚠️" : "UNKNOWN ❌";
      console.log(`   Public Key: ${keyPreview} (${keyType})`);
    } else {
      console.log(`   Public Key: ⚠️  Not set in database (optional)`);
    }

    // Check environment variables
    console.log("\n📊 Checking Environment Variables:\n");
    const envSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const envPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (envSecretKey) {
      const keyPreview = envSecretKey.substring(0, 15) + "...";
      const keyType = envSecretKey.startsWith("sk_live_") ? "LIVE ✅" : 
                     envSecretKey.startsWith("sk_test_") ? "TEST ⚠️" : "UNKNOWN ❌";
      console.log(`   PAYSTACK_SECRET_KEY: ${keyPreview} (${keyType})`);
    } else {
      console.log(`   PAYSTACK_SECRET_KEY: ❌ Not set in environment`);
    }

    if (envPublicKey) {
      const keyPreview = envPublicKey.substring(0, 15) + "...";
      const keyType = envPublicKey.startsWith("pk_live_") ? "LIVE ✅" : 
                     envPublicKey.startsWith("pk_test_") ? "TEST ⚠️" : "UNKNOWN ❌";
      console.log(`   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: ${keyPreview} (${keyType})`);
    } else {
      console.log(`   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: ⚠️  Not set in environment (optional)`);
    }

    // Determine which key will be used
    const activeSecretKey = dbSecretKey?.value || envSecretKey;
    console.log("\n🔑 Active Configuration:\n");
    if (activeSecretKey) {
      const keyPreview = activeSecretKey.substring(0, 15) + "...";
      const keyType = activeSecretKey.startsWith("sk_live_") ? "LIVE ✅" : 
                     activeSecretKey.startsWith("sk_test_") ? "TEST ⚠️" : "UNKNOWN ❌";
      const source = dbSecretKey?.value ? "Database" : "Environment";
      console.log(`   Using Secret Key: ${keyPreview} (${keyType}) from ${source}`);
    } else {
      console.log(`   ❌ No secret key configured!`);
      console.log(`   💡 Set PAYSTACK_SECRET_KEY in admin settings or environment variables`);
    }

    // Test API connection (if key is available)
    if (activeSecretKey && activeSecretKey.startsWith("sk_")) {
      console.log("\n🧪 Testing Paystack API Connection:\n");
      try {
        const response = await axios.get("https://api.paystack.co/bank", {
          headers: {
            Authorization: `Bearer ${activeSecretKey}`,
          },
        });
        console.log(`   ✅ API Connection: SUCCESS`);
        console.log(`   📊 Response Status: ${response.status}`);
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log(`   ❌ API Connection: FAILED (Invalid API Key)`);
          console.log(`   💡 Check that your secret key is correct`);
        } else {
          console.log(`   ⚠️  API Connection: ${error.response?.status || "Unknown error"}`);
        }
      }
    }

    // Webhook URL
    const frontendUrl = process.env.FRONTEND_URL || "https://juelle-hair-web.onrender.com";
    const backendUrl = process.env.RENDER_EXTERNAL_URL || "https://juelle-hair-backend.onrender.com";
    const webhookUrl = `${backendUrl}/api/payments/callback`;

    console.log("\n🌐 Webhook Configuration:\n");
    console.log(`   Webhook URL: ${webhookUrl}`);
    console.log(`   💡 Set this URL in Paystack Dashboard → Settings → Developer → Webhooks`);
    console.log(`   💡 Enable event: charge.success`);

    // Summary
    console.log("\n📋 Configuration Summary:\n");
    if (activeSecretKey) {
      const isLive = activeSecretKey.startsWith("sk_live_");
      if (isLive) {
        console.log(`   ✅ Paystack is configured for PRODUCTION`);
        console.log(`   ✅ Using LIVE keys`);
      } else {
        console.log(`   ⚠️  Paystack is configured for TESTING`);
        console.log(`   ⚠️  Using TEST keys - switch to LIVE keys for production!`);
      }
    } else {
      console.log(`   ❌ Paystack is NOT configured`);
      console.log(`   💡 Configure keys in admin settings or environment variables`);
    }

    console.log("\n✅ Verification complete!\n");

  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPaystackConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

