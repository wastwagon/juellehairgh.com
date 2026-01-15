import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly siteName = "Juelle Hair Ghana";
  private readonly siteUrl: string;
  private readonly siteEmail: string;
  private readonly logoUrl: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.siteUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:9002";
    this.siteEmail =
      this.configService.get<string>("EMAIL_FROM") ||
      "noreply@juellehairgh.com";
    this.logoUrl = `${this.siteUrl}/logo.png`;
  }

  /**
   * Get admin email from database settings or environment variable
   */
  private async getAdminEmail(): Promise<string> {
    try {
      const setting = await this.prisma.setting.findUnique({
        where: { key: "ADMIN_EMAIL" },
      });
      if (setting?.value) {
        return setting.value;
      }
    } catch (error) {
      this.logger.warn("Failed to fetch ADMIN_EMAIL from database, using environment variable");
    }
    return this.configService.get<string>("ADMIN_EMAIL") || "admin@juellehairgh.com";
  }

  /**
   * Helper function to get product image URL for emails
   */
  private getProductImageUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath) return null;

    // Handle absolute URLs
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Handle media library paths (new format)
    if (imagePath.startsWith("/media/library/")) {
      return `${this.siteUrl}${imagePath}`;
    }

    // Handle old product paths
    if (imagePath.startsWith("/media/products/")) {
      return `${this.siteUrl}${imagePath}`;
    }

    // Handle paths that include /products/ or start with products/
    if (imagePath.includes("/products/") || imagePath.startsWith("products/")) {
      const filename = imagePath.split("/").pop() || imagePath;
      return `${this.siteUrl}/media/products/${filename}`;
    }

    // Extract filename from any path format and assume it's a product image
    const filename = imagePath.split("/").pop() || imagePath;
    return `${this.siteUrl}/media/products/${filename}`;
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user: { email: string; name?: string | null }) {
    try {
      const subject = `Welcome to ${this.siteName}!`;
      await this.mailerService.sendMail({
        to: user.email,
        subject,
        template: "customer/welcome",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          customerName: user.name || "there",
          accountUrl: `${this.siteUrl}/account`,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}:`,
        error,
      );
    }
  }

  /**
   * Send order confirmation email to customer
   */
  async sendOrderConfirmation(order: any) {
    try {
      const orderItems =
        order.items?.map((item: any) => {
          // Handle multiple variants (variantIds) or single variant (variantId)
          let variantText = null;
          if (
            item.variantIds &&
            item.variantIds.length > 0 &&
            item.product?.variants
          ) {
            // Resolve variantIds to variant names and values
            const variantDetails = item.variantIds
              .map((vid: string) => {
                const variant = item.product.variants.find(
                  (v: any) => v.id === vid,
                );
                return variant ? `${variant.name}: ${variant.value}` : null;
              })
              .filter(Boolean);
            variantText =
              variantDetails.length > 0 ? variantDetails.join(", ") : null;
          } else if (item.variant) {
            variantText = `${item.variant.name}: ${item.variant.value}`;
          }

          // Get product image (first image from product or variant)
          let productImage = null;
          if (item.product?.images && item.product.images.length > 0) {
            productImage = this.getProductImageUrl(item.product.images[0]);
          } else if (item.variant?.image) {
            productImage = this.getProductImageUrl(item.variant.image);
          }

          return {
            name: item.product?.title || "Product",
            variant: variantText,
            quantity: item.quantity,
            price: Number(item.priceGhs).toFixed(2),
            total: (Number(item.priceGhs) * item.quantity).toFixed(2),
            image: productImage,
          };
        }) || [];

      const total = Number(order.totalGhs).toFixed(2);
      const currency = order.displayCurrency || "GHS";
      const subtotal = orderItems
        .reduce((sum: number, item: any) => sum + parseFloat(item.total), 0)
        .toFixed(2);
      const shippingCost = (parseFloat(total) - parseFloat(subtotal)).toFixed(
        2,
      );

      const subject = `Order Confirmation - Order #${order.id.slice(0, 8).toUpperCase()}`;
      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject,
        template: "customer/order-confirmation",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          customerName:
            order.user?.name || order.shippingAddress?.firstName || "Customer",
          orderItems,
          subtotal,
          shippingCost,
          total,
          currency,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentStatus: order.paymentStatus,
          shippingMethod: order.shippingMethod || "Standard Shipping",
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
          paymentUrl:
            order.paymentStatus === "PENDING"
              ? `${this.siteUrl}/checkout/payment/${order.id}`
              : null,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Order confirmation email sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email:`, error);
    }
  }

  /**
   * Send payment confirmation email to customer
   */
  async sendPaymentConfirmation(order: any) {
    try {
      const subject = `Payment Received - Order #${order.id.slice(0, 8).toUpperCase()}`;
      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject,
        template: "customer/payment-confirmation",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName:
            order.user?.name || order.shippingAddress?.firstName || "Customer",
          total: Number(order.totalGhs).toFixed(2),
          currency: order.displayCurrency || "GHS",
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Payment confirmation email sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send payment confirmation email:`, error);
    }
  }

  /**
   * Send order shipped email to customer
   */
  async sendOrderShipped(order: any, trackingNumber?: string) {
    try {
      const orderItems =
        order.items?.map((item: any) => {
          // Get product image (first image from product or variant)
          let productImage = null;
          if (item.product?.images && item.product.images.length > 0) {
            productImage = this.getProductImageUrl(item.product.images[0]);
          } else if (item.variant?.image) {
            productImage = this.getProductImageUrl(item.variant.image);
          }

          return {
            name: item.product?.title || "Product",
            variant: item.variant
              ? `${item.variant.name}: ${item.variant.value}`
              : null,
            quantity: item.quantity,
            image: productImage,
          };
        }) || [];

      const finalTrackingNumber =
        trackingNumber || order.trackingNumber || "N/A";
      const subject = `Your Order Has Been Shipped - Order #${order.id.slice(0, 8).toUpperCase()}`;

      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject,
        template: "customer/order-shipped",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName:
            order.user?.name || order.shippingAddress?.firstName || "Customer",
          trackingNumber: finalTrackingNumber,
          shippingMethod: order.shippingMethod || "Standard Shipping",
          orderItems,
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
          trackingUrl:
            finalTrackingNumber !== "N/A"
              ? `${this.siteUrl}/orders/track?orderId=${order.id}`
              : null,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Order shipped email sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send order shipped email:`, error);
    }
  }

  /**
   * Send order delivered email to customer
   */
  async sendOrderDelivered(order: any) {
    try {
      const orderItems =
        order.items?.map((item: any) => {
          // Get product image (first image from product or variant)
          let productImage = null;
          if (item.product?.images && item.product.images.length > 0) {
            productImage = this.getProductImageUrl(item.product.images[0]);
          } else if (item.variant?.image) {
            productImage = this.getProductImageUrl(item.variant.image);
          }

          return {
            name: item.product?.title || "Product",
            variant: item.variant
              ? `${item.variant.name}: ${item.variant.value}`
              : null,
            quantity: item.quantity,
            image: productImage,
          };
        }) || [];
      const subject = `Your Order Has Been Delivered - Order #${order.id.slice(0, 8).toUpperCase()}`;

      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject,
        template: "customer/order-delivered",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName:
            order.user?.name || order.shippingAddress?.firstName || "Customer",
          orderItems,
          deliveryDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          trackingNumber: order.trackingNumber || null,
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
          reviewUrl: `${this.siteUrl}/products/${order.items?.[0]?.productId}/review`,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Order delivered email sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send order delivered email:`, error);
    }
  }

  /**
   * Send order cancelled email to customer
   */
  async sendOrderCancelled(order: any, reason?: string) {
    try {
      const subject = `Order Cancelled - Order #${order.id.slice(0, 8).toUpperCase()}`;
      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject,
        template: "customer/order-cancelled",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName:
            order.user?.name || order.shippingAddress?.firstName || "Customer",
          reason: reason || "Order was cancelled",
          refundInfo:
            order.paymentStatus === "PAID"
              ? "A refund will be processed within 5-7 business days."
              : null,
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Order cancelled email sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send order cancelled email:`, error);
    }
  }

  /**
   * Send new order notification to admin
   */
  async sendAdminNewOrder(order: any) {
    try {
      this.logger.log(`Attempting to send admin new order notification for order ${order.id}`);
      
      const orderItems =
        order.items?.map((item: any) => {
          // Handle multiple variants (variantIds) or single variant (variantId)
          let variantText = null;
          if (
            item.variantIds &&
            item.variantIds.length > 0 &&
            item.product?.variants
          ) {
            // Resolve variantIds to variant names and values
            const variantDetails = item.variantIds
              .map((vid: string) => {
                const variant = item.product.variants.find(
                  (v: any) => v.id === vid,
                );
                return variant ? `${variant.name}: ${variant.value}` : null;
              })
              .filter(Boolean);
            variantText =
              variantDetails.length > 0 ? variantDetails.join(", ") : null;
          } else if (item.variant) {
            variantText = `${item.variant.name}: ${item.variant.value}`;
          }

          // Get product image (first image from product or variant)
          let productImage = null;
          if (item.product?.images && item.product.images.length > 0) {
            productImage = this.getProductImageUrl(item.product.images[0]);
          } else if (item.variant?.image) {
            productImage = this.getProductImageUrl(item.variant.image);
          }

          return {
            name: item.product?.title || "Product",
            variant: variantText,
            quantity: item.quantity,
            price: Number(item.priceGhs).toFixed(2),
            total: (Number(item.priceGhs) * item.quantity).toFixed(2),
            image: productImage,
          };
        }) || [];

      const adminEmail = await this.getAdminEmail();
      this.logger.log(`Admin email retrieved: ${adminEmail}`);
      
      if (!adminEmail || adminEmail === "admin@juellehairgh.com") {
        this.logger.warn(`Admin email may not be configured correctly: ${adminEmail}`);
      }
      
      const subject = `New Order Received - Order #${order.id.slice(0, 8).toUpperCase()}`;
      this.logger.log(`Sending email to ${adminEmail} with subject: ${subject}`);
      
      await this.mailerService.sendMail({
        to: adminEmail,
        subject,
        template: "admin/new-order",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          customerName:
            order.user?.name || order.shippingAddress?.firstName || "Customer",
          customerEmail:
            order.user?.email || order.shippingAddress?.email || "N/A",
          orderItems,
          total: Number(order.totalGhs).toFixed(2),
          currency: order.displayCurrency || "GHS",
          paymentStatus: order.paymentStatus,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          adminOrderUrl: `${this.siteUrl}/admin/orders/${order.id}`,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(
        `New order notification sent to admin for order ${order.id}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send admin new order notification for order ${order?.id}:`, error);
      this.logger.error(`Error details: ${JSON.stringify({
        message: error?.message,
        stack: error?.stack,
        orderId: order?.id,
      })}`);
    }
  }

  /**
   * Send payment received notification to admin
   */
  async sendAdminPaymentReceived(order: any) {
    try {
      const transaction = order.paymentReference || "N/A";

      const adminEmail = await this.getAdminEmail();
      const subject = `Payment Received - Order #${order.id.slice(0, 8).toUpperCase()}`;
      await this.mailerService.sendMail({
        to: adminEmail,
        subject,
        template: "admin/payment-received",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          customerName:
            order.user?.name || order.shippingAddress?.firstName || "Customer",
          customerEmail:
            order.user?.email || order.shippingAddress?.email || "N/A",
          total: Number(order.totalGhs).toFixed(2),
          currency: order.displayCurrency || "GHS",
          paymentMethod: "Paystack",
          transactionReference: transaction,
          itemCount: order.items?.length || 0,
          shippingMethod: order.shippingMethod || "N/A",
          adminOrderUrl: `${this.siteUrl}/admin/orders/${order.id}`,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(
        `Payment received notification sent to admin for order ${order.id}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send admin payment notification:`, error);
    }
  }

  /**
   * Send new customer registration notification to admin
   */
  async sendAdminNewCustomer(user: {
    email: string;
    name?: string | null;
    createdAt: Date;
  }) {
    try {
      const adminEmail = await this.getAdminEmail();
      const subject = `New Customer Registration - ${user.email}`;
      await this.mailerService.sendMail({
        to: adminEmail,
        subject,
        template: "admin/new-customer",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          customerName: user.name || "N/A",
          customerEmail: user.email,
          registrationDate: new Date(user.createdAt).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
          adminUsersUrl: `${this.siteUrl}/admin/users`,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(
        `New customer notification sent to admin for ${user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send admin new customer notification:`,
        error,
      );
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string | null,
    resetToken: string,
  ) {
    try {
      const subject = `Reset Your Password - ${this.siteName}`;
      const resetUrl = `${this.siteUrl}/auth/reset-password?token=${resetToken}`;
      await this.mailerService.sendMail({
        to: email,
        subject,
        template: "customer/password-reset",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          customerName: name || "there",
          resetUrl,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  /**
   * Send test email to verify email configuration
   */
  async sendTestEmail(to: string) {
    try {
      const subject = `Test Email from ${this.siteName}`;
      await this.mailerService.sendMail({
        to,
        subject,
        template: "customer/welcome",
        context: {
          subject,
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          logoUrl: this.logoUrl,
          customerName: "Test User",
          accountUrl: `${this.siteUrl}/account`,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Test email sent successfully to ${to}`);
      return {
        success: true,
        message: `Test email sent successfully to ${to}`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to send test email to ${to}:`, error);
      const errorMessage =
        error?.response?.body?.errors?.[0]?.message ||
        error?.message ||
        "Unknown error";
      throw new Error(`Failed to send test email: ${errorMessage}`);
    }
  }
}
