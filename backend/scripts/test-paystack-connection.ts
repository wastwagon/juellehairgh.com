/**
 * Test Paystack API connection and verify keys are working
 * 
 * Usage: ts-node backend/scripts/test-paystack-connection.ts
 */

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
dotenv.config();

const prisma = new PrismaClient();

async function testPaystackConnection() {
  console.log("🧪 Testing Paystack Configuration...\n");
  console.log("=".repeat(60));

  try {
    // 1. Get Paystack Secret Key from database
    const dbSetting = await prisma.setting.findUnique({
      where: { key: "PAYSTACK_SECRET_KEY" },
    });

    const secretKey = dbSetting?.value || process.env.PAYSTACK_SECRET_KEY || "";

    if (!secretKey) {
      console.error("❌ PAYSTACK_SECRET_KEY not found!");
      console.log("\n💡 Set it in:");
      console.log("   1. Admin Panel → Settings → Paystack Payment Settings");
      console.log("   2. Or environment variable: PAYSTACK_SECRET_KEY");
      return;
    }

    console.log("✅ Paystack Secret Key found");
    console.log(`   Key: ${secretKey.substring(0, 15)}...${secretKey.substring(secretKey.length - 5)}`);
    console.log(`   Type: ${secretKey.startsWith("sk_live_") ? "LIVE 🔴" : secretKey.startsWith("sk_test_") ? "TEST 🟡" : "UNKNOWN ⚠️"}`);
    console.log("");

    // 2. Test Paystack API connection
    console.log("📡 Testing Paystack API connection...");
    
    try {
      // Test with a simple API call - get banks list (doesn't require payment)
      const response = await axios.get("https://api.paystack.co/bank", {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        console.log("✅ Paystack API connection successful!");
        console.log(`   Status: ${response.status}`);
        console.log(`   Banks endpoint working: ${response.data.status ? "Yes" : "No"}`);
        console.log("");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error("❌ Paystack API Error: Invalid API Key");
        console.error("   The secret key is not valid or has been revoked.");
        console.error("   Please check your Paystack Dashboard: https://paystack.com/dashboard/settings/developer");
      } else if (error.response?.status === 403) {
        console.error("❌ Paystack API Error: Access Forbidden");
        console.error("   Your API key doesn't have permission for this endpoint.");
      } else {
        console.error("❌ Paystack API Error:", error.message);
        console.error("   Status:", error.response?.status);
        console.error("   Response:", error.response?.data?.message || "Unknown error");
      }
      return;
    }

    // 3. Test payment initialization (dry run - won't actually charge)
    console.log("💳 Testing payment initialization (dry run)...");
    
    try {
      const testResponse = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: "test@example.com",
          amount: 100, // 1 GHS in pesewas (minimum)
          currency: "GHS",
          reference: `TEST_${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (testResponse.status === 200 && testResponse.data.status) {
        console.log("✅ Payment initialization test successful!");
        console.log(`   Reference: ${testResponse.data.data.reference}`);
        console.log(`   Authorization URL: ${testResponse.data.data.authorization_url.substring(0, 50)}...`);
        console.log("");
        console.log("💡 Note: This was a test - no actual payment was processed.");
      }
    } catch (error: any) {
      console.error("❌ Payment initialization test failed:");
      console.error("   Error:", error.response?.data?.message || error.message);
      if (error.response?.status === 400) {
        console.error("   This might be due to invalid request format or API restrictions.");
      }
      return;
    }

    // 4. Summary
    console.log("=".repeat(60));
    console.log("📋 SUMMARY");
    console.log("=".repeat(60));
    console.log("✅ Paystack Secret Key: Configured");
    console.log("✅ API Connection: Working");
    console.log("✅ Payment Initialization: Working");
    console.log("");
    console.log("🎉 Paystack configuration is valid and ready for use!");
    console.log("");
    console.log("💡 Next Steps:");
    console.log("   1. Ensure FRONTEND_URL is set correctly in backend environment");
    console.log("   2. Test a real payment flow on your site");
    console.log("   3. Check Paystack Dashboard for transaction logs");

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    if (error.stack) {
      console.error("\nStack trace:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPaystackConnection()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

