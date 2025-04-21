import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './database/module';
import { AdminAuthModule } from './admin/auth/auth.module';
import config from './config';
import { HealthModule } from './common/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DatabaseModule,
    AuthModule,
    AdminModule,
    AdminAuthModule,
    HealthModule
    


  ],
})
export class AppModule {}