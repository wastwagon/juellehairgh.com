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

  async getHeroBanner() {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          in: ["HERO_MOBILE_IMAGE", "HERO_DESKTOP_IMAGE", "HERO_LINK"],
        },
      },
    });
    const obj: Record<string, string> = {};
    settings.forEach((s) => {
      obj[s.key] = s.value || "";
    });
    return {
      mobileImage: obj.HERO_MOBILE_IMAGE || "",
      desktopImage: obj.HERO_DESKTOP_IMAGE || "",
      link: obj.HERO_LINK || "/categories/shop-all",
    };
  }

  async updateHeroBanner(data: {
    mobileImage?: string;
    desktopImage?: string;
    link?: string;
  }) {
    const updates: Array<{ key: string; value: string }> = [];
    if (data.mobileImage !== undefined)
      updates.push({ key: "HERO_MOBILE_IMAGE", value: data.mobileImage });
    if (data.desktopImage !== undefined)
      updates.push({ key: "HERO_DESKTOP_IMAGE", value: data.desktopImage });
    if (data.link !== undefined)
      updates.push({ key: "HERO_LINK", value: data.link });
    for (const { key, value } of updates) {
      await this.prisma.setting.upsert({
        where: { key },
        update: { value, updatedAt: new Date() },
        create: { key, value, category: "hero" },
      });
    }
    return this.getHeroBanner();
  }
}
