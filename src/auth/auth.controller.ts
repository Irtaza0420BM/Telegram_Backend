import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('check-email')
  async checkEmail(@Body() emailDto: EmailDto) {
    return this.authService.sendOtp(emailDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() otpDto: OtpDto) {
    return this.authService.verifyOtp(otpDto);
  }

  @Get('telegram/:email')
  async getTelegramIdByEmail(@Param('email') email: string) {
    const telegramId = await this.authService.getTelegramIdByEmail(email);
    return { telegramId };
  }

  @Get('email/:telegramId')
  async getEmailByTelegramId(@Param('telegramId') telegramId: string) {
    const email = await this.authService.getEmailByTelegramId(telegramId);
    return { email };
  }
}