import { Controller, Post, Get, Query, Body } from "@nestjs/common";
import { NewsletterService } from "./newsletter.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UseGuards } from "@nestjs/common";

@Controller("newsletter")
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Post("subscribe")
  async subscribe(
    @Body() body: { email: string; name?: string; source?: string },
  ) {
    return this.newsletterService.subscribe(body.email, body.name, body.source);
  }

  @Get("unsubscribe")
  async unsubscribe(@Query("token") token: string) {
    return this.newsletterService.unsubscribe(token);
  }

  @Post("unsubscribe")
  async unsubscribeByEmail(@Body() body: { email: string }) {
    return this.newsletterService.unsubscribeByEmail(body.email);
  }

  @Get("admin/subscribers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getAllSubscribers(@Query("activeOnly") activeOnly?: string) {
    return this.newsletterService.getAllSubscribers(activeOnly === "true");
  }

  @Get("admin/stats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getStats() {
    return this.newsletterService.getSubscriberStats();
  }
}
