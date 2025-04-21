import { IsEmail, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Updated email address',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '123456789',
    description: 'Updated Telegram ID',
    required: false
  })
  @IsOptional()
  @IsString()
  telegramId?: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Updated username',
    required: false
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'en',
    description: 'User language preference',
    enum: ['en', 'es', 'fr', 'de', 'ru', 'zh', 'ja'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsEnum(['en', 'es', 'fr', 'de', 'ru', 'zh', 'ja'], { 
    message: 'Language must be one of: en, es, fr, de, ru, zh, ja' 
  })
  languagePreference?: string;

  @ApiProperty({
    example: 100,
    description: 'User points balance',
    required: false
  })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiProperty({
    example: '0x1234567890abcdef',
    description: 'User wallet address',
    required: false
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiProperty({
    example: 'Gold',
    description: 'User membership tier',
    enum: ['Standard', 'Silver', 'Gold', 'Diamond'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsEnum(['Standard', 'Silver', 'Gold', 'Diamond'], { 
    message: 'Tier must be one of: Standard, Silver, Gold, Diamond' 
  })
  tier?: string;
}