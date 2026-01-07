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
import { BlogService } from "./blog.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("blog")
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  async getPosts(@Query() query: any) {
    return this.blogService.getAllPosts({
      category: query.category,
      published:
        query.published !== undefined ? query.published === "true" : true,
      limit: query.limit ? parseInt(query.limit) : 10,
      page: query.page ? parseInt(query.page) : 1,
    });
  }

  @Get("categories")
  async getCategories() {
    return this.blogService.getCategories();
  }

  @Get(":slug")
  async getPost(@Param("slug") slug: string) {
    return this.blogService.getPost(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async createPost(@Body() data: any) {
    return this.blogService.createPost(data);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async updatePost(@Param("id") id: string, @Body() data: any) {
    return this.blogService.updatePost(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async deletePost(@Param("id") id: string) {
    return this.blogService.deletePost(id);
  }
}
