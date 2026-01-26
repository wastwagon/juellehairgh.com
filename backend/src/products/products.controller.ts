import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("products")
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get("recommendations/:id")
  async getRecommendations(
    @Param("id") id: string,
    @Query("limit") limit?: string,
  ) {
    return this.productsService.getRecommendations(
      id,
      limit ? parseInt(limit) : 8,
    );
  }

  @Get("frequently-bought-together/:id")
  async getFrequentlyBoughtTogether(
    @Param("id") id: string,
    @Query("limit") limit?: string,
  ) {
    return this.productsService.getFrequentlyBoughtTogether(
      id,
      limit ? parseInt(limit) : 4,
    );
  }

  @Get(":slug")
  async findOne(@Param("slug") slug: string) {
    return this.productsService.findOne(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }

  // Permanent delete (admin only). Refuses if product has order history.
  @Delete(":id/permanent")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async permanentRemove(@Param("id") id: string) {
    return this.productsService.permanentRemove(id);
  }
}
