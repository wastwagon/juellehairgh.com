import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * Global request timeout middleware
 * Prevents requests from hanging indefinitely and causing 504 Gateway Timeout errors
 */
@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly timeout: number;

  constructor() {
    // Default timeout: 25 seconds (Coolify/Nginx typically times out at 30s)
    // Health endpoints are excluded from timeout
    this.timeout = parseInt(process.env.REQUEST_TIMEOUT_MS || "25000");
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Skip timeout for health checks (they should be fast)
    if (
      req.path === "/health" ||
      req.path === "/api/health" ||
      req.path === "/api/health/db" ||
      req.path === "/"
    ) {
      return next();
    }

    // Set timeout for this request
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          statusCode: 504,
          message: "Request timeout - the server took too long to respond",
          error: "Gateway Timeout",
          timestamp: new Date().toISOString(),
        });
        res.end();
      }
    }, this.timeout);

    // Clear timeout when response finishes
    const originalEnd = res.end.bind(res);
    res.end = function (...args: any[]) {
      clearTimeout(timeoutId);
      return originalEnd(...args);
    };

    next();
  }
}
