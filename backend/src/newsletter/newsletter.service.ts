import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailerService } from "@nestjs-modules/mailer";
import * as crypto from "crypto";

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService
  ) {}

  async subscribe(email: string, name?: string, source?: string) {
    // Check if already subscribed
    const existing = await this.prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new BadRequestException("Email is already subscribed to the newsletter");
      } else {
        // Re-subscribe
        const token = crypto.randomBytes(32).toString("hex");
        return this.prisma.newsletter.update({
          where: { email },
          data: {
            isActive: true,
            name: name || existing.name,
            source: source || existing.source,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            token,
          },
        });
      }
    }

    // Create new subscription
    const token = crypto.randomBytes(32).toString("hex");
    const subscription = await this.prisma.newsletter.create({
      data: {
        email,
        name,
        source: source || "footer",
        token,
      },
    });

    // Send confirmation email
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: "Welcome to Juelle Hair Newsletter!",
        template: "newsletter-welcome",
        context: {
          name: name || "Subscriber",
          unsubscribeUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/newsletter/unsubscribe?token=${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to send newsletter confirmation email:", error);
      // Don't fail the subscription if email fails
    }

    return subscription;
  }

  async unsubscribe(token: string) {
    const subscription = await this.prisma.newsletter.findUnique({
      where: { token },
    });

    if (!subscription) {
      throw new NotFoundException("Invalid unsubscribe token");
    }

    return this.prisma.newsletter.update({
      where: { id: subscription.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });
  }

  async unsubscribeByEmail(email: string) {
    const subscription = await this.prisma.newsletter.findUnique({
      where: { email },
    });

    if (!subscription) {
      throw new NotFoundException("Email not found in newsletter list");
    }

    return this.prisma.newsletter.update({
      where: { id: subscription.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });
  }

  async getAllSubscribers(activeOnly: boolean = false) {
    return this.prisma.newsletter.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { subscribedAt: "desc" },
    });
  }

  async getSubscriberStats() {
    const [total, active, inactive] = await Promise.all([
      this.prisma.newsletter.count(),
      this.prisma.newsletter.count({ where: { isActive: true } }),
      this.prisma.newsletter.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}
