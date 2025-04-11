import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
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

  async create(email: string, username: string, password: string): Promise<Admin> {
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
    });
    
    return newAdmin.save();
  }

  async validateAdmin(username: string, password: string): Promise<Admin | null> {
    const admin = await this.findByUsername(username);
    if (!admin) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return null;
    }
    
    return admin;
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

  async disable2FA(adminId: string): Promise<Admin> {
    const admin = await this.adminModel.findById(adminId).exec();
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    
    admin.twoFASecurity = false;
    admin.twoFASecret = null;
    return admin.save();
  }
}
