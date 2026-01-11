import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ShippingService } from "./shipping.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("shipping")
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  // Public: Get available shipping methods for a country/region/city
  @Get("methods")
  async getMethods(
    @Query("country") country?: string,
    @Query("region") region?: string,
    @Query("city") city?: string,
    @Query("orderTotal") orderTotal?: string,
  ) {
    const total = orderTotal ? parseFloat(orderTotal) : undefined;
    return this.shippingService.getMethodsForLocation(
      country || "Ghana",
      region,
      city,
      total,
    );
  }

  // Public: Get all active zones
  @Get("zones")
  async getZones() {
    return this.shippingService.getActiveZones();
  }

  // Admin: Get all zones (including inactive)
  @Get("admin/zones")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getAllZones() {
    return this.shippingService.getAllZones();
  }

  // Admin: Create zone
  @Post("admin/zones")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async createZone(@Body() data: any) {
    return this.shippingService.createZone(data);
  }

  // Admin: Update zone
  @Put("admin/zones/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async updateZone(@Param("id") id: string, @Body() data: any) {
    return this.shippingService.updateZone(id, data);
  }

  // Admin: Delete zone
  @Delete("admin/zones/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async deleteZone(@Param("id") id: string) {
    return this.shippingService.deleteZone(id);
  }

  // Admin: Create method
  @Post("admin/zones/:zoneId/methods")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async createMethod(@Param("zoneId") zoneId: string, @Body() data: any) {
    return this.shippingService.createMethod(zoneId, data);
  }

  // Admin: Update method
  @Put("admin/methods/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async updateMethod(@Param("id") id: string, @Body() data: any) {
    return this.shippingService.updateMethod(id, data);
  }

  // Admin: Delete method
  @Delete("admin/methods/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async deleteMethod(@Param("id") id: string) {
    return this.shippingService.deleteMethod(id);
  }
}
