import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Request } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("reviews")
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() body: { productId: string; rating: number; title?: string; comment?: string }) {
    return this.reviewsService.create(req.user.id, body.productId, {
      rating: body.rating,
      title: body.title,
      comment: body.comment,
    });
  }

  @Get("public")
  async getPublicReviews(@Query("limit") limit?: string) {
    const reviews = await this.reviewsService.getPublicReviews(limit ? parseInt(limit) : 12);
    const totalCount = await this.reviewsService.getPublicReviewsCount();
    return {
      reviews,
      totalCount,
    };
  }

  @Get("product/:productId")
  async getProductReviews(@Param("productId") productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  @Get("my")
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@Request() req) {
    return this.reviewsService.getUserReviews(req.user.id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Param("id") id: string, @Request() req) {
    return this.reviewsService.deleteReview(id, req.user.id);
  }
}






