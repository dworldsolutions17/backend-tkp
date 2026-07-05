import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1999.00 })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 14 })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ example: 'test, Karachi, 123123' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({ example: 1999.00 })
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty({ example: 'cash', required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ example: 'pending', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  shippingCost?: number;

  @ApiProperty({ example: 'Some notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
