import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../database/module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { Otp, OtpSchema } from '../../schemas/otp.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from '../../email/email.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DashboardModule } from '../../admin/dashboard/dashboard.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }, 
      { name: Otp.name, schema: OtpSchema }
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    DashboardModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    EmailService,
    JwtStrategy
  ],
  exports: [
    AuthService,
    MongooseModule
  ],
})
export class AuthModule {}