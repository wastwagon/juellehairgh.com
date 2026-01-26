import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
      errorFormat: "pretty",
    });

    // Ensure DATABASE_URL has connection pool parameters
    this.ensurePoolConfig();
  }

  /**
   * Ensure DATABASE_URL has connection pool parameters to prevent connection exhaustion
   */
  private ensurePoolConfig() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      this.logger.warn("⚠️ DATABASE_URL not set");
      return;
    }

    // Check if pool parameters already exist
    if (
      databaseUrl.includes("connection_limit") ||
      databaseUrl.includes("pool_timeout")
    ) {
      this.logger.log("✅ Connection pool parameters already configured");
      return;
    }

    // Log warning - pool params should be added in entrypoint script
    this.logger.warn(
      "⚠️ DATABASE_URL missing connection pool parameters. " +
        "These should be added by docker-entrypoint.sh or fix-db-env.js",
    );
  }

  async onModuleInit() {
    try {
      // Set connection timeout warning
      const connectTimeout = setTimeout(() => {
        this.logger.warn(
          "⚠️ Database connection is taking longer than expected...",
        );
      }, 10000);

      await this.$connect();
      clearTimeout(connectTimeout);
      this.logger.log("✅ Successfully connected to database");

      // Test connection with a simple query (with timeout)
      try {
        await Promise.race([
          this.$queryRaw`SELECT 1`,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Connection test timeout")),
              5000,
            ),
          ),
        ]);
        this.logger.log("✅ Database connection verified");
      } catch (testError: any) {
        this.logger.warn(
          `⚠️ Database connection test failed: ${testError.message}`,
        );
      }
    } catch (error: any) {
      // Don't crash the app if database connection fails initially
      // The app can still start and respond to health checks
      this.logger.error(
        `❌ Failed to connect to database: ${error?.message || "Unknown error"}`,
      );
      this.logger.warn(
        "⚠️ App will continue to run, but database operations may fail",
      );
      // Don't throw - allow app to start even without database
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log("✅ Disconnected from database");
    } catch (error: any) {
      this.logger.error(
        `❌ Error disconnecting from database: ${error?.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Execute query with timeout to prevent hanging requests
   * Use this for potentially long-running queries
   */
  async executeWithTimeout<T>(
    query: Promise<T>,
    timeoutMs: number = 30000,
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([query, timeoutPromise]);
  }
}
