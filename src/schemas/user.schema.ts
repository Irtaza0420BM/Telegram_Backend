import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

interface QuizHistory {
  quizId: MongooseSchema.Types.ObjectId;
  categoryId: MongooseSchema.Types.ObjectId;
  score: number;
  completedAt: Date;
}

interface DailyActivity {
  activityId: MongooseSchema.Types.ObjectId;
  completedAt: Date;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'en' })
  languagePreference: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ type: String, ref: 'Tier', default: 'Beginner' })
  tier: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  OTP?: string;

  @Prop({ default: Date.now })
  lastActive: Date;

  @Prop({ type: [{ 
    quizId: { type: MongooseSchema.Types.ObjectId, ref: 'Question' },
    categoryId: { type: MongooseSchema.Types.ObjectId, ref: 'Category' },
    score: Number,
    completedAt: { type: Date, default: Date.now }
  }], default: [] })
  quizHistory: Array<{
    quizId: MongooseSchema.Types.ObjectId;
    categoryId: MongooseSchema.Types.ObjectId;
    score: number;
    completedAt: Date;
  }>;

  @Prop({ type: [{ 
    activityId: { type: MongooseSchema.Types.ObjectId },
    completedAt: { type: Date, default: Date.now }
  }], default: [] })
  dailyActivities: Array<{
    activityId: MongooseSchema.Types.ObjectId;
    completedAt: Date;
  }>;

  @Prop({ unique: true, sparse: true })
  telegramId?: string;

  @Prop()
  walletAddress?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'UserPayment' }] })
  payments: MongooseSchema.Types.ObjectId[];

  // Timestamps will be automatically added by mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 