import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/module';
import config from './config';

@Module({
  imports: [
    // Load configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    // Core modules
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule {}