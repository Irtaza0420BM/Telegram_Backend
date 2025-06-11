// Updated AuthService with safe user responses (no additional DTOs)
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../schemas/user.schema';
import { Otp } from '../../schemas/otp.schema';
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update_user.dto';
import { DashboardService } from '../../admin/dashboard/dashboard.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private readonly dashboardService: DashboardService
  ) {}

  private getSafeUserData(user: any) {
    return {
      id: user._id,
      email: user.email,
      telegramId: user.telegramId,
      username: user.username,
      languagePreference: user.languagePreference,
      points: user.points,
      walletAddress: user.walletAddress,
      tier: user.tier,
      quizHistory: user.quizHistory || [],
      dailyActivities: user.dailyActivities || [],
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getDetailsByTelegramId(telegramId: string) {
    const user = await this.userModel.findOne({ telegramId }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user: this.getSafeUserData(user)
    };
  }

  async sendOtp(emailDto: EmailDto) {
    const { email } = emailDto;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    await this.emailService.sendEmail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    });
    
    await this.otpModel.findOneAndUpdate(
      { email },
      { otp, expiry },
      { upsert: true, new: true }
    );

    return { message: 'OTP sent successfully' };
  }

  async verifyOTP(otpDto: OtpDto) {
    const { email, otp } = otpDto;
    const otpRecord = await this.otpModel.findOne({ email, otp }).exec();

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (otpRecord.expiry < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    let user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      user = await this.userModel.create({ email });
    }

    const payload = { 
      username: user.username, 
      sub: user._id
    };

    await this.otpModel.deleteOne({ email });

    // Update active users in dashboard
    this.dashboardService.updateActiveUser(user._id.toString(), {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      telegramId: user.telegramId
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: this.getSafeUserData(user)
    };
  }
  
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    await user.save();

    return this.getSafeUserData(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken);
      const user = await this.userModel.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = { username: user.username, sub: user._id };
      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
        user: this.getSafeUserData(user)
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.getSafeUserData(user);
  }
}