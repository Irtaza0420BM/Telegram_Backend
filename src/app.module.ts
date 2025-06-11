import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { DatabaseModule } from './database/module';
import { AuthModule } from './user/auth/auth.module';
import { AdminAuthModule } from './admin/auth/auth.module';
import config from './config';
import { HealthModule } from './common/health.module';
import { LoggerModule } from 'nestjs-pino';
import { QuizModule } from './admin/quiz/quiz.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
    DatabaseModule,
    AuthModule,
    AdminModule,
    AdminAuthModule,
    HealthModule,
    QuizModule,
    UserModule,
    EmailModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}