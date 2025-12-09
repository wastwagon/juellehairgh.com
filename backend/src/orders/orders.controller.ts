import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() body: any) {
    return this.ordersService.create(req.user.id, body);
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


