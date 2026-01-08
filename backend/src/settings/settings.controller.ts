import { Controller, Get } from "@nestjs/common";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

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
