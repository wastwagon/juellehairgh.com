import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async getAllPosts(query?: { category?: string; published?: boolean; limit?: number; page?: number }) {
    const where: any = {};
    if (query?.category) where.category = query.category;
    if (query?.published !== undefined) {
      where.isPublished = query.published;
      if (query.published) {
        where.publishedAt = { lte: new Date() };
      }
    }

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPost(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      throw new NotFoundException("Blog post not found");
    }

    // Increment views
    await this.prisma.blogPost.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return post;
  }

  async createPost(data: {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    authorId?: string;
    authorName?: string;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    publishedAt?: Date;
    seoTitle?: string;
    seoDescription?: string;
  }) {
    const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check if slug exists
    const existing = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException("A post with this slug already exists");
    }

    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage,
        authorId: data.authorId,
        authorName: data.authorName,
        category: data.category,
        tags: data.tags || [],
        isPublished: data.isPublished ?? false,
        publishedAt: data.publishedAt || (data.isPublished ? new Date() : null),
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
    });
  }

  async updatePost(id: string, data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    authorId?: string;
    authorName?: string;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    publishedAt?: Date;
    seoTitle?: string;
    seoDescription?: string;
  }) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Blog post not found");
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.prisma.blogPost.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new BadRequestException("A post with this slug already exists");
      }
    }

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.isPublished && !existing.publishedAt ? new Date() : data.publishedAt,
      },
    });
  }

  async deletePost(id: string) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Blog post not found");
    }

    return this.prisma.blogPost.delete({
      where: { id },
    });
  }

  async getCategories() {
    const posts = await this.prisma.blogPost.findMany({
      where: {
        isPublished: true,
        category: { not: null },
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    return posts.map((p) => p.category).filter((c): c is string => c !== null);
  }
}
