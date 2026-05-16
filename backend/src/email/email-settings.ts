import { ConfigService } from "@nestjs/config";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { PrismaService } from "../prisma/prisma.service";

const EMAIL_SETTING_KEYS = [
  "EMAIL_PROVIDER",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "EMAIL_FROM",
  "EMAIL_FROM_NAME",
  "SENDGRID_API_KEY",
] as const;

export type EmailSettingKey = (typeof EMAIL_SETTING_KEYS)[number];

export interface ResolvedEmailSettings {
  provider: string;
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  fromName: string;
  sendgridApiKey: string;
}

function pick(
  map: Record<string, string>,
  configService: ConfigService,
  key: EmailSettingKey,
  fallback = "",
): string {
  const fromDb = map[key]?.trim();
  if (fromDb) return fromDb;
  const fromEnv = configService.get<string>(key)?.trim();
  if (fromEnv) return fromEnv;
  return fallback;
}

export async function loadEmailSettings(
  prisma: PrismaService,
  configService: ConfigService,
): Promise<ResolvedEmailSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...EMAIL_SETTING_KEYS] } },
  });
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    provider: pick(map, configService, "EMAIL_PROVIDER", "smtp"),
    host: pick(map, configService, "SMTP_HOST", "smtp.gmail.com"),
    port: parseInt(pick(map, configService, "SMTP_PORT", "587"), 10) || 587,
    user: pick(map, configService, "SMTP_USER"),
    password: pick(map, configService, "SMTP_PASSWORD"),
    from:
      pick(map, configService, "EMAIL_FROM") ||
      configService.get<string>("EMAIL_FROM") ||
      "noreply@juellehairgh.com",
    fromName:
      pick(map, configService, "EMAIL_FROM_NAME") ||
      configService.get<string>("EMAIL_FROM_NAME") ||
      "Juelle Hair Ghana",
    sendgridApiKey: pick(map, configService, "SENDGRID_API_KEY"),
  };
}

export function isSmtpConfigured(settings: ResolvedEmailSettings): boolean {
  if (settings.provider === "sendgrid" && settings.sendgridApiKey) {
    return true;
  }
  return Boolean(settings.user && settings.password);
}

export function buildSmtpTransportOptions(
  settings: ResolvedEmailSettings,
): SMTPTransport.Options {
  if (settings.provider === "sendgrid" && settings.sendgridApiKey) {
    return {
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: settings.sendgridApiKey,
      },
    };
  }

  const transport: SMTPTransport.Options = {
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    tls: {
      rejectUnauthorized: false,
    },
  };

  if (settings.user && settings.password) {
    transport.auth = {
      user: settings.user,
      pass: settings.password,
    };
  }

  return transport;
}

export function formatFromAddress(settings: ResolvedEmailSettings): string {
  return `"${settings.fromName}" <${settings.from}>`;
}
