import { Controller, Get, Param } from "@nestjs/common";
import { CollectionsService } from "./collections.service";

@Controller("collections")
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  async findAll() {
    return this.collectionsService.findAll();
  }

  @Get(":slug")
  async findOne(@Param("slug") slug: string) {
    return this.collectionsService.findOne(slug);
  }
}






