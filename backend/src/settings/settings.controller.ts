import { Controller, Get } from "@nestjs/common";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get("site")
  async getSiteSettings() {
    return this.settingsService.getSiteSettings();
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
}
