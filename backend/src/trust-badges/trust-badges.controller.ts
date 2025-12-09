import { Controller, Get } from "@nestjs/common";
import { TrustBadgesService } from "./trust-badges.service";

@Controller("trust-badges")
export class TrustBadgesController {
  constructor(private trustBadgesService: TrustBadgesService) {}

  @Get("public")
  async getPublicTrustBadges() {
    return this.trustBadgesService.getPublicTrustBadges();
  }
}
