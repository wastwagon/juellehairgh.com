import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSiteSettings() {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: [
            "SITE_PHONE",
            "SITE_EMAIL",
            "SOCIAL_FACEBOOK",
            "SOCIAL_INSTAGRAM",
            "SOCIAL_TWITTER",
            "MAINTENANCE_MODE",
          ],
        },
      },
    });

    // Convert array to object
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value || "";
    });

    return {
      phone: settingsObj.SITE_PHONE || "+233 539506949",
      email: settingsObj.SITE_EMAIL || "sales@juellehairgh.com",
      facebook: settingsObj.SOCIAL_FACEBOOK || "",
      instagram: settingsObj.SOCIAL_INSTAGRAM || "",
      twitter: settingsObj.SOCIAL_TWITTER || "",
      maintenanceMode: settingsObj.MAINTENANCE_MODE === "true",
    };
  }

  async getMaintenanceStatus() {
    const setting = await this.prisma.setting.findUnique({
      where: { key: "MAINTENANCE_MODE" },
    });
    return {
      enabled: setting?.value === "true",
    };
  }

  async getPageContent(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });
    return {
      content: setting?.value || "",
    };
  }
}
