import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ChangePasswordDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Customer ID must be an integer' })
  @Min(1, { message: 'Customer ID must be a positive number' })
  customerId: number;

  @ApiProperty({ example: 'currentPassword123' })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  @MinLength(6, { message: 'Current password must be at least 6 characters long' })
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}
