import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { Category, CategorySchema } from '../../schemas/category.schema';
import { Question, QuestionSchema } from '../../schemas/question.schema';
import { Translation, TranslationSchema } from '../../schemas/translation.schema';
import { Tier, TierSchema } from '../../schemas/tier.schema';
import { HealthService } from 'src/common/health.service';
import { UserPayment, UserPaymentSchema } from './entities/user-payment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Translation.name, schema: TranslationSchema },
      { name: Tier.name, schema: TierSchema },
      { name: UserPayment.name, schema: UserPaymentSchema }
    ])
  ],
  controllers: [QuizController],
  providers: [QuizService, HealthService],
  exports: [
    QuizService,
    MongooseModule
  ],
})
export class QuizModule {}