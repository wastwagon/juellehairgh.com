import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FlashSalesService {
  constructor(private prisma: PrismaService) {}

  async getActiveFlashSale() {
    const now = new Date();

    const flashSale = await this.prisma.flashSale.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                priceGhs: true,
                compareAtPriceGhs: true,
                badges: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return flashSale;
  }
}
