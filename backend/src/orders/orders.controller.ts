import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) { }

  @Post()
  async create(@Request() req, @Body() body: any) {
    // If user is authenticated via JWT (optional), req.user will be set by a global guard or we can check headers manually if needed.
    // However, since we removed UseGuards(JwtAuthGuard), req.user might be undefined.
    // We'll let the service handle user creation/lookup if userId is missing.
    const userId = req.user?.id || null;
    return this.ordersService.create(userId, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id);
  }

  // Public tracking endpoints - must come before :id route
  @Get("track/:trackingNumber")
  // Public endpoint - no authentication required for order tracking
  async findByTrackingNumber(@Param("trackingNumber") trackingNumber: string) {
    return this.ordersService.findByTrackingNumber(trackingNumber);
  }

  @Get("track/id/:id")
  // Public endpoint - no authentication required for order tracking by ID
  async findByOrderId(@Param("id") id: string) {
    return this.ordersService.findByOrderIdPublic(id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param("id") id: string) {
    return this.ordersService.findOne(id, req.user.id);
  }

  @Post(":id/cancel")
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Request() req, @Param("id") id: string) {
    return this.ordersService.cancelOrder(id, req.user.id);
  }
}
