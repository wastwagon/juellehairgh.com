import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DiscountCodesService {
  constructor(private prisma: PrismaService) {}

  async validateCode(code: string, subtotal: number) {
    const discountCode = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discountCode) {
      throw new NotFoundException("Discount code not found");
    }

    // Check if code is active
    if (!discountCode.isActive) {
      throw new BadRequestException("Discount code is not active");
    }

    // Check if code has expired or not started
    const now = new Date();
    if (discountCode.startDate && now < discountCode.startDate) {
      throw new BadRequestException("Discount code is not yet active");
    }
    if (discountCode.endDate && now > discountCode.endDate) {
      throw new BadRequestException("Discount code has expired");
    }

    // Check if code has reached usage limit
    if (
      discountCode.usageLimit &&
      discountCode.usedCount >= discountCode.usageLimit
    ) {
      throw new BadRequestException(
        "Discount code has reached its usage limit",
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * Number(discountCode.discountValue)) / 100;
      // Apply max discount if set
      if (
        discountCode.maxDiscount &&
        discountAmount > Number(discountCode.maxDiscount)
      ) {
        discountAmount = Number(discountCode.maxDiscount);
      }
    } else {
      discountAmount = Number(discountCode.discountValue);
    }

    // Check minimum order amount
    if (
      discountCode.minPurchase &&
      subtotal < Number(discountCode.minPurchase)
    ) {
      throw new BadRequestException(
        `Minimum order amount of GH₵ ${discountCode.minPurchase} required`,
      );
    }

    return {
      id: discountCode.id,
      code: discountCode.code,
      type: discountCode.discountType,
      value: Number(discountCode.discountValue),
      maxDiscount: discountCode.maxDiscount
        ? Number(discountCode.maxDiscount)
        : null,
      discountAmount,
    };
  }
}
