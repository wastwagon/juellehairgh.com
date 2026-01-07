import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  check() {
    // Simple, fast health check - no database calls, no external dependencies
    // This endpoint is at /api/health due to global prefix
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "juelle-hair-backend",
    };
  }

  @Get("db")
  async checkDatabase() {
    // Database diagnostic endpoint - helps diagnose 500 errors
    try {
      // Test basic connection
      await this.prisma.$queryRaw`SELECT 1`;

      // Check if Product table exists
      const productCount = await this.prisma.product.count();

      // Check if Category table exists
      const categoryCount = await this.prisma.category.count();

      // Check if Brand table exists
      const brandCount = await this.prisma.brand.count();

      return {
        status: "ok",
        database: "connected",
        tables: {
          products: productCount,
          categories: categoryCount,
          brands: brandCount,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: "error",
        database: "disconnected",
        error: error?.message || "Unknown error",
        code: error?.code || "UNKNOWN",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
