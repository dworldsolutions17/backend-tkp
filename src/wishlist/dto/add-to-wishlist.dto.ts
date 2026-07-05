import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsNumber()
  customerId: number;

  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  productId: number;
}
