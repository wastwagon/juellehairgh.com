import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { OrdersModule } from "../orders/orders.module";
import { CurrencyModule } from "../currency/currency.module";
import { EmailModule } from "../email/email.module";
import { WalletModule } from "../wallet/wallet.module";

@Module({
  imports: [OrdersModule, CurrencyModule, EmailModule, WalletModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
