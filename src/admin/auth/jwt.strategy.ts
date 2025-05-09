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

    const admin = await this.authHelperService.findById(payload.sub);
    
    if (admin) {

      return admin;
    }
    
    const user = await this.authHelperService.findUserById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException();
    }
    
    return user;
  }

}