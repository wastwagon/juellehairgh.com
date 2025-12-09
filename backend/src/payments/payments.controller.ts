import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post("initialize")
  @UseGuards(JwtAuthGuard)
  async initialize(@Request() req, @Body() body: { orderId?: string; amount?: number; email: string; metadata?: any }) {
    // Support both order payment and wallet top-up
    if (body.orderId) {
      return this.paymentsService.initializePayment(body.orderId, body.email, body.metadata);
    } else if (body.amount) {
      return this.paymentsService.initializePayment(body.amount, body.email, body.metadata);
    } else {
      throw new BadRequestException("Either orderId or amount must be provided");
    }
  }

  @Get("verify/:reference")
  async verify(@Param("reference") reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Post("callback")
  async callback(@Body() body: any) {
    // Paystack webhook callback
    if (body.event === "charge.success") {
      const reference = body.data.reference;
      return this.paymentsService.verifyPayment(reference);
    }

    return { received: true };
  }
}







