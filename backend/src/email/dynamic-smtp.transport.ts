import type { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { PrismaService } from "../prisma/prisma.service";
import {
  buildSmtpTransportOptions,
  formatFromAddress,
  isSmtpConfigured,
  loadEmailSettings,
} from "./email-settings";

export function createDynamicSmtpTransport(
  prisma: PrismaService,
  configService: ConfigService,
): nodemailer.Transport {
  return {
    name: "dynamic-smtp",
    version: "1.0.0",
    send(
      mail: { data: nodemailer.SendMailOptions },
      callback: (err: Error | null, info?: unknown) => void,
    ) {
      loadEmailSettings(prisma, configService)
        .then((settings) => {
          if (!isSmtpConfigured(settings)) {
            throw new Error(
              "SMTP is not configured. Set SMTP_USER and SMTP_PASSWORD in Admin → Settings → Email, or set them as environment variables on the server, then redeploy if using env vars only.",
            );
          }

          const data = mail.data;
          if (!data.from) {
            data.from = formatFromAddress(settings);
          }

          const transporter = nodemailer.createTransport(
            buildSmtpTransportOptions(settings),
          );
          return transporter.sendMail(data, callback);
        })
        .catch((err: Error) => callback(err));
    },
  } as nodemailer.Transport;
}
