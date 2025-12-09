import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Return all categories (both parent and children) for admin forms
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        products: {
          where: {
            isActive: true,
          },
          take: 20,
        },
      },
    });
  }
}

