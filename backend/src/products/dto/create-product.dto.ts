import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from "class-validator";

export class CreateProductDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNumber()
  priceGhs: number;

  @IsOptional()
  @IsNumber()
  compareAtPriceGhs?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  badges?: string[];

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
