import { Module } from "@nestjs/common";
import { TrustBadgesController } from "./trust-badges.controller";
import { TrustBadgesService } from "./trust-badges.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TrustBadgesController],
  providers: [TrustBadgesService],
  exports: [TrustBadgesService],
})
export class TrustBadgesModule {}
