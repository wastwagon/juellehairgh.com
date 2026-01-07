import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    productId: string,
    data: { rating: number; title?: string; comment?: string },
  ) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Check if user has already reviewed this product
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      throw new ForbiddenException("You have already reviewed this product");
    }

    // Create review - requires admin approval (isVerified: false)
    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isVerified: false, // Requires admin approval before showing on frontend
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getProductReviews(productId: string) {
    return this.prisma.review.findMany({
      where: {
        productId,
        isVerified: true, // Only show verified reviews on frontend
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  async getPublicReviews(limit: number = 12) {
    // Get reviews with sufficient text (at least 100 characters in comment or title)
    // Exclude Test User reviews
    const reviews = await this.prisma.review.findMany({
      where: {
        isVerified: true,
        user: {
          NOT: {
            OR: [
              { name: { contains: "Test", mode: "insensitive" } },
              { email: { contains: "test", mode: "insensitive" } },
            ],
          },
        },
        OR: [{ comment: { not: null } }, { title: { not: null } }],
      },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        productId: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit * 3, // Get more to filter
    });

    // Filter reviews with sufficient text (at least 100 characters total)
    const filteredReviews = reviews.filter((review) => {
      const text = (review.comment || "") + (review.title || "");
      return text.trim().length >= 100;
    });

    // Return only the requested limit
    return filteredReviews.slice(0, limit);
  }

  async getPublicReviewsCount(): Promise<number> {
    return this.prisma.review.count({
      where: {
        isVerified: true,
        user: {
          NOT: {
            OR: [
              { name: { contains: "Test", mode: "insensitive" } },
              { email: { contains: "test", mode: "insensitive" } },
            ],
          },
        },
      },
    });
  }
}
