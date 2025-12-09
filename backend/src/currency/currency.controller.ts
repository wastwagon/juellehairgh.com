import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrencyService } from "./currency.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("currency")
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Get("rates")
  async getRates() {
    return this.currencyService.getRates();
  }

  @Get("currencies")
  async getAllCurrencies() {
    return this.currencyService.getAllCurrencies();
  }

  @Post("update-rates")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateRates() {
    return this.currencyService.updateRates();
  }
}

