import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { ProductsService } from "../products/products.service";
import { OrdersService } from "../orders/orders.service";
import { EmailService } from "../email/email.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";
import * as fs from "fs";
import * as path from "path";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminController {
  constructor(
    private adminService: AdminService,
    private productsService: ProductsService,
    private ordersService: OrdersService,
    private emailService: EmailService,
    private prisma: PrismaService
  ) {}

  @Get("dashboard")
  async getDashboard(@Request() req) {
    return this.adminService.getDashboardStats();
  }

  // Products Management
  @Get("products")
  async getProducts(@Query() query: any) {
    // Remove isActive filter for admin to see all products
    const adminQuery = { ...query, includeInactive: true };
    return this.productsService.findAll(adminQuery);
  }

  @Get("products/:id")
  async getProduct(@Param("id") id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: true,
        seo: true,
      },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  @Post("products")
  async createProduct(@Body() data: any) {
    return this.productsService.create(data);
  }

  @Put("products/:id")
  async updateProduct(@Param("id") id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }

  @Delete("products/:id")
  async deleteProduct(@Param("id") id: string) {
    return this.productsService.remove(id);
  }

  @Post("products/:id/generate-variations")
  async generateVariations(
    @Param("id") id: string,
    @Body() data: { attributes: Array<{ name: string; terms: string[] }> }
  ) {
    return this.adminService.generateVariationsFromAttributes(id, data.attributes);
  }

  // Product Variants Management
  @Get("product-variants")
  async getProductVariants(@Query() query: any) {
    return this.adminService.getAllProductVariants(query);
  }

  @Post("product-variants")
  async createProductVariant(@Body() data: any) {
    return this.adminService.createProductVariant(data);
  }

  @Put("product-variants/:id")
  async updateProductVariant(@Param("id") id: string, @Body() data: any) {
    return this.adminService.updateProductVariant(id, data);
  }

  @Delete("product-variants/:id")
  async deleteProductVariant(@Param("id") id: string) {
    return this.adminService.deleteProductVariant(id);
  }

  // Orders Management
  @Get("orders")
  async getOrders(@Query() query: any) {
    return this.adminService.getAllOrders(query);
  }

  @Get("orders/:id")
  async getOrder(@Param("id") id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    return order;
  }

  @Put("orders/:id/status")
  async updateOrderStatus(
    @Param("id") id: string,
    @Body() data: { status: string; trackingNumber?: string }
  ) {
    return this.ordersService.updateStatus(id, data.status, data.trackingNumber);
  }

  @Put("orders/:id/notes")
  async updateOrderNotes(
    @Param("id") id: string,
    @Body() data: { notes: string }
  ) {
    return this.prisma.order.update({
      where: { id },
      data: { notes: data.notes },
    });
  }

  // Categories Management
  @Get("categories")
  async getCategories() {
    return this.adminService.getAllCategories();
  }

  @Post("categories")
  async createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  @Put("categories/:id")
  async updateCategory(@Param("id") id: string, @Body() data: any) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete("categories/:id")
  async deleteCategory(@Param("id") id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Brands Management
  @Get("brands")
  async getBrands() {
    return this.adminService.getAllBrands();
  }

  @Post("brands")
  async createBrand(@Body() data: any) {
    return this.adminService.createBrand(data);
  }

  @Put("brands/:id")
  async updateBrand(@Param("id") id: string, @Body() data: any) {
    return this.adminService.updateBrand(id, data);
  }

  @Delete("brands/:id")
  async deleteBrand(@Param("id") id: string) {
    return this.adminService.deleteBrand(id);
  }

  // Collections Management
  @Get("collections")
  async getCollections() {
    return this.adminService.getAllCollections();
  }

  @Post("collections")
  async createCollection(@Body() data: any) {
    return this.adminService.createCollection(data);
  }

  @Put("collections/:id")
  async updateCollection(@Param("id") id: string, @Body() data: any) {
    return this.adminService.updateCollection(id, data);
  }

  @Delete("collections/:id")
  async deleteCollection(@Param("id") id: string) {
    return this.adminService.deleteCollection(id);
  }

  @Get("collections/:id")
  async getCollection(@Param("id") id: string) {
    return this.adminService.getCollection(id);
  }

  @Get("collections/:id/products")
  async getCollectionProducts(@Param("id") id: string) {
    return this.adminService.getCollectionProducts(id);
  }

  @Post("collections/:id/products")
  async addProductToCollection(
    @Param("id") id: string,
    @Body() body: { productId: string }
  ) {
    return this.adminService.addProductToCollection(id, body.productId);
  }

  @Delete("collections/:id/products/:collectionProductId")
  async removeProductFromCollection(
    @Param("id") id: string,
    @Param("collectionProductId") collectionProductId: string
  ) {
    return this.adminService.removeProductFromCollection(id, collectionProductId);
  }

  @Put("collections/:id/products/positions")
  async updateProductPositions(
    @Param("id") id: string,
    @Body() body: { updates: { id: string; position: number }[] }
  ) {
    return this.adminService.updateCollectionProductPositions(id, body.updates);
  }

  // Customers Management
  @Get("customers")
  async getCustomers(@Query() query: any) {
    return this.adminService.getAllCustomers(query);
  }

  @Get("customers/:id")
  async getCustomer(@Param("id") id: string) {
    const customer = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        addresses: true,
      },
    });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
    return customer;
  }

  @Put("customers/:id")
  async updateCustomer(@Param("id") id: string, @Body() updateData: any) {
    return this.adminService.updateCustomer(id, updateData);
  }

  @Put("customers/:id/role")
  async updateCustomerRole(@Param("id") id: string, @Body() body: { role: string }) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Delete("customers/:id")
  async deleteCustomer(@Param("id") id: string) {
    // Soft delete by setting deletedAt timestamp
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        deletedAt: true,
      },
    });
  }

  // Attributes Management
  @Get("attributes")
  async getAttributes() {
    return this.adminService.getAllAttributes();
  }

  @Post("attributes")
  async createAttribute(@Body() data: { name: string; description?: string }) {
    return this.adminService.createAttribute(data);
  }

  @Put("attributes/:id")
  async updateAttribute(@Param("id") id: string, @Body() data: { name?: string; description?: string }) {
    return this.adminService.updateAttribute(id, data);
  }

  @Delete("attributes/:id")
  async deleteAttribute(@Param("id") id: string) {
    return this.adminService.deleteAttribute(id);
  }

  // Attribute Terms Management
  @Post("attributes/:attributeId/terms")
  async createAttributeTerm(
    @Param("attributeId") attributeId: string,
    @Body() data: { name: string; image?: string }
  ) {
    return this.adminService.createAttributeTerm(attributeId, data);
  }

  @Put("attribute-terms/:id")
  async updateAttributeTerm(@Param("id") id: string, @Body() data: { name?: string; image?: string }) {
    return this.adminService.updateAttributeTerm(id, data);
  }

  @Delete("attribute-terms/:id")
  async deleteAttributeTerm(@Param("id") id: string) {
    return this.adminService.deleteAttributeTerm(id);
  }

  // Migrate all variants from "Option" and "PA Color" to "Color"
  @Post("variants/migrate-to-color")
  async migrateVariantsToColor(@Body() body?: { productId?: string }) {
    return this.adminService.migrateVariantsToColor(body?.productId);
  }

  // Update variant images from attribute terms
  @Post("variants/update-images")
  async updateVariantImages(@Body() body?: { productId?: string }) {
    return this.adminService.updateVariantImagesFromTerms(body?.productId);
  }

  // Migrate product images to media library
  @Post("products/migrate-images")
  async migrateProductImages() {
    return this.adminService.migrateProductImagesToMediaLibrary();
  }

  @Post("attributes/color/match-swatches")
  async matchColorSwatchImages() {
    return this.adminService.matchColorSwatchImages();
  }

  // Email Templates Management
  @Get("email-templates")
  async getEmailTemplates() {
    return this.adminService.getEmailTemplates();
  }

  @Get("email-templates/:id")
  async getEmailTemplate(@Param("id") id: string) {
    return this.adminService.getEmailTemplate(id);
  }

  @Put("email-templates/:id")
  async updateEmailTemplate(
    @Param("id") id: string,
    @Body() data: { subject?: string; body: string; variables?: string[] }
  ) {
    return this.adminService.updateEmailTemplate(id, data);
  }

  @Post("email-templates/:id/preview")
  async previewEmailTemplate(
    @Param("id") id: string,
    @Body() data: { variables?: Record<string, any> }
  ) {
    return this.adminService.previewEmailTemplate(id, data.variables || {});
  }


  // Trust Badges Management
  @Get("trust-badges")
  async getTrustBadges() {
    return this.adminService.getAllTrustBadges();
  }

  @Get("trust-badges/:id")
  async getTrustBadge(@Param("id") id: string) {
    return this.adminService.getTrustBadge(id);
  }

  @Post("trust-badges")
  async createTrustBadge(@Body() data: any) {
    return this.adminService.createTrustBadge(data);
  }

  @Put("trust-badges/:id")
  async updateTrustBadge(@Param("id") id: string, @Body() data: any) {
    return this.adminService.updateTrustBadge(id, data);
  }

  @Delete("trust-badges/:id")
  async deleteTrustBadge(@Param("id") id: string) {
    return this.adminService.deleteTrustBadge(id);
  }

  @Put("trust-badges/positions")
  async updateTrustBadgePositions(@Body() body: { updates: { id: string; position: number }[] }) {
    return this.adminService.updateTrustBadgePositions(body.updates);
  }

  // Flash Sales Management
  @Get("flash-sales")
  async getFlashSales() {
    return this.adminService.getAllFlashSales();
  }

  @Get("flash-sales/:id")
  async getFlashSale(@Param("id") id: string) {
    return this.adminService.getFlashSale(id);
  }

  @Post("flash-sales")
  async createFlashSale(@Body() data: any) {
    return this.adminService.createFlashSale(data);
  }

  @Put("flash-sales/:id")
  async updateFlashSale(@Param("id") id: string, @Body() data: any) {
    return this.adminService.updateFlashSale(id, data);
  }

  @Delete("flash-sales/:id")
  async deleteFlashSale(@Param("id") id: string) {
    return this.adminService.deleteFlashSale(id);
  }

  // Blog Posts Management
  @Get("blog-posts")
  async getBlogPosts(@Query() query: any) {
    return this.adminService.getAllBlogPosts(query);
  }

  @Get("blog-posts/:id")
  async getBlogPost(@Param("id") id: string) {
    return this.adminService.getBlogPost(id);
  }

  @Post("blog-posts")
  async createBlogPost(@Body() data: any) {
    return this.adminService.createBlogPost(data);
  }

  @Put("blog-posts/:id")
  async updateBlogPost(@Param("id") id: string, @Body() data: any) {
    return this.adminService.updateBlogPost(id, data);
  }

  @Delete("blog-posts/:id")
  async deleteBlogPost(@Param("id") id: string) {
    return this.adminService.deleteBlogPost(id);
  }

  // Reviews Management
  @Get("reviews")
  async getReviews(@Query() query: any) {
    return this.adminService.getAllReviews(query);
  }

  @Put("reviews/:id")
  async updateReview(@Param("id") id: string, @Body() data: any) {
    return this.adminService.updateReview(id, data);
  }

  @Delete("reviews/:id")
  async deleteReview(@Param("id") id: string) {
    return this.adminService.deleteReview(id);
  }

  // Settings Management
  @Get("settings")
  async getSettings(@Query("category") category?: string) {
    return this.adminService.getSettings(category);
  }

  @Get("settings/:key")
  async getSetting(@Param("key") key: string) {
    const value = await this.adminService.getSetting(key);
    return { key, value };
  }

  @Put("settings")
  async updateSettings(@Body() body: { settings: Array<{ key: string; value: string; category?: string }> }) {
    return this.adminService.updateSettings(body.settings);
  }

  @Put("settings/:key")
  async updateSetting(
    @Param("key") key: string,
    @Body() body: { value: string; category?: string }
  ) {
    return this.adminService.updateSetting(key, body.value, body.category || "general");
  }

  // Test Email
  @Post("settings/test-email")
  async testEmail(@Body() body: { email: string }) {
    if (!body.email || !body.email.includes("@")) {
      throw new Error("Valid email address is required");
    }
    return this.emailService.sendTestEmail(body.email);
  }

  // Discount Codes Management
  @Get("discount-codes")
  async getDiscountCodes() {
    return this.adminService.getAllDiscountCodes();
  }

  // Currency Rates Management
  @Get("currency-rates")
  async getCurrencyRates() {
    return this.adminService.getAllCurrencyRates();
  }

  // Banners Management
  @Get("banners")
  async getBanners() {
    return this.adminService.getAllBanners();
  }
}
