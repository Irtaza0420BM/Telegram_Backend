import { Controller, Post, Body, Get, Param, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';
import { JwtAuthGuard } from 'src/admin/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update_user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @ApiOperation({ 
    summary: 'Check if user exists by Telegram ID',
    description: 'This is the first starting point endpoint to check if a user exists by their Telegram ID. If the user exists, it returns user details.'
  })
  @ApiParam({
    name: 'telegramId',
    required: true,
    description: 'Telegram ID of the user to check',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User details retrieved successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @Get('signin/:telegramId')
  async getdetailsByTelegramId(@Param('telegramId') telegramId: string) {
    return await this.authService.getdetailsByTelegramId(telegramId);
  }

  @ApiOperation({ 
    summary: 'Sign up with email',
    description: 'Initiates the signup process by sending an OTP to the provided email address'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'OTP sent successfully to email' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid email address' 
  })
  @ApiParam({
    name: "email",
    required: true,
    description: "actual email of the user to send OTP",
    type: "string"
  })
  @Post('signup')
  async checkEmail(@Body() emailDto: EmailDto) {
    return this.authService.sendOtp(emailDto);
  }


  
  @ApiOperation({ 
    summary: 'Verify OTP',
    description: 'Verifies the OTP sent to user email and completes the registration/authentication process'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP verified successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired OTP' 
  })
  @Post('verify-otp')
  async verifyOtp(@Body() otpDto: OtpDto) {
    return this.authService.verifyOtp(otpDto);
  }




  @ApiOperation({ 
    summary: 'Get Telegram ID by email',
    description: 'Retrieves the Telegram ID associated with the given email address'
  })
  @ApiParam({
    name: 'email',
    required: true,
    description: 'Email address to look up',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Telegram ID retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        telegramId: {
          type: 'string',
          example: '123456789'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Email not registered' 
  })
  @Get('telegram/:email')
  async getTelegramIdByEmail(@Param('email') email: string) {
    const telegramId = await this.authService.getTelegramIdByEmail(email);
    return { telegramId };
  }




  
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Updates user information such as email, username, language preference, etc.'
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'ID of the user to update',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiBearerAuth()
  @Patch('users/:userId')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.updateUser(userId, updateUserDto);
  }
}