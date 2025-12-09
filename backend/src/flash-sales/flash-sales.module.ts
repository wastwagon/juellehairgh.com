import { Module } from "@nestjs/common";
import { FlashSalesController } from "./flash-sales.controller";
import { FlashSalesService } from "./flash-sales.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [FlashSalesController],
  providers: [FlashSalesService],
  exports: [FlashSalesService],
})
export class FlashSalesModule {}
