import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[\d\s\-\+\(\)]+$/, { message: 'Please provide a valid phone number' })
  @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
  phone: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString({ message: 'City must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'Address must not exceed 255 characters' })
  address?: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password: string;

}
