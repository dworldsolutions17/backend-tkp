import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'customer', required: false, enum: ['admin', 'customer'], description: 'Portal role for login routing' })
  @IsString({ message: 'Portal must be a string' })
  @IsIn(['admin', 'customer'], { message: 'Portal must be either admin or customer' })
  @IsOptional()
  portal?: 'admin' | 'customer';
}
