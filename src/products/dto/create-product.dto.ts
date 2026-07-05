import { IsString, IsNumber, IsOptional, IsArray, IsNotEmpty, Min, MaxLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty()
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(255, { message: 'Product name must not exceed 255 characters' })
  name: string;

  @ApiProperty()
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Product description is required' })
  description: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Original price must be a valid number' })
  @Min(0, { message: 'Original price must be a positive number' })
  originalPrice?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Category ID must be a valid number' })
  @Min(1, { message: 'Please select a valid category' })
  categoryId: number;

  @ApiProperty({ default: 0 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Stock must be a valid number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Badge must be a string' })
  @MaxLength(50, { message: 'Badge must not exceed 50 characters' })
  badge?: string;

  @ApiProperty({ default: 'active' })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['active', 'inactive', 'discontinued'], { message: 'Status must be active, inactive, or discontinued' })
  status?: string;
}
