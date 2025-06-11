import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { EnableTfaDto } from './dto/enable-tfa.dto';
import { VerifyTfaDto } from './dto/verify-tfa.dto';
import { LoginWithTfaDto } from './dto/login-with-tfa.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ 
    summary: 'Admin login',
    description: 'Authenticates an admin user and returns access and refresh tokens or 2FA requirement'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful or 2FA required',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                twoFAEnabled: { type: 'boolean' }
              }
            }
          }
        },
        {
          type: 'object',
          properties: {
            requiresTfa: { type: 'boolean' },
            tempUserId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ 
    summary: 'Admin login with 2FA',
    description: 'Completes login process with 2FA verification'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful with 2FA',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            twoFAEnabled: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials or 2FA code' })
  @Post('login-with-tfa')
  loginWithTfa(@Body() dto: LoginWithTfaDto) {
    return this.authService.loginWithTfa(dto.email, dto.password, dto.tfaCode);
  }

  @ApiOperation({ 
    summary: 'Create new admin user',
    description: 'Creates a new administrator account in the system'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Admin user created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input or user already exists' })
  @Post('create')
  create(@Body() dto: CreateUserDto) {
    return this.authService.create(dto);
  }

  @ApiOperation({ 
    summary: 'Enable two-factor authentication',
    description: 'Enables 2FA for an admin user and returns setup information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'TFA setup information returned',
    schema: {
      type: 'object',
      properties: {
        qrCodeUrl: { type: 'string' },
        secret: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('enable-tfa')
  enableTfa(@Body() dto: EnableTfaDto) {
    return this.authService.enableTfa(dto);
  }

  @ApiOperation({ 
    summary: 'Verify two-factor authentication',
    description: 'Verifies the TFA setup by validating the provided code'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'TFA verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid TFA code' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('verify-tfa')
  verifyTfa(@Body() dto: VerifyTfaDto) {
    return this.authService.verifyTfa(dto);
  }

  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Uses a valid refresh token to generate a new access token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'New access token returned',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiOperation({ 
    summary: 'Get admin profile information',
    description: 'Returns the profile information of the authenticated admin user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User information returned',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        twoFAEnabled: { type: 'boolean' },
        lastLogin: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }
}
