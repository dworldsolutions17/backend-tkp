import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class SendContactMessageDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(5)
  message: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
