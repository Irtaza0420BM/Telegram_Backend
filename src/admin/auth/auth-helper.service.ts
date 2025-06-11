import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { Admin } from '../../schemas/admin.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../../schemas/user.schema';

@Injectable()
export class AuthHelperService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<Admin | null> {
    return this.adminModel.findById(id).exec();
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
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

  generate2FASecret(admin: Admin) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(admin.email, 'Your App Name', secret);

    return {
      secret,
      otpauthUrl
    };
  }

  async generateQRCode(otpauthUrl: string) {
    return qrcode.toDataURL(otpauthUrl);
  }

  verifyOTP(token: string, secret: string) {
    return authenticator.verify({
      token,
      secret,
    });
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

  async validateUser(email: string, password: string): Promise<Admin> {
    const admin = await this.validateAdmin(email, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return admin;
  }

  async setupTwoFactorAuth(userId: string): Promise<{ secret: string; qrCode: string }> {
    const admin = await this.findById(userId);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const { secret, otpauthUrl } = this.generate2FASecret(admin);
    const qrCode = await this.generateQRCode(otpauthUrl);

    // Save the secret
    admin.twoFASecret = secret;
    admin.twoFASecurity = true;
    await admin.save();

    return { secret, qrCode };
  }

  async verifyAndEnableTwoFactorAuth(userId: string, tfaCode: string): Promise<boolean> {
    const admin = await this.findById(userId);
    if (!admin || !admin.twoFASecret) {
      throw new NotFoundException('Admin not found or 2FA not set up');
    }

    const isValid = this.verifyOTP(tfaCode, admin.twoFASecret);
    if (isValid) {
      admin.twoFAVerified = true;
      await admin.save();
    }

    return isValid;
  }
}