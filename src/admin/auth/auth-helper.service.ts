import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { Admin } from '../admin.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from 'src/auth/entites/user.entity';

@Injectable()

export class AuthHelperService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(User.name) private readonly userModel: Model <User>,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<Admin | null> {
    return this.adminModel.findOne({ username }).exec();
  }
  
  async findById(id: string): Promise<Admin | null> {
    return this.adminModel.findById(id).exec();
  }

  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    const admin = await this.findByEmail(email);
    if (!admin) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return null;
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    return admin;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.validateAdmin(email, password);
    if (user) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<Admin> {
    const { email, password, username } = createUserDto;
    
    const existingAdmin = await this.adminModel.findOne({
      $or: [{ email }, { username }],
    }).exec();
    
    if (existingAdmin) {
      throw new ConflictException('Email or username already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new this.adminModel({
      email,
      username,
      password: hashedPassword,
      twoFASecurity: false,
      twoFAVerified: false,
    });
    
    return newAdmin.save();
  }

  async setupTwoFactorAuth(userId: string) {
    const secretData = await this.generateTwoFASecret(userId);
    
    const admin = await this.adminModel.findById(userId).exec();
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    
    admin.twoFASecret = secretData.secret;
    await admin.save();
    
    return {
      secret: secretData.secret,
      otpAuthUrl: secretData.otpAuthUrl,
      qrCodeDataURL: secretData.qrCodeDataURL,
    };
  }

  async verifyAndEnableTwoFactorAuth(userId: string, token: string): Promise<boolean> {
    const isValid = await this.verify2FAToken(userId, token);
    
    if (isValid) {
      const admin = await this.findById(userId);
      await this.enable2FA(userId, admin.twoFASecret);
    }
    
    return isValid;
  }

  async generateTwoFASecret(adminId: string): Promise<{ secret: string, otpAuthUrl: string, qrCodeDataURL: string }> {
    const admin = await this.adminModel.findById(adminId).exec();
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    
    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(admin.email, 'AdminDashboard', secret);
    
    const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);
    
    return {
      secret,
      otpAuthUrl,
      qrCodeDataURL,
    };
  }

  async enable2FA(adminId: string, secret: string): Promise<Admin> {
    const admin = await this.adminModel.findById(adminId).exec();
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    
    admin.twoFASecurity = true;
    admin.twoFASecret = secret;
    return admin.save();
  }

  async verify2FAToken(adminId: string, token: string): Promise<boolean> {
    const admin = await this.adminModel.findById(adminId).exec();
    if (!admin || !admin.twoFASecret) {
      throw new NotFoundException('Admin not found or 2FA not enabled');
    }
    
    const isValid = authenticator.verify({
      token,
      secret: admin.twoFASecret,
    });
    
    if (isValid) {
      admin.twoFAVerified = true;
      await admin.save();
    }
    
    return isValid;
  }

  async disable2FA(adminId: string): Promise<Admin> {
    const admin = await this.adminModel.findById(adminId).exec();
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    
    admin.twoFASecurity = false;
    admin.twoFASecret = null;
    admin.twoFAVerified = false;
    return admin.save();
  }
  
  async storeRefreshToken(adminId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.adminModel.findByIdAndUpdate(adminId, {
      refreshToken: hashedRefreshToken,
    }).exec();
  }
  
  async validateRefreshToken(adminId: string, refreshToken: string): Promise<boolean> {
    const admin = await this.adminModel.findById(adminId).exec();
    if (!admin || !admin.refreshToken) {
      return false;
    }
    
    return bcrypt.compare(refreshToken, admin.refreshToken);
  }
  
  async removeRefreshToken(adminId: string): Promise<void> {
    await this.adminModel.findByIdAndUpdate(adminId, {
      refreshToken: null,
    }).exec();
  }


  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
}