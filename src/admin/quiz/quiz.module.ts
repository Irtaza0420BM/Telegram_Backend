import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { DatabaseModule } from 'src/database/module';
import { Category, CategorySchema } from './entities/category.entity';
import { Tier, TierSchema } from './entities/tier.entity';
import { Question, QuestionSchema } from './entities/question.entity';
import { Translation, TranslationSchema } from './entities/translation.entity';
import { HealthService } from 'src/common/health.service';
import { UserPayment, UserPaymentSchema } from './entities/user-payment.entity';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Tier.name, schema: TierSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Translation.name, schema: TranslationSchema },
      { name: UserPayment.name, schema: UserPaymentSchema}
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService, HealthService],
  exports: [
    QuizService,
    MongooseModule
  ],
})
export class QuizModule {}