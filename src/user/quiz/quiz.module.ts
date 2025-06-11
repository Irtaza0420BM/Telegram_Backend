import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { Category, CategorySchema } from '../../schemas/category.schema';
import { Question, QuestionSchema } from '../../schemas/question.schema';
import { Translation, TranslationSchema } from '../../schemas/translation.schema';
import { Tier, TierSchema } from '../../schemas/tier.schema';
import { UserPayment, UserPaymentSchema } from '../../schemas/user-payment.schema';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Tier.name, schema: TierSchema },
      { name: Translation.name, schema: TranslationSchema },
      { name: UserPayment.name, schema: UserPaymentSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService]
})
export class QuizModule {} 