import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { CreateUserDto } from './dto/create-user.dto';
import { EnableTfaDto } from './dto/enable-tfa.dto';
import { VerifyTfaDto } from './dto/verify-tfa.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ 
    summary: 'Admin login',
    description: 'Authenticates an admin user and returns access and refresh tokens'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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
        created: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input or user already exists' 
  })
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
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
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
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Two-factor authentication enabled successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized or invalid TFA code' 
  })
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
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired refresh token' 
  })
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
}
