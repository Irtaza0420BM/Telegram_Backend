import { IsEmail, IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to verify OTP'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Six-digit OTP code received via email'
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    example: '123456789',
    description: 'Optional Telegram ID for the user',
    required: false
  })
  @IsString()
  @IsOptional()
  telegramId?: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username for the user'
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}

