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
  private readonly adminEmail: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {
    this.siteUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:8002";
    this.siteEmail = this.configService.get<string>("EMAIL_FROM") || "noreply@juellehairgh.com";
    this.adminEmail = this.configService.get<string>("ADMIN_EMAIL") || "admin@juellehairgh.com";
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user: { email: string; name?: string | null }) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Welcome to ${this.siteName}!`,
        template: "customer/welcome",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          customerName: user.name || "there",
          accountUrl: `${this.siteUrl}/account`,
        },
      });
      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}:`, error);
    }
  }

  /**
   * Send order confirmation email to customer
   */
  async sendOrderConfirmation(order: any) {
    try {
      const orderItems = order.items?.map((item: any) => {
        // Handle multiple variants (variantIds) or single variant (variantId)
        let variantText = null;
        if (item.variantIds && item.variantIds.length > 0 && item.product?.variants) {
          // Resolve variantIds to variant names and values
          const variantDetails = item.variantIds
            .map((vid: string) => {
              const variant = item.product.variants.find((v: any) => v.id === vid);
              return variant ? `${variant.name}: ${variant.value}` : null;
            })
            .filter(Boolean);
          variantText = variantDetails.length > 0 ? variantDetails.join(', ') : null;
        } else if (item.variant) {
          variantText = `${item.variant.name}: ${item.variant.value}`;
        }
        
        return {
          name: item.product?.title || "Product",
          variant: variantText,
          quantity: item.quantity,
          price: Number(item.priceGhs).toFixed(2),
          total: (Number(item.priceGhs) * item.quantity).toFixed(2),
        };
      }) || [];

      const total = Number(order.totalGhs).toFixed(2);
      const currency = order.displayCurrency || "GHS";
      const subtotal = orderItems.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0).toFixed(2);
      const shippingCost = (parseFloat(total) - parseFloat(subtotal)).toFixed(2);

      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject: `Order Confirmation - Order #${order.id.slice(0, 8).toUpperCase()}`,
        template: "customer/order-confirmation",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          customerName: order.user?.name || order.shippingAddress?.firstName || "Customer",
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
          paymentUrl: order.paymentStatus === "PENDING" ? `${this.siteUrl}/checkout/payment/${order.id}` : null,
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
      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject: `Payment Received - Order #${order.id.slice(0, 8).toUpperCase()}`,
        template: "customer/payment-confirmation",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName: order.user?.name || order.shippingAddress?.firstName || "Customer",
          total: Number(order.totalGhs).toFixed(2),
          currency: order.displayCurrency || "GHS",
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
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
      const orderItems = order.items?.map((item: any) => ({
        name: item.product?.title || "Product",
        variant: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
        quantity: item.quantity,
      })) || [];

      const finalTrackingNumber = trackingNumber || order.trackingNumber || "N/A";
      
      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject: `Your Order Has Been Shipped - Order #${order.id.slice(0, 8).toUpperCase()}`,
        template: "customer/order-shipped",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName: order.user?.name || order.shippingAddress?.firstName || "Customer",
          trackingNumber: finalTrackingNumber,
          shippingMethod: order.shippingMethod || "Standard Shipping",
          orderItems,
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
          trackingUrl: finalTrackingNumber !== "N/A" ? `${this.siteUrl}/orders/track?orderId=${order.id}` : null,
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
      const orderItems = order.items?.map((item: any) => ({
        name: item.product?.title || "Product",
        variant: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
        quantity: item.quantity,
      })) || [];

      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject: `Your Order Has Been Delivered - Order #${order.id.slice(0, 8).toUpperCase()}`,
        template: "customer/order-delivered",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName: order.user?.name || order.shippingAddress?.firstName || "Customer",
          orderItems,
          deliveryDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          trackingNumber: order.trackingNumber || null,
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
          reviewUrl: `${this.siteUrl}/products/${order.items?.[0]?.productId}/review`,
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
      await this.mailerService.sendMail({
        to: order.user?.email || order.shippingAddress?.email,
        subject: `Order Cancelled - Order #${order.id.slice(0, 8).toUpperCase()}`,
        template: "customer/order-cancelled",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName: order.user?.name || order.shippingAddress?.firstName || "Customer",
          reason: reason || "Order was cancelled",
          refundInfo: order.paymentStatus === "PAID" ? "A refund will be processed within 5-7 business days." : null,
          orderUrl: `${this.siteUrl}/account/orders/${order.id}`,
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
      const orderItems = order.items?.map((item: any) => {
        // Handle multiple variants (variantIds) or single variant (variantId)
        let variantText = null;
        if (item.variantIds && item.variantIds.length > 0 && item.product?.variants) {
          // Resolve variantIds to variant names and values
          const variantDetails = item.variantIds
            .map((vid: string) => {
              const variant = item.product.variants.find((v: any) => v.id === vid);
              return variant ? `${variant.name}: ${variant.value}` : null;
            })
            .filter(Boolean);
          variantText = variantDetails.length > 0 ? variantDetails.join(', ') : null;
        } else if (item.variant) {
          variantText = `${item.variant.name}: ${item.variant.value}`;
        }
        
        return {
          name: item.product?.title || "Product",
          variant: variantText,
          quantity: item.quantity,
          price: Number(item.priceGhs).toFixed(2),
          total: (Number(item.priceGhs) * item.quantity).toFixed(2),
        };
      }) || [];

      await this.mailerService.sendMail({
        to: this.adminEmail,
        subject: `New Order Received - Order #${order.id.slice(0, 8).toUpperCase()}`,
        template: "admin/new-order",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          customerName: order.user?.name || order.shippingAddress?.firstName || "Customer",
          customerEmail: order.user?.email || order.shippingAddress?.email || "N/A",
          orderItems,
          total: Number(order.totalGhs).toFixed(2),
          currency: order.displayCurrency || "GHS",
          paymentStatus: order.paymentStatus,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          adminOrderUrl: `${this.siteUrl}/admin/orders/${order.id}`,
        },
      });
      this.logger.log(`New order notification sent to admin for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send admin new order notification:`, error);
    }
  }

  /**
   * Send payment received notification to admin
   */
  async sendAdminPaymentReceived(order: any) {
    try {
      const transaction = order.paymentReference || "N/A";
      
      await this.mailerService.sendMail({
        to: this.adminEmail,
        subject: `Payment Received - Order #${order.id.slice(0, 8).toUpperCase()}`,
        template: "admin/payment-received",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          customerName: order.user?.name || order.shippingAddress?.firstName || "Customer",
          customerEmail: order.user?.email || order.shippingAddress?.email || "N/A",
          total: Number(order.totalGhs).toFixed(2),
          currency: order.displayCurrency || "GHS",
          paymentMethod: "Paystack",
          transactionReference: transaction,
          itemCount: order.items?.length || 0,
          shippingMethod: order.shippingMethod || "N/A",
          adminOrderUrl: `${this.siteUrl}/admin/orders/${order.id}`,
        },
      });
      this.logger.log(`Payment received notification sent to admin for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send admin payment notification:`, error);
    }
  }

  /**
   * Send new customer registration notification to admin
   */
  async sendAdminNewCustomer(user: { email: string; name?: string | null; createdAt: Date }) {
    try {
      await this.mailerService.sendMail({
        to: this.adminEmail,
        subject: `New Customer Registration - ${user.email}`,
        template: "admin/new-customer",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          customerName: user.name || "N/A",
          customerEmail: user.email,
          registrationDate: new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          adminUsersUrl: `${this.siteUrl}/admin/users`,
        },
      });
      this.logger.log(`New customer notification sent to admin for ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send admin new customer notification:`, error);
    }
  }

  /**
   * Send test email to verify email configuration
   */
  async sendTestEmail(to: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `Test Email from ${this.siteName}`,
        template: "customer/welcome",
        context: {
          siteName: this.siteName,
          siteUrl: this.siteUrl,
          customerName: "Test User",
          accountUrl: `${this.siteUrl}/account`,
        },
      });
      this.logger.log(`Test email sent successfully to ${to}`);
      return { success: true, message: `Test email sent successfully to ${to}` };
    } catch (error: any) {
      this.logger.error(`Failed to send test email to ${to}:`, error);
      const errorMessage = error?.response?.body?.errors?.[0]?.message || error?.message || "Unknown error";
      throw new Error(`Failed to send test email: ${errorMessage}`);
    }
  }
}

