import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { UploadController } from "./upload.controller";
import { ProductsModule } from "../products/products.module";
import { OrdersModule } from "../orders/orders.module";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [ProductsModule, OrdersModule, PrismaModule, EmailModule],
  controllers: [AdminController, UploadController],
  providers: [AdminService],
})
export class AdminModule {}
