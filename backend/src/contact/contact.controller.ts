import { Controller, Post, Body } from "@nestjs/common";
import { ContactService } from "./contact.service";

@Controller("contact")
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  async submitContactForm(
    @Body()
    body: {
      name: string;
      email: string;
      subject?: string;
      message: string;
    },
  ) {
    return this.contactService.handleContactSubmission(body);
  }
}
