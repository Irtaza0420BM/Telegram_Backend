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
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  telegramId: string;

  @Prop()
  username: string;

  @Prop({ default: 'en' })
  languagePreference: string;

  @Prop({ default: 0 })
  points: number;

  @Prop()
  walletAddress: string;

  @Prop({ default: 'Standard', enum: ['Standard', 'Silver', 'Gold', 'Diamond'] })
  tier: string;

  @Prop({ type: [Object], default: [] })
  quizHistory: QuizHistory[];

  @Prop({ type: [Object], default: [] })
  dailyActivities: DailyActivity[];

  @Prop({ default: Date.now })
  lastActive: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);