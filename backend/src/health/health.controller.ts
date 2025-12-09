import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
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
}




