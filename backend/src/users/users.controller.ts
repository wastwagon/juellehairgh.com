import { Controller, Get, Put, Post, Body, UseGuards, Request } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Put("me")
  async updateProfile(@Request() req, @Body() updateData: any) {
    return this.usersService.update(req.user.id, updateData);
  }

  @Post("me/change-password")
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    return this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Get("me/statistics")
  async getAccountStatistics(@Request() req) {
    return this.usersService.getAccountStatistics(req.user.id);
  }

  @Post("me/request-deletion")
  async requestAccountDeletion(
    @Request() req,
    @Body() body: { reason?: string }
  ) {
    return this.usersService.requestAccountDeletion(req.user.id, body.reason);
  }

  @Get("me/export-data")
  async exportUserData(@Request() req) {
    return this.usersService.exportUserData(req.user.id);
  }

  @Post("me/delete")
  async deleteAccount(
    @Request() req,
    @Body() body: { password: string }
  ) {
    return this.usersService.deleteAccount(req.user.id, body.password);
  }
}







