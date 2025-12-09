import { Module } from "@nestjs/common";
import { ContactController } from "./contact.controller";
import { ContactService } from "./contact.service";
import { PrismaModule } from "../prisma/prisma.module";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
