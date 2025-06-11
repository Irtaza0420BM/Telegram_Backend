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
    
    // Check if user has 2FA enabled and verified
    if (user.twoFASecurity && user.twoFAVerified) {
      // Return partial response indicating 2FA is required
      return {
        requiresTfa: true,
        tempUserId: user._id.toString(),
        message: 'Two-factor authentication required',
      };
    }
    
    const payload = { username: user.username, sub: user._id.toString() };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    await this.authHelperService.storeRefreshToken(user._id.toString(), refreshToken);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        twoFAEnabled: user.twoFASecurity && user.twoFAVerified,
      },
    };
  }

  async loginWithTfa(email: string, password: string, tfaCode: string) {
    const user = await this.authHelperService.validateUser(email, password);
    
    if (!user.twoFASecurity || !user.twoFAVerified) {
      throw new UnauthorizedException('Two-factor authentication is not enabled for this account');
    }
    
    // Verify TFA code
    const isValidTfa = this.authHelperService.verifyOTP(tfaCode, user.twoFASecret);
    if (!isValidTfa) {
      throw new UnauthorizedException('Invalid two-factor authentication code');
    }
    
    const payload = { username: user.username, sub: user._id.toString() };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    
    await this.authHelperService.storeRefreshToken(user._id.toString(), refreshToken);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        twoFAEnabled: true,
      },
    };
  }

  async create(createUserDto: CreateUserDto) {
    const admin = await this.authHelperService.createAdmin(createUserDto);
    
    return {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      message: 'Admin user created successfully',
    };
  }

  async enableTfa(enableTfaDto: EnableTfaDto) {
    const result = await this.authHelperService.setupTwoFactorAuth(enableTfaDto.userId);
    
    return {
      qrCodeUrl: result.qrCode,
      secret: result.secret,
    };
  }

  async verifyTfa(verifyTfaDto: VerifyTfaDto) {
    const { userId, tfaCode } = verifyTfaDto;
    const isValid = await this.authHelperService.verifyAndEnableTwoFactorAuth(userId, tfaCode);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }
    
    return {
      success: true,
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
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const admin = await this.authHelperService.findById(userId);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      twoFAEnabled: admin.twoFASecurity && admin.twoFAVerified,
      lastLogin: admin.lastLogin,
    };
  }
}

