import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ example: 'Main Warehouse', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'SKU-12345', required: false })
  @IsString()
  @IsOptional()
  sku?: string;
}
