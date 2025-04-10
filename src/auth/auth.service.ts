import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './entites/user.entity';
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private otpStore: Map<string, { otp: string, expiry: Date }> = new Map();
  private transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async checkUserExistsByEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    return !!user;
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async sendOtp(emailDto: EmailDto): Promise<{ message: string }> {
    const { email } = emailDto;
    
    const userExists = await this.checkUserExistsByEmail(email);
    
    if (userExists) {
      const user = await this.getUserByEmail(email);
      return {
        message: 'User already exists',
      };
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    this.otpStore.set(email, { otp, expiry });
    
    await this.sendOtpEmail(email, otp);
    
    return {
      message: 'OTP sent to email',
    };
  }

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}. This code will expire in 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your OTP Code</h2>
        <p style="font-size: 16px;">Your OTP code is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
      </div>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  async verifyOtp(otpDto: OtpDto): Promise<{ token: string }> {
    const { email, otp, telegramId } = otpDto;
    
    const storedOtp = this.otpStore.get(email);
    
    if (!storedOtp || storedOtp.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    
    if (new Date() > storedOtp.expiry) {
      this.otpStore.delete(email);
      throw new UnauthorizedException('OTP expired');
    }
    
    const userExists = await this.checkUserExistsByEmail(email);
    
    let user: UserDocument;
    
    if (userExists) {
      user = await this.getUserByEmail(email);
      if (telegramId) {
        user.telegramId = telegramId;
        await user.save();
      }
    } else {
      user = new this.userModel({
        email,
        telegramId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await user.save();
    }
    
    this.otpStore.delete(email);
    
    const payload = { sub: user._id, email: user.email, telegramId: user.telegramId };
    const token = this.jwtService.sign(payload);
    
    return {
      token,
    };
  }

  async getTelegramIdByEmail(email: string): Promise<string> {
    const user = await this.getUserByEmail(email);
    return user.telegramId;
  }

  async getEmailByTelegramId(telegramId: string): Promise<string> {
    const user = await this.userModel.findOne({ telegramId }).exec();
    if (!user) {
      throw new NotFoundException('User with this Telegram ID not found');
    }
    return user.email;
  }
}