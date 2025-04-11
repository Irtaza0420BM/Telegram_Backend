import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  /***
   * This is the first starting point endpoint.
   * I have made this to check if telegram id exists or not.
   * This endpoint is used to check if the user exists by telegramID. 
   * If the user exists, it returns a message indicating that the user already exists.
   * 
   */
  @Get('signin/:telegramId')
  async getdetailsByTelegramId(@Param('telegramId') telegramId: string) {
    return await this.authService.getdetailsByTelegramId(telegramId);
  }

//Create-user endpoint
  @Post('signup')
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

// Need to implement a generic all purppose endpoint to get update user details.
}