import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePicture: true,
        displayCurrency: true,
        role: true,
        emailMarketing: true,
        emailOrderUpdates: true,
        emailReviewReminders: true,
        emailNewsletter: true,
        addresses: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePicture: true,
        displayCurrency: true,
        role: true,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    if (newPassword.length < 6) {
      throw new BadRequestException("New password must be at least 6 characters");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }

  async updateRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async getAccountStatistics(userId: string) {
    const [orders, reviews] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          totalGhs: true,
          createdAt: true,
          items: {
            select: {
              product: {
                select: {
                  categoryId: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                  brandId: true,
                  brand: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.review.findMany({
        where: { userId },
        select: {
          id: true,
        },
      }),
    ]);

    const totalSpent = orders
      .filter((o) => o.totalGhs)
      .reduce((sum, o) => sum + Number(o.totalGhs), 0);
    
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

    // Get favorite categories and brands
    const categoryCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.product?.category?.name) {
          categoryCounts[item.product.category.name] = (categoryCounts[item.product.category.name] || 0) + 1;
        }
        if (item.product?.brand?.name) {
          brandCounts[item.product.brand.name] = (brandCounts[item.product.brand.name] || 0) + 1;
        }
      });
    });

    const favoriteCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const favoriteBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const lastOrder = orders.length > 0 
      ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

    return {
      totalSpent,
      averageOrderValue,
      totalOrders: orders.length,
      totalReviews: reviews.length,
      favoriteCategory,
      favoriteBrand,
      lastOrderDate: lastOrder?.createdAt || null,
    };
  }

  async requestAccountDeletion(userId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Mark account for deletion (soft delete)
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        deletionRequestedAt: new Date(),
        deletionReason: reason || null,
      },
    });
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    priceGhs: true,
                  },
                },
              },
            },
          },
        },
        reviews: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        wishlist: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        wallet: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Remove sensitive data
    const { password, ...userData } = user;

    return {
      exportedAt: new Date().toISOString(),
      user: userData,
    };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        deletionRequestedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("Password is incorrect");
    }

    // Check if deletion was requested
    if (!user.deletionRequestedAt) {
      throw new BadRequestException("Account deletion must be requested first");
    }

    // Soft delete: mark as deleted instead of hard delete
    // This preserves order history and other important data
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted_${Date.now()}_${user.id}@deleted.local`, // Anonymize email
        name: null,
        phone: null,
        profilePicture: null,
      },
    });
  }
}







