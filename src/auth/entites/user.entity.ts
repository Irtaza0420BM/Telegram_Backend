// src/auth/entities/user.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
// Remove TypeORM import
// import { OneToMany } from 'typeorm';
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

  @Prop()
  OTP: string;
  
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

 @Prop({default: Date.now})
  createdAt: Date;
  
  @Prop({default: Date.now})
  updatedAt: Date;

  @Prop()
  refreshToken?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'UserPayment' }] })
  payments: MongooseSchema.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);