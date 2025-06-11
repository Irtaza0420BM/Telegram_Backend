import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { ScoreModule } from './score/score.module';

@Module({
  imports: [
    AuthModule,
    QuizModule,
    ScoreModule
  ],
  exports: [
    AuthModule,
    QuizModule,
    ScoreModule
  ]
})
export class UserModule {} 