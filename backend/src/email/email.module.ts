import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
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
        try {
          // Add timeout to prevent blocking startup
          const getSetting = async (key: string, defaultValue: string) => {
            try {
              // Set a timeout to prevent blocking startup if database is slow
              const timeoutPromise = new Promise<string>((resolve) => {
                setTimeout(
                  () => resolve(configService.get(key) || defaultValue),
                  1000,
                );
              });

              const dbPromise = prisma.setting
                .findUnique({ where: { key } })
                .then(
                  (setting) =>
                    setting?.value || configService.get(key) || defaultValue,
                )
                .catch(() => configService.get(key) || defaultValue);

              // Race between database query and timeout
              return Promise.race([dbPromise, timeoutPromise]);
            } catch (error: any) {
              // If database is unavailable, use environment variables or defaults
              // This allows the app to start even if database connection fails initially
              console.warn(
                `⚠️ Could not fetch setting "${key}" from database, using env/default:`,
                error?.message || "Unknown error",
              );
              return configService.get(key) || defaultValue;
            }
          };

          const emailProvider = await getSetting("EMAIL_PROVIDER", "smtp");

          if (emailProvider === "smtp" || !emailProvider) {
            const smtpHost = await getSetting("SMTP_HOST", "smtp.gmail.com");
            const smtpPort = parseInt(await getSetting("SMTP_PORT", "587"));
            const smtpUser = await getSetting("SMTP_USER", "");
            const smtpPassword = await getSetting("SMTP_PASSWORD", "");
            const emailFrom = await getSetting("EMAIL_FROM", configService.get("EMAIL_FROM") || "noreply@juellehairgh.com");
            const emailFromName = await getSetting("EMAIL_FROM_NAME", configService.get("EMAIL_FROM_NAME") || "Juelle Hair Ghana");

            return {
              transport: {
                host: smtpHost,
                port: smtpPort,
                secure: false,
                auth: {
                  user: smtpUser,
                  pass: smtpPassword,
                },
                tls: {
                  rejectUnauthorized: false, // Allow self-signed or mismatched certificates
                },
              },
              defaults: {
                from: `"${emailFromName}" <${emailFrom}>`,
              },
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
          }

          if (emailProvider === "sendgrid") {
            const sendgridApiKey = await getSetting("SENDGRID_API_KEY", "");
            if (!sendgridApiKey) {
              console.warn(
                "SENDGRID_API_KEY not configured. Falling back to SMTP configuration.",
              );
              const smtpHost = await getSetting("SMTP_HOST", "smtp.gmail.com");
              const smtpPort = parseInt(await getSetting("SMTP_PORT", "587"));
              const smtpUser = await getSetting("SMTP_USER", "");
              const smtpPassword = await getSetting("SMTP_PASSWORD", "");

              return {
                transport: {
                  host: smtpHost,
                  port: smtpPort,
                  secure: false,
                  auth: {
                    user: smtpUser,
                    pass: smtpPassword,
                  },
                  tls: {
                    rejectUnauthorized: false, // Allow self-signed or mismatched certificates
                  },
                },
                defaults: {
                  from: `"${await getSetting("EMAIL_FROM_NAME", configService.get("EMAIL_FROM_NAME") || "Juelle Hair Ghana")}" <${await getSetting("EMAIL_FROM", configService.get("EMAIL_FROM") || "noreply@juellehairgh.com")}>`,
                },
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
            }

            const emailFrom = await getSetting("EMAIL_FROM", configService.get("EMAIL_FROM") || "noreply@juellehairgh.com");
            const emailFromName = await getSetting("EMAIL_FROM_NAME", configService.get("EMAIL_FROM_NAME") || "Juelle Hair Ghana");

            return {
              transport: {
                host: "smtp.sendgrid.net",
                port: 587,
                secure: false,
                auth: {
                  user: "apikey",
                  pass: sendgridApiKey,
                },
              },
              defaults: {
                from: `"${emailFromName}" <${emailFrom}>`,
              },
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
          }

          if (emailProvider === "mailgun") {
            const mailgunApiKey = configService.get("MAILGUN_API_KEY");
            const mailgunDomain = configService.get("MAILGUN_DOMAIN");
            if (!mailgunApiKey || !mailgunDomain) {
              throw new Error(
                "MAILGUN_API_KEY and MAILGUN_DOMAIN are required when EMAIL_PROVIDER is 'mailgun'",
              );
            }

            const emailFrom = await getSetting("EMAIL_FROM", configService.get("EMAIL_FROM") || `noreply@${mailgunDomain}`);
            const emailFromName = await getSetting("EMAIL_FROM_NAME", configService.get("EMAIL_FROM_NAME") || "Juelle Hair Ghana");

            return {
              transport: {
                host: `smtp.mailgun.org`,
                port: 587,
                secure: false,
                auth: {
                  user: `postmaster@${mailgunDomain}`,
                  pass: mailgunApiKey,
                },
              },
              defaults: {
                from: `"${emailFromName}" <${emailFrom}>`,
              },
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
          }

          throw new Error(`Unsupported EMAIL_PROVIDER: ${emailProvider}`);
        } catch (error: any) {
          // If email module initialization fails, provide a minimal fallback config
          // This allows the app to start even if email configuration is invalid
          console.error(
            "❌ Email module initialization failed, using fallback config:",
            error?.message || "Unknown error",
          );
          // Fallback: use environment variables directly (database might not be available)
          const emailFrom = configService.get("EMAIL_FROM") || "noreply@juellehairgh.com";
          const emailFromName = configService.get("EMAIL_FROM_NAME") || "Juelle Hair Ghana";

          return {
            transport: {
              host: configService.get("SMTP_HOST") || "smtp.gmail.com",
              port: parseInt(configService.get("SMTP_PORT") || "587"),
              secure: false,
              auth: {
                user: configService.get("SMTP_USER") || "",
                pass: configService.get("SMTP_PASSWORD") || "",
              },
              tls: {
                rejectUnauthorized: false, // Allow self-signed or mismatched certificates
              },
            },
            defaults: {
              from: `"${emailFromName}" <${emailFrom}>`,
            },
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
        }
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
