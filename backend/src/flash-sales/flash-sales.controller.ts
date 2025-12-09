import { Controller, Get } from "@nestjs/common";
import { FlashSalesService } from "./flash-sales.service";

@Controller("flash-sales")
export class FlashSalesController {
  constructor(private flashSalesService: FlashSalesService) {}

  @Get("active")
  async getActiveFlashSale() {
    return this.flashSalesService.getActiveFlashSale();
  }
}
