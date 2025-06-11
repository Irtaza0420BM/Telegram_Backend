import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';
import {AdminAuthModule} from './auth/auth.module'
import { QuizModule } from './quiz/quiz.module';
@Module({
  imports: [
    DashboardModule,
    AdminAuthModule,
    QuizModule,
  ],
  exports: [
    DashboardModule,
    AdminAuthModule,
    QuizModule,
  ]
})
export class AdminModule {} 