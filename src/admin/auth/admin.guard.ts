import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Admin } from '../../schemas/admin.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !(user instanceof Admin)) {
      throw new UnauthorizedException('This route is restricted to admin users only');
    }

    return true;
  }
} 