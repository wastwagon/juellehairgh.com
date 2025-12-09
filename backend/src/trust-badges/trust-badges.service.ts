import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TrustBadgesService {
  constructor(private prisma: PrismaService) {}

  async getPublicTrustBadges() {
    return this.prisma.trustBadge.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        icon: true,
        image: true,
        link: true,
      },
    });
  }
}
