import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PrismaService } from "../prisma/prisma.service";
import { OrdersService } from "../orders/orders.service";
import { EmailService } from "../email/email.service";
import { WalletService } from "../wallet/wallet.service";
import { ProductsService } from "../products/products.service";

@Injectable()
export class PaymentsService {
  private paystackBaseUrl = "https://api.paystack.co";

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private emailService: EmailService,
    private walletService: WalletService,
    private productsService: ProductsService,
  ) {}

  // Get Paystack secret key from database settings, fallback to environment variable
  private async getPaystackSecretKey(): Promise<string> {
    // Try to get from database first
    const dbSetting = await this.prisma.setting.findUnique({
      where: { key: "PAYSTACK_SECRET_KEY" },
    });

    if (dbSetting?.value) {
      return dbSetting.value;
    }

    // Fallback to environment variable
    const envKey = this.configService.get<string>("PAYSTACK_SECRET_KEY") || "";

    if (!envKey) {
      console.warn(
        "⚠️  PAYSTACK_SECRET_KEY is not set in database or environment variables.",
      );
    }

    return envKey;
  }

  async initializePayment(
    orderIdOrAmount: string | number,
    email: string,
    metadata?: any,
  ) {
    const paystackSecretKey = await this.getPaystackSecretKey();

    if (!paystackSecretKey) {
      throw new BadRequestException(
        "Payment service is not configured. Please set PAYSTACK_SECRET_KEY in admin settings or environment variables.",
      );
    }

    let amountInPesewas: number;
    let reference: string;
    let paymentMetadata: any;

    // Check if this is a wallet top-up (amount is a number) or order payment (orderId is a string)
    if (typeof orderIdOrAmount === "number") {
      // Wallet top-up
      amountInPesewas = Math.round(orderIdOrAmount * 100);
      reference = `WALLET_TOPUP_${Date.now()}`;
      paymentMetadata = {
        type: "wallet_topup",
        ...metadata,
      };
    } else {
      // Order payment
      const orderId = orderIdOrAmount;
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (order.paymentStatus === "PAID") {
        throw new BadRequestException("Order already paid");
      }

      amountInPesewas = Math.round(Number(order.totalGhs) * 100);
      reference = `ORDER_${orderId}_${Date.now()}`;
      paymentMetadata = {
        orderId,
        userId: order.userId,
        displayCurrency: order.displayCurrency || "GHS",
        displayTotal: order.displayTotal?.toString() || "",
        ...metadata,
      };
    }

    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amountInPesewas,
          currency: "GHS",
          reference,
          metadata: paymentMetadata,
          callback_url: `${this.configService.get<string>("FRONTEND_URL")}/checkout/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Update order with payment reference if it's an order
      if (typeof orderIdOrAmount === "string") {
        await this.prisma.order.update({
          where: { id: orderIdOrAmount },
          data: {
            paymentReference: response.data.data.reference,
          },
        });
      }

      return {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to initialize payment";
      console.error("Paystack API Error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Provide more helpful error messages
      if (errorMessage.includes("Invalid") || errorMessage.includes("key")) {
        throw new BadRequestException(
          "Invalid Paystack API key. Please check your PAYSTACK_SECRET_KEY environment variable. " +
            "Get your keys from https://paystack.com/dashboard/settings/developer",
        );
      }

      throw new BadRequestException(errorMessage);
    }
  }

  async verifyPayment(reference: string) {
    const paystackSecretKey = await this.getPaystackSecretKey();

    if (!paystackSecretKey) {
      throw new BadRequestException(
        "Payment service is not configured. Please set PAYSTACK_SECRET_KEY in admin settings or environment variables.",
      );
    }

    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        },
      );

      const transaction = response.data.data;

      if (transaction.status === "success") {
        // Check if this is a wallet top-up
        const metadata = transaction.metadata || {};
        if (metadata.type === "wallet_topup" && metadata.userId) {
          const amount = transaction.amount / 100; // Convert pesewas to GHS
          await this.walletService.topUp(metadata.userId, amount, reference);
          return {
            success: true,
            type: "wallet_topup",
            amount,
            transaction,
          };
        }

        // Find order by payment reference
        const order = await this.prisma.order.findUnique({
          where: { paymentReference: reference },
        });

        if (order) {
          // Verify amount matches (convert pesewas to GHS)
          const paidAmount = transaction.amount / 100;
          const orderAmount = Number(order.totalGhs);

          if (Math.abs(paidAmount - orderAmount) > 0.01) {
            throw new BadRequestException("Payment amount mismatch");
          }

          // Update order status: AWAITING_PAYMENT -> PAID after successful payment
          const updatedOrder = await this.prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: "PAID", // Set to PAID when payment is acknowledged
            },
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
              shippingAddress: true,
              billingAddress: true,
            },
          });

          // Reduce stock for all items in the order
          if (updatedOrder.items && updatedOrder.items.length > 0) {
            await this.productsService.reduceStock(updatedOrder.items);
          }

          // Send payment confirmation email to customer
          try {
            await this.emailService.sendPaymentConfirmation(updatedOrder);
          } catch (error) {
            console.error("Failed to send payment confirmation email:", error);
          }

          // Send payment received notification to admin
          try {
            await this.emailService.sendAdminPaymentReceived(updatedOrder);
          } catch (error) {
            console.error("Failed to send admin payment notification:", error);
          }

          return {
            success: true,
            order: updatedOrder,
            transaction,
          };
        }
      }

      return {
        success: false,
        transaction,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.message || "Failed to verify payment",
      );
    }
  }
}
