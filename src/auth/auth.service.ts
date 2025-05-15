import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './entites/user.entity';
import { Otp, OtpDocument } from './entites/otp.entity'; 
import { EmailDto } from './dto/email.dto';
import { OtpDto } from './dto/otp.dto';
import { EmailService } from '../common/email.service'; 
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update_user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.emailService.sendEmail({
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

  async sendOtp(emailDto: EmailDto): Promise<{ message: string}> {
    const { email } = emailDto;
  
    const userExists = await this.checkUserExistsByEmail(email);
    if (userExists) {
      throw new ConflictException('Email already exists');
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); 

  
    await this.otpModel.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiry,
      },
      { upsert: true, new: true }
    );
  
    await this.sendOtpEmail(email, otp);
  
    return {
      message: 'OTP sent to email',
    };
  }

  
  
  async verifyOtp(otpDto: OtpDto): Promise<{ token: string; user: any }> {
    const { email, otp, telegramId, username } = otpDto;
  
    const existingOtp = await this.otpModel.findOne({ email }).exec();
    if (!existingOtp) {
      throw new UnauthorizedException('OTP not found');
    }

    if (new Date() > existingOtp.expiry) {
      await this.otpModel.deleteOne({ _id: existingOtp._id });
      throw new UnauthorizedException('OTP expired');
    }
  
    if (existingOtp.otp !== otp) {
      
      throw new UnauthorizedException('Invalid OTP');
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

    const userResponse = {
      id: user._id,
      email: user.email,
      telegramId: user.telegramId,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  
    return { token, user: userResponse };
  }
  
  async getTelegramIdByEmail(email: string): Promise<string> {
    const user = await this.getUserByEmail(email);
    return user.telegramId;
  }

  async getDetailsByTelegramId(telegramId: string): Promise<{ token: string; user: any }> {
    const user = await this.userModel.findOne({ telegramId }).exec();
    if (!user) {
      throw new NotFoundException('User with this Telegram ID not found');
    }
    
    const payload = { sub: user._id, email: user.email, telegramId: user.telegramId };
    const token = this.jwtService.sign(payload);

    const userResponse = {
      id: user._id,
      email: user.email,
      telegramId: user.telegramId,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return { token, user: userResponse };
  }


  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<any> {
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
    
    if (updateUserDto.telegramId) {
      throw new BadRequestException('Telegram ID cannot be updated through this endpoint');
    }
  
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.email) user.email = updateUserDto.email;
    
    user.updatedAt = new Date();
    await user.save();
    
    return {
      id: user._id,
      email: user.email,
      telegramId: user.telegramId,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async refreshToken(userId: string): Promise<{ token: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const payload = { sub: user._id, email: user.email, telegramId: user.telegramId };
    const token = this.jwtService.sign(payload);
    
    return { token };
  }

 

 
}