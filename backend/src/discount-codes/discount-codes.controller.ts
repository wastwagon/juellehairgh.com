import { Controller, Post, Body } from "@nestjs/common";
import { DiscountCodesService } from "./discount-codes.service";

@Controller("discount-codes")
export class DiscountCodesController {
  constructor(private discountCodesService: DiscountCodesService) {}

  @Post("validate")
  async validateCode(@Body() body: { code: string; subtotal?: number }) {
    return this.discountCodesService.validateCode(body.code, body.subtotal || 0);
  }
}
