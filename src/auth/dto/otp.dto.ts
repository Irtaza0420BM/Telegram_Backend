import { IsEmail, IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class OtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @IsString()
  @IsOptional()
  telegramId?: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}