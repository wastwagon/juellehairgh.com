import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { createDynamicSmtpTransport } from "./dynamic-smtp.transport";
import {
  formatFromAddress,
  isSmtpConfigured,
  loadEmailSettings,
} from "./email-settings";
import * as path from "path";

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRootAsync({
      imports: [PrismaModule],
      inject: [ConfigService, PrismaService],
      useFactory: async (
        configService: ConfigService,
        prisma: PrismaService,
      ) => {
        const settings = await loadEmailSettings(prisma, configService).catch(
          () => null,
        );

        if (settings) {
          if (isSmtpConfigured(settings)) {
            console.log(
              `✅ Email transport ready (${settings.provider}): ${settings.host}:${settings.port} as ${settings.user || "sendgrid"}`,
            );
          } else {
            console.warn(
              "⚠️ Email SMTP credentials are missing. Order and payment emails will fail until SMTP_USER and SMTP_PASSWORD are set in Admin → Settings or server environment variables.",
            );
          }
        }

        const from =
          settings != null
            ? formatFromAddress(settings)
            : `"Juelle Hair Ghana" <${configService.get("EMAIL_FROM") || "noreply@juellehairgh.com"}>`;

        return {
          transport: createDynamicSmtpTransport(prisma, configService),
          defaults: { from },
          template: {
            dir: path.join(__dirname, "templates"),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          options: {
            partials: {
              dir: path.join(__dirname, "templates", "partials"),
              options: {
                strict: true,
              },
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
