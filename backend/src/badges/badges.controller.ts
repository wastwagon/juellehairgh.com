import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { BadgesService } from "./badges.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("badges")
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get("templates")
  async getTemplates() {
    return this.badgesService.getActiveTemplates();
  }

  @Get("admin/templates")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getAllTemplates() {
    return this.badgesService.getAllTemplates();
  }

  @Get("admin/templates/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getTemplate(@Param("id") id: string) {
    return this.badgesService.getTemplate(id);
  }

  @Post("admin/templates")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async createTemplate(@Body() data: any) {
    return this.badgesService.createTemplate(data);
  }

  @Put("admin/templates/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async updateTemplate(@Param("id") id: string, @Body() data: any) {
    return this.badgesService.updateTemplate(id, data);
  }

  @Delete("admin/templates/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async deleteTemplate(@Param("id") id: string) {
    return this.badgesService.deleteTemplate(id);
  }
}
