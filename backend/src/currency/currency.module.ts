import { Module } from "@nestjs/common";
import { CurrencyService } from "./currency.service";
import { CurrencyController } from "./currency.controller";
import { CurrencyScheduler } from "./currency.scheduler";

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService, CurrencyScheduler],
  exports: [CurrencyService],
})
export class CurrencyModule {}
