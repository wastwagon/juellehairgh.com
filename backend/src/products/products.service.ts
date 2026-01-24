import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    try {
      const {
        category,
        brand,
        search,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20,
        includeInactive = false,
      } = query;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (
        includeInactive === "true" ||
        includeInactive === true ||
        query.admin === "true"
      ) {
        // Include all products for admin
      } else {
        where.isActive = true;
      }

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

      // Wrap queries with timeout to prevent hanging (20s timeout)
      const [productsData, total] = await Promise.all([
        this.prisma.executeWithTimeout(
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
              },
            },
            skip,
            take: parseInt(limit.toString()),
            orderBy: query.sort
              ? (this.getOrderBy(query.sort) as any)
              : { createdAt: "desc" },
          }),
          20000, // 20 second timeout
        ),
        this.prisma.executeWithTimeout(
          this.prisma.product.count({ where }),
          20000, // 20 second timeout
        ),
      ]);

      // Enrich all products' variants with images using helper
      const products = await Promise.all(
        productsData.map((product) => this.enrichProductVariants(product)),
      );

      return {
        products,
        pagination: {
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          total,
          totalPages: Math.ceil(total / parseInt(limit.toString())),
        },
      };
    } catch (error: any) {
      this.logger.error(
        `❌ Error in findAll: ${error?.message || "Unknown error"}`,
        error?.stack,
      );
      throw new InternalServerErrorException(
        `Failed to fetch products: ${error?.message || "Unknown error"}`,
      );
    }
  }

  async findOne(slug: string) {
    try {
      const product = await this.prisma.executeWithTimeout(
        this.prisma.product.findUnique({
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
        }),
        20000, // 20 second timeout
      );

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      // Enrich variants with attribute term images using helper
      return await this.enrichProductVariants(product);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `❌ Error in findOne: ${error?.message || "Unknown error"}`,
        error?.stack,
      );
      throw new InternalServerErrorException(
        `Failed to fetch product: ${error?.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Helper to enrich product variants with images from attribute terms
   */
  private async enrichProductVariants(product: any) {
    if (!product.variants || product.variants.length === 0) {
      return product;
    }

    // Get Color attribute terms
    const colorAttribute = await this.prisma.productAttribute.findFirst({
      where: { name: { equals: "Color", mode: "insensitive" } },
      include: { terms: true },
    });

    if (!colorAttribute) {
      return product;
    }

    const termImageMap = new Map<string, string | null>();
    colorAttribute.terms.forEach((term) => {
      termImageMap.set(term.name.toLowerCase(), term.image);
    });

    product.variants = product.variants.map((variant) => {
      if (variant.name.toLowerCase().includes("color")) {
        const variantValueLower = variant.value.toLowerCase();
        const termImage = termImageMap.get(variantValueLower);

        // Try exact match first
        if (termImage) {
          return { ...variant, image: termImage };
        }

        // Try partial match
        for (const [termName, image] of termImageMap.entries()) {
          if (
            variantValueLower.includes(termName) ||
            termName.includes(variantValueLower)
          ) {
            return { ...variant, image: image || variant.image };
          }
        }
      }
      return variant;
    });

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
    const frequentlyBoughtTogether =
      orderIds.length > 0
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
      frequentlyBought.map((item) => [item.productId, item._count.productId]),
    );

    return products.sort((a, b) => {
      const freqA = frequencyMap.get(a.id) || 0;
      const freqB = frequencyMap.get(b.id) || 0;
      return freqB - freqA;
    });
  }

  async create(createProductDto: any) {
    // Validate required fields
    if (
      !createProductDto.categoryId ||
      createProductDto.categoryId.trim() === ""
    ) {
      throw new Error("Category is required");
    }

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

    // Prepare data object, ensuring categoryId is properly set
    const productData: any = {
      title: createProductDto.title,
      slug,
      shortDescription: createProductDto.shortDescription || null,
      description: createProductDto.description || null,
      categoryId: createProductDto.categoryId, // Required field
      priceGhs: createProductDto.priceGhs || 0,
      compareAtPriceGhs: createProductDto.compareAtPriceGhs || null,
      images: createProductDto.images || [],
      badges: createProductDto.badges || [],
      stock: createProductDto.stock ?? 0,
      sku: createProductDto.sku || null,
      isActive: createProductDto.isActive ?? true,
    };

    // Add brandId only if provided
    if (createProductDto.brandId && createProductDto.brandId.trim() !== "") {
      productData.brandId = createProductDto.brandId;
    }

    return this.prisma.product.create({
      data: productData,
      include: {
        brand: true,
        category: true,
        variants: true,
      },
    });
  }

  async update(id: string, updateProductDto: any) {
    this.logger.log(`📝 Updating product ${id} with data:`, JSON.stringify(updateProductDto));
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
        while (
          await this.prisma.product.findFirst({
            where: { slug, id: { not: id } },
          })
        ) {
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

  async reduceStock(orderItems: any[]) {
    this.logger.log(`📉 Reducing stock for ${orderItems.length} items`);

    for (const item of orderItems) {
      try {
        if (item.variantId) {
          // Reduce variant stock
          await this.prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
          this.logger.log(
            `✅ Reduced variant ${item.variantId} stock by ${item.quantity}`,
          );
        } else if (item.variantIds && item.variantIds.length > 0) {
          // If multiple variants are selected, we usually track stock on one or the combination
          for (const vId of item.variantIds) {
            await this.prisma.productVariant.update({
              where: { id: vId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        } else {
          // Reduce main product stock
          await this.prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
          this.logger.log(
            `✅ Reduced product ${item.productId} stock by ${item.quantity}`,
          );
        }
      } catch (error: any) {
        this.logger.error(
          `❌ Failed to reduce stock for item ${item.productId}: ${error?.message || "Unknown error"}`,
        );
      }
    }
  }
}
