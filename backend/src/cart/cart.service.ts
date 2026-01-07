import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId?: string) {
    if (userId) {
      let cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  brand: true,
                  category: true,
                  variants: true, // Include all variants to resolve variantIds
                },
              },
              variant: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId,
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    brand: true,
                    category: true,
                    variants: true, // Include all variants to resolve variantIds
                  },
                },
                variant: true,
              },
            },
          },
        });
      }

      return cart;
    }

    // For anonymous users, we'll handle this differently
    // For now, return empty cart structure
    return {
      id: null,
      userId: null,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    variantId?: string,
    variantIds?: string[],
  ) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Use variantIds if provided, otherwise fall back to variantId
    const finalVariantIds =
      variantIds && variantIds.length > 0
        ? variantIds
        : variantId
          ? [variantId]
          : [];
    const finalVariantId =
      variantId || (finalVariantIds.length > 0 ? finalVariantIds[0] : null);

    // Create a unique key for comparison
    const variantKey = finalVariantIds.sort().join(",");

    // Check if item already exists with same variantIds
    const existingItems = await this.prisma.cartItem.findMany({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    // Find item with matching variantIds
    const existingItem = existingItems.find((item) => {
      const itemVariantIds =
        item.variantIds && item.variantIds.length > 0
          ? item.variantIds.sort().join(",")
          : item.variantId || "";
      return itemVariantIds === variantKey;
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          variantIds: finalVariantIds.length > 0 ? finalVariantIds : undefined,
        },
        include: {
          product: true,
          variant: true,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: finalVariantId,
        variantIds: finalVariantIds.length > 0 ? finalVariantIds : undefined,
        quantity,
      },
      include: {
        product: true,
        variant: true,
      },
    });
  }

  async updateItem(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(cartItemId);
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: true,
        variant: true,
      },
    });
  }

  async removeItem(cartItemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }

  async calculateTotal(cartId: string): Promise<number> {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: {
        product: true,
        variant: true,
      },
    });

    return items.reduce((total, item) => {
      const price = item.variant?.priceGhs
        ? Number(item.variant.priceGhs)
        : Number(item.product.priceGhs);
      return total + price * item.quantity;
    }, 0);
  }
}
