import { IsString, IsNumber, IsOptional, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiPropertyOptional({ description: 'Product ID (null for general testimonials)' })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customerName: string;

  @ApiPropertyOptional({ description: 'Customer location' })
  @IsOptional()
  @IsString()
  customerLocation?: string;

  @ApiProperty({ description: 'Review text' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Is this a general testimonial?', default: false })
  @IsOptional()
  @IsBoolean()
  isTestimonial?: boolean;
}
