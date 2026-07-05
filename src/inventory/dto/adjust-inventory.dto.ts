import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 'in', enum: ['in', 'out', 'adjustment', 'return', 'damaged'] })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Restocking', required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: 'PO-12345', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ example: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
