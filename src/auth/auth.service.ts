import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './entites/user.entity';
import { Otp, OtpDocument } from './entites/otp.entity'; 
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update_user.dto';

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
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


  async sendOtp(emailDto: EmailDto): Promise<{ message: string }> {
    const { email } = emailDto;
  
    const userExists = await this.checkUserExistsByEmail(email);
    if (userExists) {
      return {
        message: 'Email already exists',
      };
    }
  
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); 
  
    await this.otpModel.create({
      email,
      otp,
      expiry,
    });
  
    await this.sendOtpEmail(email, otp);
  
    return {
      message: 'OTP sent to email',
    };
  }
  
  async verifyOtp(otpDto: OtpDto): Promise<{ token: string }> {
    const { email, otp, telegramId, username } = otpDto;
  
    const existingOtp = await this.otpModel.findOne({ email }).exec();
    if (!existingOtp) {
      throw new UnauthorizedException('OTP not found');
    }
  
        if (existingOtp.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
  
    
    if (new Date() > existingOtp.expiry) {
      await this.otpModel.deleteOne({ _id: existingOtp._id });
      throw new UnauthorizedException('OTP expired');
    }
  
    await this.otpModel.deleteOne({ _id: existingOtp._id });
  
    let user: UserDocument;
    const userExists = await this.checkUserExistsByEmail(email);
  
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
        username,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
    }
  
    const payload = { sub: user._id, email: user.email, telegramId: user.telegramId };
    const token = this.jwtService.sign(payload);
  
    return { token };
  }
  

  async getTelegramIdByEmail(email: string): Promise<string> {
    const user = await this.getUserByEmail(email);
    return user.telegramId;
  }

  async getdetailsByTelegramId(telegramId: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ telegramId }).exec();
    if (!user) {
      throw new NotFoundException('User with this Telegram ID not found');
    }
    return user;
  }


  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userModel.findOne({ 
        email: updateUserDto.email,
        _id: { $ne: userId } 
      }).exec();
      
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }
    
    if (updateUserDto.telegramId && updateUserDto.telegramId !== user.telegramId) {
      const telegramIdExists = await this.userModel.findOne({ 
        telegramId: updateUserDto.telegramId,
        _id: { $ne: userId } 
      }).exec();
      
      if (telegramIdExists) {
        throw new ConflictException('Telegram ID already in use');
      }
    }
  
    Object.assign(user, updateUserDto);
    user.updatedAt = new Date();
    
    return await user.save();
  }
}


