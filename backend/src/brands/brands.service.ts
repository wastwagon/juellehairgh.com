import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      where: {
        products: {
          some: {
            isActive: true,
          },
        },
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    return brand;
  }
}
