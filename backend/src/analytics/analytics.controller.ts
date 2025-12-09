import { Controller, Get, Post, Body, Query, Param, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("analytics")
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post("track")
  async trackEvent(@Body() data: any) {
    return this.analyticsService.trackEvent(data);
  }

  @Get("realtime")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getRealtimeStats() {
    return this.analyticsService.getRealtimeStats();
  }

  @Get("revenue-chart")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getRevenueChart(@Query("days") days?: string) {
    return this.analyticsService.getRevenueChart(days ? parseInt(days) : 30);
  }

  @Get("top-products")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getTopProducts(@Query("limit") limit?: string) {
    return this.analyticsService.getTopProducts(limit ? parseInt(limit) : 10);
  }

  @Get("top-products/public")
  async getTopProductsPublic(@Query("limit") limit?: string) {
    // Public endpoint for popular products widget (no auth required)
    return this.analyticsService.getTopProducts(limit ? parseInt(limit) : 10);
  }

  @Get("traffic-sources")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getTrafficSources(@Query("days") days?: string) {
    return this.analyticsService.getTrafficSources(days ? parseInt(days) : 30);
  }

  @Get("sales-funnel")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getSalesFunnel() {
    return this.analyticsService.getSalesFunnel();
  }

  @Get("device-breakdown")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getDeviceBreakdown(@Query("days") days?: string) {
    return this.analyticsService.getDeviceBreakdown(days ? parseInt(days) : 30);
  }

  @Get("form-conversions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getFormConversions(@Query("days") days?: string) {
    return this.analyticsService.getFormConversions(days ? parseInt(days) : 30);
  }

  @Get("top-links")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getTopLinks(@Query("days") days?: string, @Query("limit") limit?: string) {
    return this.analyticsService.getTopLinks(
      days ? parseInt(days) : 30,
      limit ? parseInt(limit) : 10
    );
  }

  @Get("video-engagement")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getVideoEngagement(@Query("days") days?: string) {
    return this.analyticsService.getVideoEngagement(days ? parseInt(days) : 30);
  }

  @Get("user-journey")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getUserJourney(
    @Query("userId") userId?: string,
    @Query("sessionId") sessionId?: string,
    @Query("days") days?: string
  ) {
    return this.analyticsService.getUserJourney(userId, sessionId, days ? parseInt(days) : 30);
  }

  @Get("custom-dimensions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getCustomDimensions(@Query("days") days?: string) {
    return this.analyticsService.getCustomDimensions(days ? parseInt(days) : 30);
  }

  @Get("events")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getEvents(
    @Query("eventType") eventType?: string,
    @Query("userId") userId?: string,
    @Query("sessionId") sessionId?: string,
    @Query("productId") productId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.analyticsService.getEvents({
      eventType,
      userId,
      sessionId,
      productId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get("events/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getEvent(@Param("id") id: string) {
    return this.analyticsService.getEvent(id);
  }
}

