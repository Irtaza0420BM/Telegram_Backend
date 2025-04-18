import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { EnableTfaDto } from './dto/enable-tfa.dto';
import { VerifyTfaDto } from './dto/verify-tfa.dto';
import { AuthHelperService } from './auth-helper.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authHelperService: AuthHelperService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.authHelperService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { username: user.username, sub: user._id };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    await this.authHelperService.storeRefreshToken(user._id, refreshToken);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async create(createUserDto: CreateUserDto) {
    const admin = await this.authHelperService.createAdmin(createUserDto);
    
    return {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      message: 'Admin user created successfully',
    };
  }

  async enableTfa(enableTfaDto: EnableTfaDto) {
    return this.authHelperService.setupTwoFactorAuth(enableTfaDto.userId);
  }

  async verifyTfa(verifyTfaDto: VerifyTfaDto) {
    const { userId, tfaCode } = verifyTfaDto;
    const isValid = await this.authHelperService.verifyAndEnableTwoFactorAuth(userId, tfaCode);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }
    
    return {
      verified: true,
      message: 'Two-factor authentication has been enabled successfully',
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      const isValid = await this.authHelperService.validateRefreshToken(payload.sub, refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      const newPayload = { username: payload.username, sub: payload.sub };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
      
      await this.authHelperService.storeRefreshToken(payload.sub, newRefreshToken);
      
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}