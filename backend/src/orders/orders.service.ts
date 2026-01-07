import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CartService } from "../cart/cart.service";
import { EmailService } from "../email/email.service";
import { WalletService } from "../wallet/wallet.service";
import { PaymentStatus, OrderStatus } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private emailService: EmailService,
    private walletService: WalletService,
  ) {}

  async create(userId: string, orderData: any) {
    const cart = await this.cartService.getOrCreateCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    // Calculate subtotal in GHS
    const subtotalGhs = await this.cartService.calculateTotal(cart.id);

    // Apply discount if discount code provided
    let discountAmount = 0;
    if (orderData.discountCodeId) {
      const discountCode = await this.prisma.discountCode.findUnique({
        where: { id: orderData.discountCodeId },
      });
      if (discountCode && discountCode.isActive) {
        if (discountCode.discountType === "PERCENTAGE") {
          discountAmount =
            (subtotalGhs * Number(discountCode.discountValue)) / 100;
          if (
            discountCode.maxDiscount &&
            discountAmount > Number(discountCode.maxDiscount)
          ) {
            discountAmount = Number(discountCode.maxDiscount);
          }
        } else {
          discountAmount = Number(discountCode.discountValue);
        }
        // Increment usage count
        await this.prisma.discountCode.update({
          where: { id: discountCode.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    // Get shipping cost (default to 0 if not provided)
    const shippingCost = orderData.shippingCost
      ? Number(orderData.shippingCost)
      : 0;

    // Calculate total including shipping and discount
    const totalGhs = subtotalGhs - discountAmount + shippingCost;

    // Handle wallet payment if selected
    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    let orderStatus: OrderStatus = OrderStatus.AWAITING_PAYMENT;
    if (orderData.paymentMethod === "wallet") {
      try {
        // Deduct from wallet without orderId first (will update after order creation)
        await this.walletService.useWalletForPayment(userId, totalGhs, null);
        paymentStatus = PaymentStatus.PAID;
        orderStatus = OrderStatus.PAID; // OrderStatus.PAID means order is confirmed and paid
      } catch (error: any) {
        throw new BadRequestException(
          error.message || "Insufficient wallet balance",
        );
      }
    }

    // Create addresses
    const shippingAddress = await this.prisma.address.create({
      data: {
        userId,
        ...orderData.shippingAddress,
      },
    });

    const billingAddress = await this.prisma.address.create({
      data: {
        userId,
        ...orderData.billingAddress,
      },
    });

    // Create order (shipping cost is included in totalGhs)
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalGhs, // This includes subtotal + shipping cost
        displayCurrency: orderData.displayCurrency || "GHS",
        displayTotal: orderData.displayTotal,
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        shippingMethod: orderData.shippingMethod || null,
        status: orderStatus,
        paymentStatus: paymentStatus,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            variantIds:
              item.variantIds && item.variantIds.length > 0
                ? item.variantIds
                : undefined,
            quantity: item.quantity,
            priceGhs: (() => {
              // Use variant price if available, considering sale price
              if (item.variant?.priceGhs) {
                const regularPrice = Number(item.variant.priceGhs);
                const salePrice = item.variant.compareAtPriceGhs
                  ? Number(item.variant.compareAtPriceGhs)
                  : null;
                // Use sale price if available and lower than regular price
                return salePrice && salePrice < regularPrice
                  ? salePrice
                  : regularPrice;
              }
              // Fall back to product price
              return Number(item.product.priceGhs);
            })(),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // If wallet payment was used, update the wallet transaction with actual order ID
    if (orderData.paymentMethod === "wallet" && paymentStatus === "PAID") {
      try {
        const wallet = await this.walletService.getUserWallet(userId);
        // Find the most recent PAYMENT transaction without an orderId for this wallet
        await this.prisma.walletTransaction.updateMany({
          where: {
            walletId: wallet.id,
            type: "PAYMENT",
            orderId: null,
            createdAt: {
              gte: new Date(Date.now() - 60000), // Within the last minute
            },
          },
          data: {
            orderId: order.id,
            description: `Payment for order ${order.id}`,
          },
        });
      } catch (error) {
        console.error(
          "Failed to update wallet transaction with order ID:",
          error,
        );
      }
    }

    // Clear cart
    await this.cartService.clearCart(userId);

    // Send order confirmation email to customer (non-blocking)
    this.emailService.sendOrderConfirmation(order).catch((error) => {
      console.error("Failed to send order confirmation email:", error);
      // Don't throw - email failure shouldn't block order creation
    });

    // Send new order notification to admin (non-blocking)
    this.emailService.sendAdminNewOrder(order).catch((error) => {
      console.error("Failed to send admin new order notification:", error);
      // Don't throw - email failure shouldn't block order creation
    });

    return order;
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true, // Include all variants to resolve variantIds
              },
            },
            variant: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true, // Include all variants to resolve variantIds
              },
            },
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.userId !== userId) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async findByTrackingNumber(trackingNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: { trackingNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true,
              },
            },
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async findByOrderIdPublic(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true,
              },
            },
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async updateStatus(id: string, status: string, trackingNumber?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: status as any, // Type assertion for OrderStatus enum
        trackingNumber,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    // Send email notifications based on status
    try {
      switch (status) {
        case "SHIPPED":
          await this.emailService.sendOrderShipped(order, trackingNumber);
          break;
        case "DELIVERED":
          await this.emailService.sendOrderDelivered(order);
          break;
        case "CANCELLED":
          await this.emailService.sendOrderCancelled(
            order,
            "Order cancelled by admin",
          );
          break;
      }
    } catch (error) {
      console.error(
        `Failed to send email notification for status ${status}:`,
        error,
      );
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.userId !== userId) {
      throw new BadRequestException("You can only cancel your own orders");
    }

    // Only allow cancellation if order is not already shipped/delivered
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      throw new BadRequestException(
        "Cannot cancel order that has already been shipped or delivered",
      );
    }

    if (order.status === "CANCELLED") {
      throw new BadRequestException("Order is already cancelled");
    }

    // If order was paid, refund to wallet
    if (order.paymentStatus === "PAID") {
      // Note: Wallet refund will be handled by admin or payment service
      // For now, just mark as cancelled
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    // Send cancellation email
    try {
      await this.emailService.sendOrderCancelled(
        updatedOrder,
        "Order cancelled by customer",
      );
    } catch (error) {
      console.error("Failed to send cancellation email:", error);
    }

    return updatedOrder;
  }
}
