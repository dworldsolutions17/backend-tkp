import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.PROCESSING })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'Invalid shipping address', nullable: true })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  rejectionReason?: string | null;

  @ApiPropertyOptional({ example: 'TCS-123456789', nullable: true })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  trackingNumber?: string | null;

  @ApiPropertyOptional({ example: 'https://courier.example/track/TCS-123456789', nullable: true })
  @IsUrl()
  @IsOptional()
  trackingUrl?: string | null;

  @ApiPropertyOptional({ example: '2026-04-10', nullable: true })
  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string | null;

  @ApiPropertyOptional({ example: '2026-04-10T12:30:00.000Z', nullable: true })
  @IsDateString()
  @IsOptional()
  deliveredAt?: string | null;
}
