import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../../schemas/admin.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectModel('Admin') private adminModel: Model<Admin>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if the user is an admin
    const admin = await this.adminModel.findOne({ email: user.email });
    if (!admin) {
      throw new UnauthorizedException('Admin access required');
    }

    return true;
  }
} 