import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ContactService {
  constructor(
    private mailerService: MailerService,
    private prisma: PrismaService,
  ) {}

  async handleContactSubmission(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) {
    // Get admin email from settings
    const adminEmailSetting = await this.prisma.setting.findUnique({
      where: { key: "ADMIN_EMAIL" },
    });
    const adminEmail = adminEmailSetting?.value || "admin@juellehairgh.com";

    // Send email to admin
    try {
      await this.mailerService.sendMail({
        to: adminEmail,
        subject: `Contact Form: ${data.subject || "New Message"}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p>${data.message.replace(/\n/g, "<br>")}</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send contact form email:", error);
      // Still return success to user even if email fails
    }

    return { success: true, message: "Message sent successfully" };
  }
}
