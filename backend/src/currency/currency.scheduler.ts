import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { CurrencyService } from "./currency.service";

@Injectable()
export class CurrencyScheduler {
  constructor(private currencyService: CurrencyService) {}

  // Update currency rates every 12 hours at midnight and noon UTC
  @Cron("0 */12 * * *")
  async updateRates() {
    console.log(
      "🔄 [Currency Scheduler] Updating currency rates (scheduled every 12 hours)...",
    );
    const result = await this.currencyService.updateRates();
    if (result.success) {
      console.log(
        "✅ [Currency Scheduler] Currency rates updated successfully",
      );
    } else {
      console.error(
        "❌ [Currency Scheduler] Failed to update currency rates:",
        result.message,
      );
    }
  }
}
