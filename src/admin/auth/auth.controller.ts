import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { CreateUserDto } from './dto/create-user.dto';
import { EnableTfaDto } from './dto/enable-tfa.dto';
import { VerifyTfaDto } from './dto/verify-tfa.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * API for AUTH for Admin
 * Signup
 * login
 * enable-tfa
 * verify-tfa
 * refresh
 * profile
 */
@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Tokens returned' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Create new admin user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @Post('create')
  create(@Body() dto: CreateUserDto) {
    return this.authService.create(dto);
  }

  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 200, description: 'TFA setup information returned' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('enable-tfa')
  enableTfa(@Body() dto: EnableTfaDto) {
    return this.authService.enableTfa(dto);
  }

  @ApiOperation({ summary: 'Verify two-factor authentication' })
  @ApiResponse({ status: 200, description: 'TFA verified successfully' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('verify-tfa')
  verifyTfa(@Body() dto: VerifyTfaDto) {
    return this.authService.verifyTfa(dto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token returned' })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiOperation({ summary: 'Get admin profile information' })
  @ApiResponse({ status: 200, description: 'User information returned' })
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
}