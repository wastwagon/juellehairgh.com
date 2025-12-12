import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AddressesService } from "./addresses.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("addresses")
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Post()
  async create(@Request() req, @Body() addressData: any) {
    return this.addressesService.create(req.user.id, addressData);
  }

  @Get()
  async findAll(@Request() req) {
    return this.addressesService.findAll(req.user.id);
  }

  @Get(":id")
  async findOne(@Request() req, @Param("id") id: string) {
    return this.addressesService.findOne(id, req.user.id);
  }

  @Put(":id")
  async update(@Request() req, @Param("id") id: string, @Body() addressData: any) {
    return this.addressesService.update(id, req.user.id, addressData);
  }

  @Delete(":id")
  async delete(@Request() req, @Param("id") id: string) {
    return this.addressesService.delete(id, req.user.id);
  }

  @Put(":id/default")
  async setDefault(@Request() req, @Param("id") id: string) {
    return this.addressesService.setDefault(id, req.user.id);
  }
}











