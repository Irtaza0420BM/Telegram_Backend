import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../database/module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entites/user.entity';
import { Otp, OtpSchema } from './entites/otp.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from 'src/common/email.service';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Otp.name, schema: OtpSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
  exports: [AuthService, 
    MongooseModule  
  ],
})
export class AuthModule {}