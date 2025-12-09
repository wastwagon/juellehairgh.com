import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("cart")
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Request() req) {
    return this.cartService.getOrCreateCart(req.user.id);
  }

  @Post("items")
  @UseGuards(JwtAuthGuard)
  async addItem(@Request() req, @Body() body: any) {
    return this.cartService.addItem(
      req.user.id,
      body.productId,
      body.quantity,
      body.variantId,
      body.variantIds
    );
  }

  @Put("items/:id")
  @UseGuards(JwtAuthGuard)
  async updateItem(@Param("id") id: string, @Body() body: any) {
    return this.cartService.updateItem(id, body.quantity);
  }

  @Delete("items/:id")
  @UseGuards(JwtAuthGuard)
  async removeItem(@Param("id") id: string) {
    return this.cartService.removeItem(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}



