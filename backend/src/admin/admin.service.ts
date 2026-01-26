import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      const [totalOrders, totalRevenue, todayOrders, todayRevenue] =
        await Promise.all([
          this.prisma.order.count().catch(() => 0),
          // Include both PAID and PENDING (for Cash on Delivery) orders in revenue
          this.prisma.order
            .aggregate({
              where: {
                paymentStatus: { in: ["PAID", "PENDING"] },
              },
              _sum: { totalGhs: true },
            })
            .catch(() => ({ _sum: { totalGhs: null } })),
          this.prisma.order
            .count({
              where: {
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            })
            .catch(() => 0),
          // Include both PAID and PENDING (for Cash on Delivery) orders in today's revenue
          this.prisma.order
            .aggregate({
              where: {
                paymentStatus: { in: ["PAID", "PENDING"] },
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
              _sum: { totalGhs: true },
            })
            .catch(() => ({ _sum: { totalGhs: null } })),
        ]);

      // Convert Decimal to number safely
      const totalRevenueValue = totalRevenue._sum?.totalGhs
        ? typeof totalRevenue._sum.totalGhs === "number"
          ? totalRevenue._sum.totalGhs
          : parseFloat(totalRevenue._sum.totalGhs.toString())
        : 0;

      const todayRevenueValue = todayRevenue._sum?.totalGhs
        ? typeof todayRevenue._sum.totalGhs === "number"
          ? todayRevenue._sum.totalGhs
          : parseFloat(todayRevenue._sum.totalGhs.toString())
        : 0;

      return {
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenueValue,
        todayOrders: todayOrders || 0,
        todayRevenue: todayRevenueValue,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default values on error
      return {
        totalOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        todayRevenue: 0,
      };
    }
  }

  async getAllOrders(query: any) {
    const { status, paymentStatus, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteOrder(orderId: string) {
    // First, check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Use a transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // Delete analytics events related to this order
      // This ensures revenue and order counts in analytics are updated
      await tx.analyticsEvent.deleteMany({
        where: { orderId: orderId },
      });

      // Delete order items (cascade should handle this, but explicit for safety)
      await tx.orderItem.deleteMany({
        where: { orderId: orderId },
      });

      // Delete the order itself
      // Note: We don't delete addresses as they might be shared or needed for records
      // Note: We don't restore stock on delete - deletion is a data cleanup action, not a business cancellation
      const deletedOrder = await tx.order.delete({
        where: { id: orderId },
      });

      return deletedOrder;
    });
  }

  // Product Attributes Management (WooCommerce-style)
  async getAllAttributes() {
    return this.prisma.productAttribute.findMany({
      include: {
        terms: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async getAttributeById(id: string) {
    const attribute = await this.prisma.productAttribute.findUnique({
      where: { id },
      include: {
        terms: {
          orderBy: { name: "asc" },
        },
      },
    });
    if (!attribute) throw new NotFoundException("Attribute not found");
    return attribute;
  }

  async createAttribute(data: { name: string; description?: string }) {
    const slug = data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return this.prisma.productAttribute.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
      include: {
        terms: true,
      },
    });
  }

  async updateAttribute(
    id: string,
    data: { name?: string; description?: string },
  ) {
    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    return this.prisma.productAttribute.update({
      where: { id },
      data: updateData,
      include: {
        terms: true,
      },
    });
  }

  async deleteAttribute(id: string) {
    return this.prisma.productAttribute.delete({ where: { id } });
  }

  // Attribute Terms Management
  async createAttributeTerm(
    attributeId: string,
    data: { name: string; image?: string },
  ) {
    const baseSlug = data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Check if a term with this name already exists for this attribute
    const existingTerm = await this.prisma.productAttributeTerm.findFirst({
      where: {
        attributeId,
        name: data.name,
      },
    });

    if (existingTerm) {
      throw new BadRequestException(
        `A term with the name "${data.name}" already exists for this attribute.`,
      );
    }

    // Generate unique slug by appending a number if needed
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.productAttributeTerm.findFirst({
        where: {
          attributeId,
          slug,
        },
      });

      if (!existing) {
        break; // Slug is unique, we can use it
      }

      // Slug exists, try with a number suffix
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.productAttributeTerm.create({
      data: {
        attributeId,
        name: data.name,
        slug,
        image: data.image || null,
      },
    });
  }

  async updateAttributeTerm(
    id: string,
    data: { name?: string; image?: string },
  ) {
    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
    if (data.image !== undefined) {
      updateData.image = data.image;
    }
    return this.prisma.productAttributeTerm.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteAttributeTerm(id: string) {
    return this.prisma.productAttributeTerm.delete({ where: { id } });
  }

  // Match and assign color swatch images from ProductVariant to ProductAttributeTerm
  async matchColorSwatchImages() {
    // Get Color attribute
    const colorAttribute = await this.prisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
      include: {
        terms: true,
      },
    });

    if (!colorAttribute) {
      throw new NotFoundException("Color attribute not found");
    }

    // Create a map of color values to images
    const colorImageMap = new Map<string, { image: string; count: number }>();

    // 1. Get all product variants with color images
    const variantsWithImages = await this.prisma.productVariant.findMany({
      where: {
        image: { not: null },
        name: { contains: "color", mode: "insensitive" },
      },
      select: {
        value: true,
        image: true,
      },
    });

    variantsWithImages.forEach((v) => {
      if (v.value && v.image) {
        const key = v.value.toLowerCase().trim();
        const existing = colorImageMap.get(key);
        if (!existing) {
          colorImageMap.set(key, { image: v.image, count: 1 });
        } else {
          existing.count++;
        }
      }
    });

    // 2. Check product images for color references in titles
    const colorKeywords = [
      "black",
      "brown",
      "blonde",
      "red",
      "blue",
      "green",
      "purple",
      "caramel",
      "honey",
      "mocha",
      "auburn",
      "hazelnut",
      "chocolate",
      "sand",
      "gold",
      "copper",
      "burgundy",
      "off black",
      "natural black",
      "light brown",
      "dark brown",
      "triple tone",
      "balayage",
      "flamboyage",
    ];

    const products = await this.prisma.product.findMany({
      where: {
        images: { isEmpty: false },
      },
      select: {
        title: true,
        images: true,
      },
      take: 200, // Check more products
    });

    products.forEach((p) => {
      if (p.images && p.images.length > 0) {
        const titleLower = p.title.toLowerCase();
        colorKeywords.forEach((keyword) => {
          if (titleLower.includes(keyword)) {
            // Use the first product image as potential swatch
            const image = p.images[0];
            const existing = colorImageMap.get(keyword);
            if (!existing) {
              colorImageMap.set(keyword, { image, count: 1 });
            } else {
              existing.count++;
            }
          }
        });
      }
    });

    // Match and update terms
    let updated = 0;
    let skipped = 0;
    const notFound: string[] = [];

    for (const term of colorAttribute.terms) {
      // Skip if already has image
      if (term.image) {
        skipped++;
        continue;
      }

      const termNameLower = term.name.toLowerCase().trim();
      let imageUrl: string | null = null;

      // Try exact match first
      if (colorImageMap.has(termNameLower)) {
        imageUrl = colorImageMap.get(termNameLower)!.image;
      } else {
        // Try partial match (e.g., "honey blonde" contains "honey")
        for (const [variantColor, data] of colorImageMap.entries()) {
          if (
            termNameLower.includes(variantColor) ||
            variantColor.includes(termNameLower)
          ) {
            imageUrl = data.image;
            break;
          }
        }
      }

      // Try word-by-word matching for compound colors
      if (!imageUrl) {
        const words = termNameLower.split(/[\s\/-]+/);
        for (const word of words) {
          if (word.length > 2 && colorImageMap.has(word)) {
            imageUrl = colorImageMap.get(word)!.image;
            break;
          }
        }
      }

      // Try matching color keywords in term name
      if (!imageUrl) {
        for (const keyword of colorKeywords) {
          if (termNameLower.includes(keyword) && colorImageMap.has(keyword)) {
            imageUrl = colorImageMap.get(keyword)!.image;
            break;
          }
        }
      }

      if (imageUrl) {
        try {
          await this.prisma.productAttributeTerm.update({
            where: { id: term.id },
            data: { image: imageUrl },
          });
          updated++;
        } catch (error) {
          console.error(`Error updating term "${term.name}":`, error);
        }
      } else {
        notFound.push(term.name);
      }
    }

    return {
      totalTerms: colorAttribute.terms.length,
      updated,
      skipped,
      notFound: notFound.length,
      notFoundTerms: notFound,
      variantImagesFound: colorImageMap.size,
    };
  }

  // Merge terms from source attribute to target attribute
  async mergeAttributeTerms(
    sourceAttributeId: string,
    targetAttributeId: string,
  ) {
    // Get both attributes
    const sourceAttribute = await this.getAttributeById(sourceAttributeId);
    const targetAttribute = await this.getAttributeById(targetAttributeId);

    if (!sourceAttribute || !targetAttribute) {
      throw new NotFoundException("One or both attributes not found");
    }

    if (sourceAttributeId === targetAttributeId) {
      throw new BadRequestException("Cannot merge attribute into itself");
    }

    // Get existing target terms to check for duplicates (by slug)
    const targetTermSlugs = new Set(targetAttribute.terms.map((t) => t.slug));
    const targetTermNames = new Set(
      targetAttribute.terms.map((t) => t.name.toLowerCase()),
    );

    // Separate terms into those to move and those to skip
    const termsToMove: typeof sourceAttribute.terms = [];
    const termsToSkip: typeof sourceAttribute.terms = [];

    for (const term of sourceAttribute.terms) {
      // Check if a term with the same slug or name already exists in target
      if (
        targetTermSlugs.has(term.slug) ||
        targetTermNames.has(term.name.toLowerCase())
      ) {
        termsToSkip.push(term);
      } else {
        termsToMove.push(term);
      }
    }

    // Update terms to point to target attribute (using transaction for safety)
    await this.prisma.$transaction(
      termsToMove.map((term) =>
        this.prisma.productAttributeTerm.update({
          where: { id: term.id },
          data: { attributeId: targetAttributeId },
        }),
      ),
    );

    // Delete the source attribute (it should be empty now, but we'll delete it anyway)
    await this.deleteAttribute(sourceAttributeId);

    return {
      merged: termsToMove.length,
      skipped: termsToSkip.length,
      skippedTerms: termsToSkip.map((t) => t.name),
      targetAttribute: await this.getAttributeById(targetAttributeId),
    };
  }

  // Generate variations from attributes (WooCommerce-style)
  // Now only uses "Color" attribute (merged from PA Color and Option)
  async generateVariationsFromAttributes(
    productId: string,
    attributes: Array<{ name: string; terms: string[] }>,
  ) {
    // Filter out attributes with no terms
    const validAttributes = attributes.filter(
      (attr) => attr.name && attr.terms.length > 0,
    );

    if (validAttributes.length === 0) {
      return [];
    }

    // Fetch all attributes from database to get term images
    // Use case-insensitive matching to handle name variations
    const dbAttributes = await this.prisma.productAttribute.findMany({
      where: {
        OR: validAttributes.map((attr) => ({
          name: { equals: attr.name, mode: "insensitive" },
        })),
      },
      include: {
        terms: true,
      },
    });

    // Create a mapping from input attribute names to database attribute names
    const attributeNameMap = new Map<string, string>();
    validAttributes.forEach((inputAttr) => {
      const dbAttr = dbAttributes.find(
        (db) => db.name.toLowerCase() === inputAttr.name.toLowerCase(),
      );
      if (dbAttr) {
        attributeNameMap.set(inputAttr.name, dbAttr.name);
      }
    });

    // Create a map of attribute name -> term name -> image
    const termImageMap = new Map<string, Map<string, string | null>>();
    dbAttributes.forEach((dbAttr) => {
      const attrMap = new Map<string, string | null>();
      dbAttr.terms.forEach((term) => {
        attrMap.set(term.name, term.image);
      });
      termImageMap.set(dbAttr.name, attrMap);
    });

    // Also migrate any existing "Option" or "PA Color" variants to "Color" for this product
    const hasColorAttribute = validAttributes.some(
      (attr) =>
        attr.name.toLowerCase() === "color" ||
        attr.name.toLowerCase() === "colour",
    );
    if (hasColorAttribute) {
      await this.migrateVariantsToColor(productId);
    }

    // Get existing variants
    const existingVariants = await this.prisma.productVariant.findMany({
      where: { productId },
    });

    // Create separate variants for each attribute (NOT combined)
    // For example: Color has 3 terms and Length has 2 terms
    // We create 3 Color variants + 2 Length variants (not 6 combined variants)
    const results = [];

    for (const attr of validAttributes) {
      // Use the database attribute name (with correct casing) instead of input name
      const dbAttrName = attributeNameMap.get(attr.name) || attr.name;
      const attrName = dbAttrName; // Use database name for consistency
      const attrMap = termImageMap.get(attrName) || termImageMap.get(attr.name);

      // Create a variant for each term in this attribute
      for (const term of attr.terms) {
        const variantValue = term;
        const variantImage = attrMap?.get(term) || null;

        // Check if variant with this attribute name and value already exists
        const existing = existingVariants.find(
          (v) =>
            v.name.toLowerCase() === attrName.toLowerCase() &&
            v.value === variantValue,
        );

        if (existing) {
          // Update existing variant
          await this.prisma.productVariant.update({
            where: { id: existing.id },
            data: {
              name: attrName,
              value: variantValue,
              // Use term image if available, otherwise keep existing
              image: variantImage !== null ? variantImage : existing.image,
            },
          });
          results.push(existing);
        } else {
          // Create new variant
          const newVariant = await this.prisma.productVariant.create({
            data: {
              productId,
              name: attrName,
              value: variantValue,
              image: variantImage,
              stock: 0,
            },
          });
          results.push(newVariant);
        }
      }
    }

    // Delete variants that don't match any of the new attribute/term combinations
    for (const existing of existingVariants) {
      const stillExists = results.some((r) => r.id === existing.id);
      if (!stillExists) {
        // Check if this variant matches any of the new attributes
        const matchesNewAttribute = validAttributes.some((attr) => {
          const attrNameMatches =
            existing.name.toLowerCase() === attr.name.toLowerCase();
          const termMatches = attr.terms.includes(existing.value);
          return attrNameMatches && termMatches;
        });

        if (!matchesNewAttribute) {
          await this.prisma.productVariant.delete({
            where: { id: existing.id },
          });
        }
      }
    }

    return results;
  }

  // Update variant images from attribute terms
  async updateVariantImagesFromTerms(productId?: string) {
    // Get Color attribute with all terms
    const colorAttribute = await this.prisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
      include: {
        terms: true,
      },
    });

    if (!colorAttribute) {
      return { updated: 0, message: "Color attribute not found" };
    }

    // Create a map of term names to images
    const termImageMap = new Map<string, string | null>();
    colorAttribute.terms.forEach((term) => {
      termImageMap.set(term.name, term.image);
    });

    // Get all Color variants (optionally filtered by productId)
    const whereClause: any = {
      name: { equals: "Color", mode: "insensitive" },
    };
    if (productId) {
      whereClause.productId = productId;
    }

    const variants = await this.prisma.productVariant.findMany({
      where: whereClause,
    });

    let updated = 0;
    for (const variant of variants) {
      const termImage = termImageMap.get(variant.value);

      // Update if term has an image and variant doesn't, or if term image is different
      if (termImage && termImage !== variant.image) {
        await this.prisma.productVariant.update({
          where: { id: variant.id },
          data: { image: termImage },
        });
        updated++;
      }
    }

    return {
      updated,
      total: variants.length,
      message: `Updated ${updated} variant images from attribute terms`,
    };
  }

  // Migrate existing "Option" and "PA Color" variants to "Color" (for merged attributes)
  async migrateVariantsToColor(productId?: string) {
    const whereClause: any = {
      OR: [
        { name: { equals: "Option", mode: "insensitive" } },
        { name: { contains: "PA Color", mode: "insensitive" } },
        { name: { contains: "Pa Color", mode: "insensitive" } },
        { name: { contains: "pa color", mode: "insensitive" } },
      ],
    };

    if (productId) {
      whereClause.productId = productId;
    }

    const oldVariants = await this.prisma.productVariant.findMany({
      where: whereClause,
    });

    for (const oldVariant of oldVariants) {
      // Extract color value from old variant
      // If value contains " / ", it might be a combined value like "NBLK / S1B/33"
      // Extract just the color part (first part or look for color codes)
      let colorValue = oldVariant.value;

      // If it's a combined value, try to extract color
      if (colorValue.includes(" / ")) {
        const parts = colorValue.split(" / ");
        // Color codes typically look like: NBLK, NBRN, S1B/30, etc.
        // Or they might be the first part
        colorValue = parts[0].trim();
      }

      // Check if a Color variant with this value already exists
      const existingColorWhere: any = {
        productId: oldVariant.productId,
        name: "Color",
        value: colorValue,
      };

      const existingColor = await this.prisma.productVariant.findFirst({
        where: existingColorWhere,
      });

      if (existingColor) {
        // Update existing Color variant with image if old variant has one
        if (oldVariant.image && !existingColor.image) {
          await this.prisma.productVariant.update({
            where: { id: existingColor.id },
            data: { image: oldVariant.image },
          });
        }
        // Delete old variant
        await this.prisma.productVariant.delete({
          where: { id: oldVariant.id },
        });
      } else {
        // Convert old variant to Color
        await this.prisma.productVariant.update({
          where: { id: oldVariant.id },
          data: {
            name: "Color",
            value: colorValue,
          },
        });
      }
    }

    return {
      success: true,
      migrated: oldVariants.length,
      message: `Migrated ${oldVariants.length} variant(s) to Color`,
    };
  }

  // Generate all combinations (Cartesian product) of attributes
  private generateAllCombinations(
    attributes: Array<{ name: string; terms: string[] }>,
  ): Array<{
    key: string;
    combinedValue: string;
    variants: Array<{ name: string; value: string }>;
  }> {
    if (attributes.length === 0) return [];

    const combinations: Array<{
      key: string;
      combinedValue: string;
      variants: Array<{ name: string; value: string }>;
    }> = [];

    function generateRecursive(
      current: Array<{ name: string; value: string }>,
      index: number,
    ) {
      if (index === attributes.length) {
        const key = current.map((v) => `${v.name}:${v.value}`).join("|");
        const combinedValue = current.map((v) => v.value).join(" / ");
        combinations.push({ key, combinedValue, variants: [...current] });
        return;
      }

      for (const term of attributes[index].terms) {
        generateRecursive(
          [...current, { name: attributes[index].name, value: term }],
          index + 1,
        );
      }
    }

    generateRecursive([], 0);
    return combinations;
  }

  // Categories Management
  async createCategory(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
    const { seo, ...categoryData } = data;

    const category = await this.prisma.category.create({
      data: {
        ...categoryData,
        slug,
      },
    });

    // Create SEO data if provided
    if (seo) {
      await this.prisma.categorySEO.upsert({
        where: { categoryId: category.id },
        create: {
          categoryId: category.id,
          metaTitle: seo.metaTitle || null,
          metaDescription: seo.metaDescription || null,
          keywords: seo.keywords || [],
          ogTitle: seo.ogTitle || null,
          ogDescription: seo.ogDescription || null,
          ogImage: seo.ogImage || null,
          canonicalUrl: seo.canonicalUrl || null,
          noindex: seo.noindex || false,
          schemaData: seo.schemaData || {},
        },
        update: {
          metaTitle: seo.metaTitle || null,
          metaDescription: seo.metaDescription || null,
          keywords: seo.keywords || [],
          ogTitle: seo.ogTitle || null,
          ogDescription: seo.ogDescription || null,
          ogImage: seo.ogImage || null,
          canonicalUrl: seo.canonicalUrl || null,
          noindex: seo.noindex || false,
          schemaData: seo.schemaData || {},
        },
      });
    }

    return this.prisma.category.findUnique({
      where: { id: category.id },
      include: { seo: true },
    });
  }

  async updateCategory(id: string, data: any) {
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, "-");
    }
    const { seo, ...categoryData } = data;

    await this.prisma.category.update({
      where: { id },
      data: categoryData,
    });

    // Update or create SEO data if provided
    if (seo !== undefined) {
      await this.prisma.categorySEO.upsert({
        where: { categoryId: id },
        create: {
          categoryId: id,
          metaTitle: seo.metaTitle || null,
          metaDescription: seo.metaDescription || null,
          keywords: seo.keywords || [],
          ogTitle: seo.ogTitle || null,
          ogDescription: seo.ogDescription || null,
          ogImage: seo.ogImage || null,
          canonicalUrl: seo.canonicalUrl || null,
          noindex: seo.noindex || false,
          schemaData: seo.schemaData || {},
        },
        update: {
          metaTitle: seo.metaTitle || null,
          metaDescription: seo.metaDescription || null,
          keywords: seo.keywords || [],
          ogTitle: seo.ogTitle || null,
          ogDescription: seo.ogDescription || null,
          ogImage: seo.ogImage || null,
          canonicalUrl: seo.canonicalUrl || null,
          noindex: seo.noindex || false,
          schemaData: seo.schemaData || {},
        },
      });
    }

    return this.prisma.category.findUnique({
      where: { id },
      include: { seo: true },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true, children: true },
    });
    if (!category) throw new NotFoundException("Category not found");
    if (category.products.length > 0) {
      throw new BadRequestException("Cannot delete category with products");
    }
    if (category.children.length > 0) {
      throw new BadRequestException(
        "Cannot delete category with subcategories",
      );
    }
    return this.prisma.category.delete({ where: { id } });
  }

  async getAllCategories() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        seo: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  // Brands Management
  async createBrand(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
    return this.prisma.brand.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async updateBrand(id: string, data: any) {
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, "-");
    }
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!brand) throw new NotFoundException("Brand not found");
    if (brand.products.length > 0) {
      throw new BadRequestException("Cannot delete brand with products");
    }
    return this.prisma.brand.delete({ where: { id } });
  }

  async getAllBrands() {
    return this.prisma.brand.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  // Collections Management
  async createCollection(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
    return this.prisma.collection.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async updateCollection(id: string, data: any) {
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, "-");
    }
    return this.prisma.collection.update({
      where: { id },
      data,
    });
  }

  async deleteCollection(id: string) {
    return this.prisma.collection.delete({ where: { id } });
  }

  async getAllCollections() {
    return this.prisma.collection.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCollection(id: string) {
    return this.prisma.collection.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async getCollectionProducts(id: string) {
    return this.prisma.collectionProduct.findMany({
      where: { collectionId: id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            priceGhs: true,
          },
        },
      },
      orderBy: { position: "asc" },
    });
  }

  async addProductToCollection(collectionId: string, productId: string) {
    // Check if product already in collection
    const existing = await this.prisma.collectionProduct.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException("Product is already in this collection");
    }

    // Get current max position
    const maxPosition = await this.prisma.collectionProduct.findFirst({
      where: { collectionId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (maxPosition?.position ?? -1) + 1;

    return this.prisma.collectionProduct.create({
      data: {
        collectionId,
        productId,
        position: newPosition,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            priceGhs: true,
          },
        },
      },
    });
  }

  async removeProductFromCollection(
    collectionId: string,
    collectionProductId: string,
  ) {
    return this.prisma.collectionProduct.delete({
      where: { id: collectionProductId },
    });
  }

  async updateCollectionProductPositions(
    collectionId: string,
    updates: { id: string; position: number }[],
  ) {
    // Update all positions in a transaction
    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.collectionProduct.update({
          where: { id: update.id },
          data: { position: update.position },
        }),
      ),
    );

    return { success: true, message: "Product positions updated" };
  }

  // Reviews Management
  async getAllReviews(query: any) {
    const { page = 1, limit = 20, productId, userId, rating } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;
    if (rating) where.rating = parseInt(rating);

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, title: true, slug: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateReview(id: string, data: any) {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async deleteReview(id: string) {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  // Banners Management
  async createBanner(data: any) {
    return this.prisma.banner.create({ data });
  }

  async updateBanner(id: string, data: any) {
    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }

  async getAllBanners() {
    return this.prisma.banner.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  }

  // Discount Codes Management
  async createDiscountCode(data: any) {
    return this.prisma.discountCode.create({ data });
  }

  async updateDiscountCode(id: string, data: any) {
    return this.prisma.discountCode.update({
      where: { id },
      data,
    });
  }

  async deleteDiscountCode(id: string) {
    return this.prisma.discountCode.delete({ where: { id } });
  }

  async getAllDiscountCodes() {
    return this.prisma.discountCode.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // Currency Rates Management
  async getAllCurrencyRates() {
    return this.prisma.currencyRate.findMany({
      orderBy: { updatedAt: "desc" },
    });
  }

  async updateCurrencyRate(id: string, data: any) {
    return this.prisma.currencyRate.update({
      where: { id },
      data,
    });
  }

  // Customers/Users Management
  async getAllCustomers(query: any) {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      includeDeleted = false,
    } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) where.role = role;
    if (!includeDeleted) {
      where.deletedAt = null; // Exclude soft-deleted users by default
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          displayCurrency: true,
          emailVerified: true,
          createdAt: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Get counts efficiently using aggregation
    const userIds = users.map((u) => u.id);
    const [ordersCounts, addressesCounts, wishlistCounts] = await Promise.all([
      this.prisma.order.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _count: true,
      }),
      this.prisma.address.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _count: true,
      }),
      this.prisma.wishlistItem.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _count: true,
      }),
    ]);

    // Create maps for quick lookup
    const ordersMap = new Map(ordersCounts.map((c) => [c.userId, c._count]));
    const addressesMap = new Map(
      addressesCounts.map((c) => [c.userId, c._count]),
    );
    const wishlistMap = new Map(
      wishlistCounts.map((c) => [c.userId, c._count]),
    );

    const usersWithCounts = users.map((user) => ({
      ...user,
      _count: {
        orders: ordersMap.get(user.id) || 0,
        addresses: addressesMap.get(user.id) || 0,
        wishlist: wishlistMap.get(user.id) || 0,
      },
    }));

    return {
      users: usersWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(id: string, role: string) {
    const validRoles = ["CUSTOMER", "STAFF", "MANAGER", "ADMIN"];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      );
    }
    return this.prisma.user.update({
      where: { id },
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

  async updateCustomer(id: string, data: any) {
    const updateData = { ...data };
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        displayCurrency: true,
        emailVerified: true,
      },
    });
  }

  // Product Variants Management
  async getAllProductVariants(query: any) {
    const { page = 1, limit = 20, productId } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (productId) where.productId = productId;

    const [variants, total] = await Promise.all([
      this.prisma.productVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.productVariant.count({ where }),
    ]);

    return {
      variants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createProductVariant(data: any) {
    return this.prisma.productVariant.create({
      data: {
        ...data,
        image: data.image || null,
        priceGhs: data.priceGhs ? parseFloat(data.priceGhs.toString()) : null,
        compareAtPriceGhs: data.compareAtPriceGhs
          ? parseFloat(data.compareAtPriceGhs.toString())
          : null,
        stock: parseInt(data.stock?.toString() || "0"),
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async updateProductVariant(id: string, data: any) {
    return this.prisma.productVariant.update({
      where: { id },
      data: {
        ...data,
        image: data.image !== undefined ? data.image || null : undefined,
        priceGhs:
          data.priceGhs !== undefined
            ? data.priceGhs
              ? parseFloat(data.priceGhs.toString())
              : null
            : undefined,
        compareAtPriceGhs:
          data.compareAtPriceGhs !== undefined
            ? data.compareAtPriceGhs
              ? parseFloat(data.compareAtPriceGhs.toString())
              : null
            : undefined,
        stock:
          data.stock !== undefined
            ? parseInt(data.stock.toString())
            : undefined,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async deleteProductVariant(id: string) {
    return this.prisma.productVariant.delete({ where: { id } });
  }

  // Migrate product images to media library
  async migrateProductImagesToMediaLibrary() {
    console.log("🔄 Starting product image migration to media library...\n");

    try {
      // Get the project root directory - handle both Docker and local environments
      const getProjectRoot = () => {
        const backendDir = process.cwd(); // /app in Docker = ./backend on host
        // In Docker, frontend is at /app/frontend
        // On host, frontend is at ../frontend from backend
        if (path.basename(backendDir) === "app") {
          // Docker environment - frontend is at /app/frontend
          return backendDir;
        } else if (path.basename(backendDir) === "backend") {
          // Local environment - frontend is at ../frontend
          return path.join(backendDir, "..");
        }
        return backendDir;
      };

      const PROJECT_ROOT = getProjectRoot();
      // Try Docker path first, then fallback to relative path
      let OLD_PRODUCTS_DIR = path.join(
        PROJECT_ROOT,
        "frontend",
        "public",
        "products",
      );
      let NEW_MEDIA_DIR = path.join(
        PROJECT_ROOT,
        "frontend",
        "public",
        "media",
        "products",
      );

      // If Docker path doesn't exist, try relative path
      if (
        !fs.existsSync(OLD_PRODUCTS_DIR) &&
        path.basename(PROJECT_ROOT) !== "app"
      ) {
        OLD_PRODUCTS_DIR = path.join(
          PROJECT_ROOT,
          "..",
          "frontend",
          "public",
          "products",
        );
        NEW_MEDIA_DIR = path.join(
          PROJECT_ROOT,
          "..",
          "frontend",
          "public",
          "media",
          "products",
        );
      }

      // Ensure the new media directory exists
      if (!fs.existsSync(NEW_MEDIA_DIR)) {
        fs.mkdirSync(NEW_MEDIA_DIR, { recursive: true });
        console.log(`✅ Created media directory: ${NEW_MEDIA_DIR}`);
      }

      // Get all products with images
      const products = await this.prisma.product.findMany({
        where: {
          images: {
            isEmpty: false,
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
        },
      });

      console.log(`📦 Found ${products.length} products with images\n`);

      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const product of products) {
        try {
          console.log(`\n📸 Processing: ${product.title} (${product.slug})`);
          console.log(`   Current images: ${product.images.length}`);

          const newImages: string[] = [];
          let hasChanges = false;

          for (let i = 0; i < product.images.length; i++) {
            const oldImagePath = product.images[i];
            console.log(`   Image ${i + 1}: ${oldImagePath}`);

            // Extract filename from various path formats
            let filename = oldImagePath;

            // Handle different path formats
            if (
              oldImagePath.startsWith("http://") ||
              oldImagePath.startsWith("https://")
            ) {
              console.log(`   ⚠️  Skipping external URL: ${oldImagePath}`);
              newImages.push(oldImagePath); // Keep external URLs as-is
              continue;
            }

            // Extract just the filename
            if (oldImagePath.includes("/")) {
              filename = oldImagePath.split("/").pop() || oldImagePath;
            }

            // Check if file exists in old products directory
            const oldFilePath = path.join(OLD_PRODUCTS_DIR, filename);
            const newFilePath = path.join(NEW_MEDIA_DIR, filename);
            const newImagePath = `/media/products/${filename}`;

            if (fs.existsSync(oldFilePath)) {
              // File exists in old location, copy it
              if (!fs.existsSync(newFilePath)) {
                fs.copyFileSync(oldFilePath, newFilePath);
                console.log(`   ✅ Copied: ${filename} → ${newImagePath}`);
              } else {
                console.log(
                  `   ℹ️  Already exists in media library: ${filename}`,
                );
              }
              newImages.push(newImagePath);
              hasChanges = true;
            } else if (fs.existsSync(newFilePath)) {
              // File already in media library
              console.log(`   ℹ️  Already in media library: ${filename}`);
              newImages.push(newImagePath);
              hasChanges = hasChanges || oldImagePath !== newImagePath;
            } else {
              // File not found, try to find it with different extensions
              console.log(`   ⚠️  File not found: ${filename}`);
              const extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
              let found = false;
              for (const ext of extensions) {
                const baseName = filename.replace(/\.[^/.]+$/, "");
                const tryFilename = `${baseName}${ext}`;
                const tryOldPath = path.join(OLD_PRODUCTS_DIR, tryFilename);
                const tryNewPath = path.join(NEW_MEDIA_DIR, tryFilename);

                if (fs.existsSync(tryOldPath)) {
                  if (!fs.existsSync(tryNewPath)) {
                    fs.copyFileSync(tryOldPath, tryNewPath);
                  }
                  newImages.push(`/media/products/${tryFilename}`);
                  console.log(
                    `   ✅ Found and copied with extension ${ext}: ${tryFilename}`,
                  );
                  found = true;
                  hasChanges = true;
                  break;
                } else if (fs.existsSync(tryNewPath)) {
                  newImages.push(`/media/products/${tryFilename}`);
                  console.log(
                    `   ℹ️  Found in media library with extension ${ext}: ${tryFilename}`,
                  );
                  found = true;
                  hasChanges =
                    hasChanges ||
                    oldImagePath !== `/media/products/${tryFilename}`;
                  break;
                }
              }

              if (!found) {
                // Keep original path if we can't find the file
                console.log(`   ⚠️  Keeping original path: ${oldImagePath}`);
                newImages.push(oldImagePath);
              }
            }
          }

          // Update product if images changed
          if (hasChanges) {
            await this.prisma.product.update({
              where: { id: product.id },
              data: {
                images: newImages,
              },
            });
            console.log(
              `   ✅ Updated product with ${newImages.length} images`,
            );
            migratedCount++;
          } else {
            console.log(`   ℹ️  No changes needed`);
            skippedCount++;
          }
        } catch (error: any) {
          const errorMsg = `Error processing product ${product.title}: ${error.message}`;
          console.error(`   ❌ ${errorMsg}`);
          errors.push(errorMsg);
          errorCount++;
        }
      }

      const summary = {
        success: true,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount,
        errorMessages: errors,
        message: `Migration completed: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`,
      };

      console.log("\n" + "=".repeat(60));
      console.log("📊 Migration Summary:");
      console.log(`   ✅ Migrated: ${migratedCount} products`);
      console.log(`   ℹ️  Skipped: ${skippedCount} products`);
      console.log(`   ❌ Errors: ${errorCount} products`);
      console.log("=".repeat(60) + "\n");

      return summary;
    } catch (error: any) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }

  // Settings Management
  async getSettings(category?: string) {
    const where: any = {};
    if (category) where.category = category;

    const settings = await this.prisma.setting.findMany({ where });

    // Convert array to object for easier access
    const settingsObj: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    return settingsObj;
  }

  async getSetting(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async updateSetting(
    key: string,
    value: string,
    category: string = "general",
  ) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value, category, updatedAt: new Date() },
      create: { key, value, category },
    });
  }

  async updateSettings(
    settings: Array<{ key: string; value: string; category?: string }>,
  ) {
    const updates = settings.map(({ key, value, category = "general" }) =>
      this.prisma.setting.upsert({
        where: { key },
        update: { value, category, updatedAt: new Date() },
        create: { key, value, category },
      }),
    );

    await Promise.all(updates);
    return this.getSettings();
  }

  // Email Templates Management
  async getEmailTemplates() {
    const templates = await this.prisma.emailTemplate.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // If no templates in database, initialize with defaults
    if (templates.length === 0) {
      await this.initializeEmailTemplates();
      return this.prisma.emailTemplate.findMany({
        orderBy: [{ type: "asc" }, { name: "asc" }],
      });
    }

    return templates;
  }

  async getEmailTemplate(templateId: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { templateId },
    });

    if (!template) {
      throw new NotFoundException(`Email template ${templateId} not found`);
    }

    return template;
  }

  async updateEmailTemplate(
    templateId: string,
    data: { subject?: string; body?: string; variables?: string[] },
  ) {
    const existing = await this.prisma.emailTemplate.findUnique({
      where: { templateId },
    });

    if (!existing) {
      throw new NotFoundException(`Email template ${templateId} not found`);
    }

    return this.prisma.emailTemplate.update({
      where: { templateId },
      data: {
        ...(data.subject && { subject: data.subject }),
        ...(data.body && { body: data.body }),
        ...(data.variables && { variables: data.variables }),
      },
    });
  }

  async previewEmailTemplate(
    templateId: string,
    variables: Record<string, any>,
  ) {
    const template = await this.getEmailTemplate(templateId);

    // Replace variables in subject and body
    let previewSubject = template.subject;
    let previewBody = template.body;

    // Default sample variables
    const defaultVars: Record<string, any> = {
      siteName: "Juelle Hair",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      orderNumber: "ORD-12345",
      orderTotal: "GH₵ 250.00",
      orderDate: new Date().toLocaleDateString(),
      trackingNumber: "TRACK123456",
      productName: "Premium Wig",
      productPrice: "GH₵ 150.00",
    };

    const allVars = { ...defaultVars, ...variables };

    // Replace {{variable}} patterns
    Object.keys(allVars).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      previewSubject = previewSubject.replace(regex, String(allVars[key]));
      previewBody = previewBody.replace(regex, String(allVars[key]));
    });

    return {
      subject: previewSubject,
      body: previewBody,
      variables: allVars,
    };
  }

  private async initializeEmailTemplates() {
    const defaultTemplates = [
      {
        templateId: "welcome",
        name: "Welcome Email",
        subject: "Welcome to {{siteName}}!",
        body: `<h1>Welcome to {{siteName}}!</h1>
<p>Hi {{customerName}},</p>
<p>Thank you for joining us! We're excited to have you as part of our community.</p>
<p>Start shopping now and discover our amazing collection of premium wigs.</p>
<p>Best regards,<br>{{siteName}} Team</p>`,
        type: "customer",
        description: "Sent when a new user registers",
        variables: ["siteName", "customerName", "customerEmail"],
      },
      {
        templateId: "order-confirmation",
        name: "Order Confirmation",
        subject: "Order Confirmation - Order #{{orderNumber}}",
        body: `<h1>Order Confirmation</h1>
<p>Hi {{customerName}},</p>
<p>Thank you for your order! We've received your order #{{orderNumber}}.</p>
<p><strong>Order Total:</strong> {{orderTotal}}</p>
<p><strong>Order Date:</strong> {{orderDate}}</p>
<p>We'll send you another email when your order ships.</p>
<p>Best regards,<br>{{siteName}} Team</p>`,
        type: "customer",
        description: "Sent when an order is created",
        variables: [
          "siteName",
          "customerName",
          "orderNumber",
          "orderTotal",
          "orderDate",
        ],
      },
      {
        templateId: "payment-confirmation",
        name: "Payment Confirmation",
        subject: "Payment Received - Order #{{orderNumber}}",
        body: `<h1>Payment Confirmation</h1>
<p>Hi {{customerName}},</p>
<p>We've successfully received your payment for order #{{orderNumber}}.</p>
<p><strong>Amount Paid:</strong> {{orderTotal}}</p>
<p>Your order is now being processed.</p>
<p>Best regards,<br>{{siteName}} Team</p>`,
        type: "customer",
        description: "Sent when payment is received",
        variables: ["siteName", "customerName", "orderNumber", "orderTotal"],
      },
      {
        templateId: "order-shipped",
        name: "Order Shipped",
        subject: "Your Order Has Been Shipped - Order #{{orderNumber}}",
        body: `<h1>Your Order Has Been Shipped!</h1>
<p>Hi {{customerName}},</p>
<p>Great news! Your order #{{orderNumber}} has been shipped.</p>
<p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
<p>You can track your order using the tracking number above.</p>
<p>Best regards,<br>{{siteName}} Team</p>`,
        type: "customer",
        description: "Sent when order status changes to SHIPPED",
        variables: [
          "siteName",
          "customerName",
          "orderNumber",
          "trackingNumber",
        ],
      },
      {
        templateId: "order-delivered",
        name: "Order Delivered",
        subject: "Your Order Has Been Delivered - Order #{{orderNumber}}",
        body: `<h1>Your Order Has Been Delivered!</h1>
<p>Hi {{customerName}},</p>
<p>Your order #{{orderNumber}} has been successfully delivered.</p>
<p>We hope you love your purchase! If you have any questions, please don't hesitate to contact us.</p>
<p>Best regards,<br>{{siteName}} Team</p>`,
        type: "customer",
        description: "Sent when order status changes to DELIVERED",
        variables: ["siteName", "customerName", "orderNumber"],
      },
      {
        templateId: "order-cancelled",
        name: "Order Cancelled",
        subject: "Order Cancelled - Order #{{orderNumber}}",
        body: `<h1>Order Cancelled</h1>
<p>Hi {{customerName}},</p>
<p>Your order #{{orderNumber}} has been cancelled.</p>
<p>If you have any questions, please contact our support team.</p>
<p>Best regards,<br>{{siteName}} Team</p>`,
        type: "customer",
        description: "Sent when order is cancelled",
        variables: ["siteName", "customerName", "orderNumber"],
      },
      {
        templateId: "new-order",
        name: "New Order Notification",
        subject: "New Order Received - Order #{{orderNumber}}",
        body: `<h1>New Order Received</h1>
<p>A new order has been placed:</p>
<p><strong>Order Number:</strong> {{orderNumber}}</p>
<p><strong>Customer:</strong> {{customerName}} ({{customerEmail}})</p>
<p><strong>Total:</strong> {{orderTotal}}</p>
<p><strong>Date:</strong> {{orderDate}}</p>`,
        type: "admin",
        description: "Sent to admin when a new order is created",
        variables: [
          "orderNumber",
          "customerName",
          "customerEmail",
          "orderTotal",
          "orderDate",
        ],
      },
      {
        templateId: "payment-received",
        name: "Payment Received Notification",
        subject: "Payment Received - Order #{{orderNumber}}",
        body: `<h1>Payment Received</h1>
<p>Payment has been received for order #{{orderNumber}}.</p>
<p><strong>Amount:</strong> {{orderTotal}}</p>
<p><strong>Customer:</strong> {{customerName}}</p>`,
        type: "admin",
        description: "Sent to admin when payment is received",
        variables: ["orderNumber", "orderTotal", "customerName"],
      },
      {
        templateId: "new-customer",
        name: "New Customer Notification",
        subject: "New Customer Registration - {{customerEmail}}",
        body: `<h1>New Customer Registered</h1>
<p>A new customer has registered:</p>
<p><strong>Name:</strong> {{customerName}}</p>
<p><strong>Email:</strong> {{customerEmail}}</p>
<p><strong>Date:</strong> {{orderDate}}</p>`,
        type: "admin",
        description: "Sent to admin when a new customer registers",
        variables: ["customerName", "customerEmail", "orderDate"],
      },
    ];

    await this.prisma.emailTemplate.createMany({
      data: defaultTemplates,
      skipDuplicates: true,
    });
  }

  // Trust Badges Management
  async getAllTrustBadges() {
    return this.prisma.trustBadge.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
  }

  async getTrustBadge(id: string) {
    const badge = await this.prisma.trustBadge.findUnique({
      where: { id },
    });

    if (!badge) {
      throw new NotFoundException("Trust badge not found");
    }

    return badge;
  }

  async createTrustBadge(data: {
    title: string;
    description?: string;
    icon?: string;
    image?: string;
    link?: string;
    isActive?: boolean;
    position?: number;
  }) {
    return this.prisma.trustBadge.create({
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
        image: data.image,
        link: data.link,
        isActive: data.isActive ?? true,
        position: data.position ?? 0,
      },
    });
  }

  async updateTrustBadge(
    id: string,
    data: {
      title?: string;
      description?: string;
      icon?: string;
      image?: string;
      link?: string;
      isActive?: boolean;
      position?: number;
    },
  ) {
    const existing = await this.prisma.trustBadge.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Trust badge not found");
    }

    return this.prisma.trustBadge.update({
      where: { id },
      data,
    });
  }

  async deleteTrustBadge(id: string) {
    const existing = await this.prisma.trustBadge.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Trust badge not found");
    }

    return this.prisma.trustBadge.delete({
      where: { id },
    });
  }

  async updateTrustBadgePositions(updates: { id: string; position: number }[]) {
    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.trustBadge.update({
          where: { id: update.id },
          data: { position: update.position },
        }),
      ),
    );

    return { success: true, message: "Trust badge positions updated" };
  }

  // Flash Sales Management
  async getAllFlashSales() {
    return this.prisma.flashSale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                priceGhs: true,
                compareAtPriceGhs: true,
              },
            },
          },
        },
      },
    });
  }

  async getFlashSale(id: string) {
    const flashSale = await this.prisma.flashSale.findUnique({
      where: { id },
    });

    if (!flashSale) {
      throw new NotFoundException("Flash sale not found");
    }

    return flashSale;
  }

  async createFlashSale(data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    discountPercent: number;
    productIds: string[];
    isActive?: boolean;
  }) {
    // Validate dates
    if (data.endDate <= data.startDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const flashSale = await this.prisma.flashSale.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        discountPercent: data.discountPercent,
        isActive: data.isActive ?? true,
      },
    });

    // Create flash sale product relations
    if (data.productIds && data.productIds.length > 0) {
      await this.prisma.flashSaleProduct.createMany({
        data: data.productIds.map((productId) => ({
          flashSaleId: flashSale.id,
          productId,
        })),
        skipDuplicates: true,
      });
    }

    return this.prisma.flashSale.findUnique({
      where: { id: flashSale.id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                priceGhs: true,
                compareAtPriceGhs: true,
              },
            },
          },
        },
      },
    });
  }

  async updateFlashSale(
    id: string,
    data: {
      title?: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
      discountPercent?: number;
      productIds?: string[];
      isActive?: boolean;
    },
  ) {
    const existing = await this.prisma.flashSale.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Flash sale not found");
    }

    // Validate dates if both are provided
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const { productIds, ...updateData } = data;

    // Update flash sale
    await this.prisma.flashSale.update({
      where: { id },
      data: updateData,
    });

    // Update products if provided
    if (productIds !== undefined) {
      // Delete existing relations
      await this.prisma.flashSaleProduct.deleteMany({
        where: { flashSaleId: id },
      });

      // Create new relations
      if (productIds.length > 0) {
        await this.prisma.flashSaleProduct.createMany({
          data: productIds.map((productId) => ({
            flashSaleId: id,
            productId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.flashSale.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                priceGhs: true,
                compareAtPriceGhs: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteFlashSale(id: string) {
    const existing = await this.prisma.flashSale.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Flash sale not found");
    }

    return this.prisma.flashSale.delete({
      where: { id },
    });
  }

  // Blog Posts Management
  async getAllBlogPosts(query?: {
    category?: string;
    published?: boolean;
    limit?: number;
    page?: number;
  }) {
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
        orderBy: { createdAt: "desc" },
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

  async getBlogPost(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException("Blog post not found");
    }

    return post;
  }

  async createBlogPost(data: {
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
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

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

  async updateBlogPost(
    id: string,
    data: {
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
    },
  ) {
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
        publishedAt:
          data.isPublished && !existing.publishedAt
            ? new Date()
            : data.publishedAt,
      },
    });
  }

  async deleteBlogPost(id: string) {
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
}
