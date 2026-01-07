import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { CartModule } from "../cart/cart.module";
import { EmailModule } from "../email/email.module";
import { WalletModule } from "../wallet/wallet.module";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [CartModule, EmailModule, WalletModule, ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
