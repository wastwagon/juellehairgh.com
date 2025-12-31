import { PrismaClient } from "@prisma/client";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function diagnosePaymentIssues() {
  console.log("🔍 Payment System Diagnostic Tool\n");
  console.log("=" .repeat(60));
  
  // 1. Environment Variables Check
  console.log("\n1️⃣  Environment Variables Check:");
  console.log("-".repeat(60));
  const frontendUrl = process.env.FRONTEND_URL || "NOT SET";
  const paystackKey = process.env.PAYSTACK_SECRET_KEY || "NOT SET";
  const databaseUrl = process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET";
  const nodeEnv = process.env.NODE_ENV || "NOT SET";
  const port = process.env.PORT || "NOT SET";
  const jwtSecret = process.env.JWT_SECRET ? "SET (hidden)" : "NOT SET";
  
  console.log(`   FRONTEND_URL: ${frontendUrl}`);
  console.log(`   PAYSTACK_SECRET_KEY: ${paystackKey === "NOT SET" ? "❌ NOT SET" : paystackKey.startsWith("sk_") ? "✅ SET (starts with sk_)" : "⚠️ SET (unexpected format)"}`);
  console.log(`   DATABASE_URL: ${databaseUrl}`);
  console.log(`   NODE_ENV: ${nodeEnv}`);
  console.log(`   PORT: ${port}`);
  console.log(`   JWT_SECRET: ${jwtSecret}`);
  
  // Check for Paystack key in database
  try {
    const dbPaystackKey = await prisma.setting.findUnique({
      where: { key: "PAYSTACK_SECRET_KEY" },
    });
    if (dbPaystackKey?.value) {
      console.log(`   PAYSTACK_SECRET_KEY (DB): ✅ SET in database`);
    } else {
      console.log(`   PAYSTACK_SECRET_KEY (DB): ❌ NOT SET in database`);
    }
  } catch (error) {
    console.log(`   PAYSTACK_SECRET_KEY (DB): ⚠️ Could not check database`);
  }
  
  // 2. Database Connection Check
  console.log("\n2️⃣  Database Connection Check:");
  console.log("-".repeat(60));
  try {
    await prisma.$connect();
    console.log("   ✅ Database connection successful");
    
    // Check if orders table exists and has data
    const orderCount = await prisma.order.count();
    console.log(`   ✅ Orders table accessible (${orderCount} orders found)`);
    
    // Check if settings table exists
    const settingsCount = await prisma.setting.count();
    console.log(`   ✅ Settings table accessible (${settingsCount} settings found)`);
  } catch (error: any) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
    console.log(`   Error details: ${error.stack}`);
  }
  
  // 3. Backend Health Check
  console.log("\n3️⃣  Backend Health Check:");
  console.log("-".repeat(60));
  const backendUrl = process.env.RENDER_EXTERNAL_URL || 
                     process.env.BACKEND_URL || 
                     "http://localhost:3001";
  
  const healthEndpoints = [
    `${backendUrl}/health`,
    `${backendUrl}/api/health`,
    `${backendUrl}/`,
  ];
  
  for (const endpoint of healthEndpoints) {
    try {
      const response = await axios.get(endpoint, { timeout: 5000 });
      console.log(`   ✅ ${endpoint}: ${response.status} ${response.statusText}`);
      if (response.data) {
        console.log(`      Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.log(`   ❌ ${endpoint}: Connection refused (backend not running?)`);
      } else if (error.code === "ETIMEDOUT") {
        console.log(`   ⚠️  ${endpoint}: Timeout (backend slow or unreachable)`);
      } else {
        console.log(`   ❌ ${endpoint}: ${error.message}`);
      }
    }
  }
  
  // 4. CORS Configuration Check
  console.log("\n4️⃣  CORS Configuration Check:");
  console.log("-".repeat(60));
  const testOrigins = [
    frontendUrl,
    "https://juelle-hair-web.onrender.com",
    "https://juellehairgh.com",
    "https://www.juellehairgh.com",
  ].filter(Boolean);
  
  for (const origin of testOrigins) {
    try {
      const response = await axios.options(`${backendUrl}/api/payments/initialize`, {
        headers: {
          "Origin": origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type, Authorization",
        },
        timeout: 5000,
        validateStatus: () => true, // Don't throw on any status
      });
      
      const corsHeaders = {
        "access-control-allow-origin": response.headers["access-control-allow-origin"],
        "access-control-allow-methods": response.headers["access-control-allow-methods"],
        "access-control-allow-headers": response.headers["access-control-allow-headers"],
        "access-control-allow-credentials": response.headers["access-control-allow-credentials"],
      };
      
      if (corsHeaders["access-control-allow-origin"]) {
        console.log(`   ✅ ${origin}: CORS headers present`);
        console.log(`      Allow-Origin: ${corsHeaders["access-control-allow-origin"]}`);
      } else {
        console.log(`   ⚠️  ${origin}: CORS headers missing`);
      }
    } catch (error: any) {
      console.log(`   ❌ ${origin}: ${error.message}`);
    }
  }
  
  // 5. Paystack API Connection Check
  console.log("\n5️⃣  Paystack API Connection Check:");
  console.log("-".repeat(60));
  const activePaystackKey = process.env.PAYSTACK_SECRET_KEY;
  
  if (!activePaystackKey || !activePaystackKey.startsWith("sk_")) {
    console.log("   ⚠️  Paystack secret key not configured or invalid format");
  } else {
    try {
      const response = await axios.get("https://api.paystack.co/bank", {
        headers: {
          Authorization: `Bearer ${activePaystackKey}`,
        },
        timeout: 10000,
      });
      
      console.log(`   ✅ Paystack API connection successful`);
      console.log(`      Status: ${response.status}`);
      console.log(`      Banks endpoint working: Yes`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(`   ❌ Paystack API: Unauthorized (invalid secret key)`);
        console.log(`      Check your PAYSTACK_SECRET_KEY environment variable`);
      } else {
        console.log(`   ❌ Paystack API: ${error.message}`);
        if (error.response?.data?.message) {
          console.log(`      Error: ${error.response.data.message}`);
        }
      }
    }
  }
  
  // 6. Payment Initialization Test (Dry Run)
  console.log("\n6️⃣  Payment Initialization Test (Dry Run):");
  console.log("-".repeat(60));
  
  // First, check if we have a test order
  try {
    const testOrder = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    
    if (testOrder) {
      console.log(`   Found test order: ${testOrder.id}`);
      console.log(`   Order total: GHS ${testOrder.totalGhs}`);
      console.log(`   Payment status: ${testOrder.paymentStatus}`);
      
      // Try to call the payment initialization endpoint (this will fail without auth, but we can check the error)
      try {
        const response = await axios.post(
          `${backendUrl}/api/payments/initialize`,
          {
            orderId: testOrder.id,
            email: "test@example.com",
          },
          {
            timeout: 10000,
            validateStatus: () => true,
          }
        );
        
        if (response.status === 401) {
          console.log(`   ⚠️  Endpoint accessible but requires authentication (expected)`);
        } else if (response.status === 200 || response.status === 201) {
          console.log(`   ✅ Payment initialization endpoint working`);
        } else {
          console.log(`   ⚠️  Unexpected status: ${response.status}`);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log(`   ✅ Endpoint accessible (requires authentication - expected)`);
        } else if (error.response?.status === 400) {
          console.log(`   ⚠️  Endpoint accessible but returned 400: ${error.response?.data?.message || "Bad Request"}`);
        } else if (error.code === "ECONNREFUSED") {
          console.log(`   ❌ Backend not accessible: Connection refused`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    } else {
      console.log(`   ⚠️  No orders found in database (cannot test payment initialization)`);
    }
  } catch (error: any) {
    console.log(`   ❌ Could not test payment initialization: ${error.message}`);
  }
  
  // 7. Summary and Recommendations
  console.log("\n" + "=".repeat(60));
  console.log("📋 Summary and Recommendations:");
  console.log("=".repeat(60));
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (frontendUrl === "NOT SET") {
    issues.push("FRONTEND_URL not set");
    recommendations.push("Set FRONTEND_URL in Render backend environment variables");
  }
  
  if (paystackKey === "NOT SET" || !paystackKey.startsWith("sk_")) {
    issues.push("PAYSTACK_SECRET_KEY not set or invalid");
    recommendations.push("Set PAYSTACK_SECRET_KEY in Render backend environment variables (should start with 'sk_')");
  }
  
  if (databaseUrl === "NOT SET") {
    issues.push("DATABASE_URL not set");
    recommendations.push("Set DATABASE_URL in Render backend environment variables");
  }
  
  if (issues.length === 0) {
    console.log("   ✅ All critical environment variables are set");
  } else {
    console.log("   ⚠️  Issues found:");
    issues.forEach((issue, index) => {
      console.log(`      ${index + 1}. ${issue}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log("\n   💡 Recommendations:");
    recommendations.forEach((rec, index) => {
      console.log(`      ${index + 1}. ${rec}`);
    });
  }
  
  console.log("\n   🔧 Next Steps:");
  console.log("      1. Check Render backend logs for errors");
  console.log("      2. Verify all environment variables are set correctly");
  console.log("      3. Test backend health endpoint: curl https://your-backend.onrender.com/health");
  console.log("      4. Check frontend console for API errors");
  console.log("      5. Verify NEXT_PUBLIC_API_BASE_URL is set in frontend service");
  
  await prisma.$disconnect();
}

diagnosePaymentIssues()
  .then(() => {
    console.log("\n✅ Diagnostic complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Diagnostic failed:", error);
    process.exit(1);
  });

