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

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("✅ Successfully connected to database");
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
}
