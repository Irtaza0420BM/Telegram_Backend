import { IsEmail, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['en', 'es', 'fr', 'de', 'ru', 'zh', 'ja'], { 
    message: 'Language must be one of: en, es, fr, de, ru, zh, ja' 
  })
  languagePreference?: string;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['Standard', 'Silver', 'Gold', 'Diamond'], { 
    message: 'Tier must be one of: Standard, Silver, Gold, Diamond' 
  })
  tier?: string;
}