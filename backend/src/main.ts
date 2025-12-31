import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as fs from "fs";
import * as path from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS - allow all origins in development, specific origins in production
  // Build allowed origins list - include both explicit and from env
  const allowedOriginsList = [
    "https://juelle-hair-web.onrender.com",
    "https://juellehairgh.com",
    "https://www.juellehairgh.com",
    "http://localhost:8002",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ].filter(Boolean); // Remove undefined values
  
  // Determine if we're in production (check multiple indicators)
  const isProduction = process.env.NODE_ENV === "production" || 
                       process.env.RENDER === "true" ||
                       process.env.PORT !== undefined;
  
  console.log(`🌐 CORS Configuration:`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Is Production: ${isProduction}`);
  console.log(`   Allowed Origins: ${allowedOriginsList.join(", ")}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || "not set"}`);
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log("✅ CORS: Allowing request with no origin");
        return callback(null, true);
      }
      
      // In development, allow all origins
      if (!isProduction) {
        console.log(`✅ CORS: Development mode - allowing origin: ${origin}`);
        return callback(null, true);
      }
      
      // In production, check against allowed origins
      const isAllowed = allowedOriginsList.some(allowedOrigin => {
        // Exact match
        if (origin === allowedOrigin) {
          console.log(`✅ CORS: Exact match for origin: ${origin}`);
          return true;
        }
        // Check if origin matches any allowed origin (subdomain matching)
        if (allowedOrigin && origin.includes(allowedOrigin.replace("https://", "").replace("http://", ""))) {
          console.log(`✅ CORS: Subdomain match for origin: ${origin} (allowed: ${allowedOrigin})`);
          return true;
        }
        // Wildcard subdomain match (e.g., *.onrender.com)
        if (allowedOrigin && allowedOrigin.includes("*")) {
          const pattern = allowedOrigin.replace("*", ".*");
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(origin)) {
            console.log(`✅ CORS: Wildcard match for origin: ${origin}`);
            return true;
          }
        }
        return false;
      });
      
      if (isAllowed) {
        return callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        console.warn(`   Allowed origins: ${allowedOriginsList.join(", ")}`);
        // In production, be strict - block the request
        return callback(new Error(`Not allowed by CORS: ${origin}`), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Register health endpoint BEFORE global prefix (for Render health checks)
  // This endpoint must be outside the /api prefix
  // Register directly on Express instance to bypass NestJS routing
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  
  // Read version info from build file
  let buildVersion = "unknown";
  let buildDate = "unknown";
  try {
    const versionFile = path.join(process.cwd(), ".version");
    if (fs.existsSync(versionFile)) {
      const versionContent = fs.readFileSync(versionFile, "utf-8");
      versionContent.split("\n").forEach((line: string) => {
        if (line.startsWith("BUILD_VERSION=")) {
          buildVersion = line.split("=")[1] || "unknown";
        }
        if (line.startsWith("BUILD_DATE=")) {
          buildDate = line.split("=")[1] || "unknown";
        }
      });
    }
  } catch (error) {
    console.warn("⚠️ Could not read version file:", error);
  }

  // Register health endpoint - must be before setGlobalPrefix
  // This endpoint MUST respond immediately without any database or external calls
  instance.get("/health", (req: any, res: any) => {
    // Respond immediately - no logging, no database calls, no delays
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "juelle-hair-backend",
      version: buildVersion,
    });
  });
  
  // Register root endpoint for Render health checks (some Render configs check /)
  instance.get("/", (req: any, res: any) => {
    // Respond immediately
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "juelle-hair-backend",
      message: "API is running",
      version: buildVersion,
    });
  });

  // Register version endpoint
  instance.get("/version", (req: any, res: any) => {
    res.status(200).json({
      version: buildVersion,
      buildDate: buildDate,
      timestamp: new Date().toISOString(),
      service: "juelle-hair-backend",
      environment: process.env.NODE_ENV || "development",
    });
  });
  
  console.log("✅ Health endpoint registered at /health and / (Express instance, before global prefix)");

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Serve static files for media (collections, products, etc.)
  // This allows frontend to access images via /media/collections/ etc.
  // Try multiple paths to find media directory
  const possibleMediaPaths = [
    path.join(process.cwd(), "uploads", "media"), // Production backend uploads
    path.join(process.cwd(), "..", "frontend", "public", "media"), // Development frontend public
    path.join(process.cwd(), "frontend", "public", "media"), // Alternative path
  ];

  let mediaServed = false;
  for (const mediaPath of possibleMediaPaths) {
    if (fs.existsSync(mediaPath)) {
      app.useStaticAssets(mediaPath, {
        prefix: "/media",
      });
      console.log(`✅ Static media files served from: ${mediaPath}`);
      mediaServed = true;
      break;
    }
  }

  if (!mediaServed) {
    console.warn(`⚠️  Media directory not found. Tried: ${possibleMediaPaths.join(", ")}`);
  }

  // Global prefix (applied after health endpoint registration)
  app.setGlobalPrefix("api");

  // Also register /api/health for Render health checks that use the prefix
  // This ensures health checks work regardless of Render's configuration
  instance.get("/api/health", (req: any, res: any) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "juelle-hair-backend",
      version: buildVersion,
    });
  });

  const port = process.env.PORT || 3001;
  
  // Validate PORT is set (Render should set this automatically)
  if (!process.env.PORT) {
    console.warn(`⚠️ PORT environment variable not set, using default: ${port}`);
  } else {
    console.log(`✅ PORT environment variable: ${process.env.PORT}`);
  }
  
  try {
    // Listen on 0.0.0.0 to accept connections from Render's health check proxy
    // CRITICAL: Must bind to 0.0.0.0, not localhost, for Render health checks
    await app.listen(port, "0.0.0.0");
    
    // Log startup info immediately after server starts listening
    // These logs help verify the correct image is deployed
    console.log(`✅ Application is running on: http://0.0.0.0:${port}`);
    console.log(`✅ Build Version: ${buildVersion}`);
    console.log(`✅ Build Date: ${buildDate}`);
    console.log(`✅ Health check available at: http://0.0.0.0:${port}/health`);
    console.log(`✅ Health check available at: http://0.0.0.0:${port}/api/health`);
    console.log(`✅ Version endpoint available at: http://0.0.0.0:${port}/version`);
    console.log(`✅ API endpoints available at: http://0.0.0.0:${port}/api`);
    console.log(`✅ Root endpoint available at: http://0.0.0.0:${port}/`);
    console.log("🚀 Server is ready to accept connections");
    
    // Test database connection asynchronously (non-blocking)
    // This won't block the health check from responding
    setImmediate(async () => {
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log("✅ Database connection successful");
        await prisma.$disconnect();
      } catch (dbError) {
        console.error("❌ Database connection failed:", dbError);
        // Don't exit - let the app continue running
      }
    });
    
    // Verify health endpoint registration (non-blocking)
    setImmediate(() => {
      const routes = instance._router?.stack || [];
      const healthRoute = routes.find((layer: any) => 
        layer?.route?.path === "/health" || 
        (layer?.regexp && layer.regexp.toString().includes("/health"))
      );
      const rootRoute = routes.find((layer: any) => 
        layer?.route?.path === "/" || 
        (layer?.regexp && layer.regexp.toString().match(/^\/\^\/\$\//))
      );
      if (healthRoute) {
        console.log("✅ Health endpoint confirmed registered in Express router");
      } else {
        console.warn("⚠️ Health endpoint not found in Express router stack");
      }
      if (rootRoute) {
        console.log("✅ Root endpoint confirmed registered in Express router");
      } else {
        console.warn("⚠️ Root endpoint not found in Express router stack");
      }
    });
    
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
  } catch (error) {
    console.error("❌ Failed to bootstrap application:", error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error("❌ Unhandled error during bootstrap:", error);
  process.exit(1);
});

