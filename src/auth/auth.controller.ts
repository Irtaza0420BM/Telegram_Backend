import { Controller, Post, Body, Get, Param, UseGuards, Patch, Req, HttpStatus, HttpCode, UnauthorizedException, Request } from '@nestjs/common';
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
  async getDetailsByTelegramId(@Param('telegramId') telegramId: string) {
    return await this.authService.getDetailsByTelegramId(telegramId);
  }

  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Returns the profile information for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })


 @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    return {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      twoFAEnabled: req.user.twoFASecurity,
      lastLogin: req.user.lastLogin
    };
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
  @Post('signup')
  async signUp(@Body() emailDto: EmailDto) {
    return this.authService.sendOtp(emailDto);
  }

  @ApiOperation({ 
    summary: 'Resume signup process',
    description: 'Resends OTP to continue an interrupted signup process'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP resent successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Email not found in pending signup process' 
  })
 
  
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
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.updateUser(req.user.sub, updateUserDto);
  }

  @ApiOperation({ 
    summary: 'Refresh authentication token',
    description: 'Generates a new JWT token for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiBearerAuth()
  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.sub);
  }

 
}