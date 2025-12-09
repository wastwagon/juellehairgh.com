import { Controller, Get, Param } from "@nestjs/common";
import { BrandsService } from "./brands.service";

@Controller("brands")
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Get()
  async findAll() {
    return this.brandsService.findAll();
  }

  @Get(":slug")
  async findOne(@Param("slug") slug: string) {
    return this.brandsService.findOne(slug);
  }
}
