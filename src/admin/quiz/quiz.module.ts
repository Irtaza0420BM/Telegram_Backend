import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { Category } from './entities/category.entity';
import { Tier } from './entities/tier.entity';
import { Question } from './entities/question.entity';
import { Translation } from './entities/translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Tier, Question, Translation]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}