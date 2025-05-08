import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthHelperService } from './auth-helper.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authHelperService: AuthHelperService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // First try to find an admin
    const admin = await this.authHelperService.findById(payload.sub);
    
    if (admin) {
      // If admin is found, return it
      return admin;
    }
    
    // If not admin, try to find a user
    const user = await this.authHelperService.findUserById(payload.sub);
    
    if (!user) {
      // If neither admin nor user is found, throw unauthorized
      throw new UnauthorizedException();
    }
    
    return user;
  }
}