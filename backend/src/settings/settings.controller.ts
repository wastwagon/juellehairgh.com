import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("settings")
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get("hero-banner")
  async getHeroBanner() {
    return this.settingsService.getHeroBanner();
  }

  @Put("hero-banner")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateHeroBanner(
    @Body()
    body: { mobileImage?: string; desktopImage?: string; link?: string },
  ) {
    return this.settingsService.updateHeroBanner(body);
  }

  @Get("site")
  async getSiteSettings() {
    return this.settingsService.getSiteSettings();
  }

  @Get("maintenance")
  async getMaintenanceStatus() {
    return this.settingsService.getMaintenanceStatus();
  }

  @Get("about")
  async getAboutContent() {
    return this.settingsService.getPageContent("ABOUT_US");
  }

  @Get("privacy")
  async getPrivacyContent() {
    return this.settingsService.getPageContent("PRIVACY_POLICY");
  }

  @Get("terms")
  async getTermsContent() {
    return this.settingsService.getPageContent("TERMS_CONDITIONS");
  }

  @Get("shipping")
  async getShippingContent() {
    return this.settingsService.getPageContent("SHIPPING_POLICY");
  }

  @Get("returns")
  async getReturnsContent() {
    return this.settingsService.getPageContent("RETURNS_POLICY");
  }

  @Get("faq")
  async getFAQContent() {
    return this.settingsService.getPageContent("FAQ_CONTENT");
  }
}
