import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.collection.findMany({
      where: {
        isActive: true,
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
          orderBy: {
            position: "asc",
          },
          take: 10,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(slug: string) {
    return this.prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
                variants: true,
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });
  }
}







