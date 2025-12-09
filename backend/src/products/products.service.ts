import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { category, brand, search, minPrice, maxPrice, page = 1, limit = 20 } = query;

    const skip = (page - 1) * limit;
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.categoryId = category;
    }

    if (brand) {
      where.brandId = brand;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.priceGhs = {};
      if (minPrice) where.priceGhs.gte = parseFloat(minPrice);
      if (maxPrice) where.priceGhs.lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          variants: true,
          seo: true, // Include SEO data
          reviews: {
            where: {
              isVerified: true, // Only include verified reviews
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            // Include all verified reviews for accurate rating and count
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: query.sort
          ? (this.getOrderBy(query.sort) as any)
          : { createdAt: "desc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: {
          include: {
            parent: true,
          },
        },
        variants: true,
        reviews: {
          where: {
            isVerified: true, // Only show verified reviews on frontend
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        seo: true, // Include SEO data
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async getRecommendations(productId: string, limit: number = 8) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        categoryId: true,
        brandId: true,
        priceGhs: true,
      },
    });

    if (!product) {
      return [];
    }

    // Get products from same category
    const sameCategory = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        priceGhs: true,
        compareAtPriceGhs: true,
        badges: true,
      },
    });

    // Get products from same brand if available
    const sameBrand = product.brandId
      ? await this.prisma.product.findMany({
          where: {
            brandId: product.brandId,
            id: { not: productId },
            isActive: true,
          },
          take: Math.floor(limit / 2),
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            priceGhs: true,
            compareAtPriceGhs: true,
            badges: true,
          },
        })
      : [];

    // Get frequently bought together products (from order history)
    // First, find orders that contain this product
    const ordersWithProduct = await this.prisma.orderItem.findMany({
      where: {
        productId: productId,
      },
      select: {
        orderId: true,
      },
      distinct: ["orderId"],
    });

    const orderIds = ordersWithProduct.map((item) => item.orderId);

    // Then, get other products from those orders
    const frequentlyBoughtTogether = orderIds.length > 0
      ? await this.prisma.orderItem.findMany({
          where: {
            orderId: { in: orderIds },
            productId: { not: productId },
            product: {
              isActive: true,
            },
          },
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
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    // Combine and deduplicate
    const recommendations = new Map<string, any>();

    // Add same category products
    sameCategory.forEach((p) => {
      if (!recommendations.has(p.id)) {
        recommendations.set(p.id, p);
      }
    });

    // Add same brand products
    sameBrand.forEach((p) => {
      if (!recommendations.has(p.id)) {
        recommendations.set(p.id, p);
      }
    });

    // Add frequently bought together
    frequentlyBoughtTogether.forEach((item: any) => {
      if (item.product && !recommendations.has(item.product.id)) {
        recommendations.set(item.product.id, item.product);
      }
    });

    return Array.from(recommendations.values()).slice(0, limit);
  }

  async getFrequentlyBoughtTogether(productId: string, limit: number = 4) {
    // Find products that are frequently bought together with this product
    const ordersWithProduct = await this.prisma.orderItem.findMany({
      where: {
        productId: productId,
      },
      select: {
        orderId: true,
      },
      distinct: ["orderId"],
    });

    const orderIds = ordersWithProduct.map((item) => item.orderId);

    if (orderIds.length === 0) {
      return [];
    }

    // Find other products in those orders
    const frequentlyBought = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        orderId: { in: orderIds },
        productId: { not: productId },
        product: {
          isActive: true,
        },
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: "desc",
        },
      },
      take: limit,
    });

    const productIds = frequentlyBought.map((item) => item.productId);

    if (productIds.length === 0) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        priceGhs: true,
        compareAtPriceGhs: true,
        badges: true,
      },
    });

    // Sort by frequency
    const frequencyMap = new Map(
      frequentlyBought.map((item) => [item.productId, item._count.productId])
    );

    return products.sort((a, b) => {
      const freqA = frequencyMap.get(a.id) || 0;
      const freqB = frequencyMap.get(b.id) || 0;
      return freqB - freqA;
    });
  }

  async create(createProductDto: any) {
    // Generate slug from title if not provided
    if (!createProductDto.slug) {
      createProductDto.slug = createProductDto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Ensure slug is unique
    let slug = createProductDto.slug;
    let counter = 1;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${createProductDto.slug}-${counter}`;
      counter++;
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        slug,
        isActive: createProductDto.isActive ?? true,
        stock: createProductDto.stock ?? 0,
      },
      include: {
        brand: true,
        category: true,
        variants: true,
      },
    });
  }

  async update(id: string, updateProductDto: any) {
    // If title is being updated and slug is not provided, regenerate slug
    if (updateProductDto.title && !updateProductDto.slug) {
      const existing = await this.prisma.product.findUnique({ where: { id } });
      if (existing && existing.title !== updateProductDto.title) {
        updateProductDto.slug = updateProductDto.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        
        // Ensure slug is unique (excluding current product)
        let slug = updateProductDto.slug;
        let counter = 1;
        while (await this.prisma.product.findFirst({ 
          where: { slug, id: { not: id } } 
        })) {
          slug = `${updateProductDto.slug}-${counter}`;
          counter++;
        }
        updateProductDto.slug = slug;
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        brand: true,
        category: true,
        variants: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private getOrderBy(sort: string) {
    switch (sort) {
      case "price-low":
        return { priceGhs: "asc" };
      case "price-high":
        return { priceGhs: "desc" };
      case "newest":
        return { createdAt: "desc" };
      case "oldest":
        return { createdAt: "asc" };
      default:
        return { createdAt: "desc" };
    }
  }
}

