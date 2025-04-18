import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthHelperService } from './auth-helper.service';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authHelperService: AuthHelperService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authHelperService.validateUser(email, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}