import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("wallet")
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMyWallet(@Request() req) {
    return this.walletService.getUserWallet(req.user.id);
  }

  @Get("me/transactions")
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@Request() req, @Query() query: any) {
    const wallet = await this.walletService.getUserWallet(req.user.id);
    return this.walletService.getTransactions(wallet.id, query);
  }

  @Post("top-up")
  @UseGuards(JwtAuthGuard)
  async topUp(@Request() req, @Body() body: { amount: number; reference: string }) {
    return this.walletService.topUp(req.user.id, body.amount, body.reference);
  }

  // Admin endpoints
  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async getAllWallets(@Query() query: any) {
    return this.walletService.getAllWallets(query);
  }

  @Get("admin/stats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async getWalletStats() {
    return this.walletService.getWalletStats();
  }

  @Get("admin/transactions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async getAllTransactions(@Query() query: any) {
    return this.walletService.getAllTransactions(query);
  }

  @Post("admin/:walletId/add")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async addFunds(
    @Param("walletId") walletId: string,
    @Body() body: { amount: number; description?: string }
  ) {
    return this.walletService.addFunds(walletId, body.amount, body.description);
  }

  @Post("admin/:walletId/deduct")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deductFunds(
    @Param("walletId") walletId: string,
    @Body() body: { amount: number; description?: string }
  ) {
    return this.walletService.deductFunds(walletId, body.amount, body.description);
  }
}
