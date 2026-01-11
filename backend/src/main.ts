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
    const allowedOriginsList = [
      "https://juellehairgh.com",
      "https://www.juellehairgh.com",
      "http://localhost:9002",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    const isProduction =
      process.env.NODE_ENV === "production" || process.env.PORT !== undefined;

    console.log(`🌐 CORS Configuration:`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Is Production: ${isProduction}`);
    console.log(`   Allowed Origins: ${allowedOriginsList.join(", ")}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || "not set"}`);

    // Strict CORS configuration
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        if (!isProduction) {
          if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
            return callback(null, true);
          }
        }

        const isCustomDomain = origin.includes("juellehairgh.com");
        const isInAllowedList = allowedOriginsList.some((allowedOrigin) => {
          if (!allowedOrigin) return false;
          const domain = allowedOrigin
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");
          return origin === allowedOrigin || origin.includes(domain);
        });

        if (isCustomDomain || isInAllowedList) {
          return callback(null, true);
        }

        console.warn(`⚠️  CORS: Blocked origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
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
        "Access-Control-Request-Headers",
        "X-Requested-With",
      ],
      exposedHeaders: ["Content-Range", "X-Content-Range"],
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Register health endpoint BEFORE global prefix
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

    // Register health endpoint
    instance.get("/health", (req: any, res: any) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "juelle-hair-backend",
        version: buildVersion,
      });
    });

    // Register root endpoint
    instance.get("/", (req: any, res: any) => {
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

    console.log(
      "✅ Health endpoint registered at /health and / (before global prefix)",
    );

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
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
      console.warn(
        `⚠️  Media directory not found. Tried: ${possibleMediaPaths.join(", ")}`,
      );
    }

    // Global prefix (applied after health endpoint registration)
    app.setGlobalPrefix("api");

    instance.get("/api/health", (req: any, res: any) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "juelle-hair-backend",
        version: buildVersion,
      });
    });

    const port = process.env.PORT || 3001;

    if (!process.env.PORT) {
      console.warn(
        `⚠️ PORT environment variable not set, using default: ${port}`,
      );
    } else {
      console.log(`✅ PORT environment variable: ${process.env.PORT}`);
    }

    try {
      await app.listen(port, "0.0.0.0");

      // Log startup info immediately after server starts listening
      console.log(`✅ Application is running on: http://0.0.0.0:${port}`);
      console.log(`✅ Build Version: ${buildVersion}`);
      console.log(`✅ Build Date: ${buildDate}`);
      console.log(
        `✅ Health check available at: http://0.0.0.0:${port}/health`,
      );
      console.log(
        `✅ Health check available at: http://0.0.0.0:${port}/api/health`,
      );
      console.log(
        `✅ Version endpoint available at: http://0.0.0.0:${port}/version`,
      );
      console.log(`✅ API endpoints available at: http://0.0.0.0:${port}/api`);
      console.log(`✅ Root endpoint available at: http://0.0.0.0:${port}/`);
      console.log("🚀 Server is ready to accept connections");

      // Verify health endpoint registration (non-blocking)
      setImmediate(() => {
        const routes = instance._router?.stack || [];
        const healthRoute = routes.find(
          (layer: any) =>
            layer?.route?.path === "/health" ||
            (layer?.regexp && layer.regexp.toString().includes("/health")),
        );
        const rootRoute = routes.find(
          (layer: any) =>
            layer?.route?.path === "/" ||
            (layer?.regexp && layer.regexp.toString().match(/^\/\^\/\$\//)),
        );
        if (healthRoute) {
          console.log(
            "✅ Health endpoint confirmed registered in Express router",
          );
        } else {
          console.warn("⚠️ Health endpoint not found in Express router stack");
        }
        if (rootRoute) {
          console.log(
            "✅ Root endpoint confirmed registered in Express router",
          );
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
