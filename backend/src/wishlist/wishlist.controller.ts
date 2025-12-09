import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { WishlistService } from "./wishlist.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("wishlist")
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  async findAll(@Request() req) {
    return this.wishlistService.findAll(req.user.id);
  }

  @Post(":productId")
  async addItem(@Request() req, @Param("productId") productId: string) {
    return this.wishlistService.addItem(req.user.id, productId);
  }

  @Delete(":productId")
  async removeItem(@Request() req, @Param("productId") productId: string) {
    return this.wishlistService.removeItem(req.user.id, productId);
  }
}







