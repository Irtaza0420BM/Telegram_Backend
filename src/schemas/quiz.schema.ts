import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Question extends Document {
  @Prop({ required: true })
  question_text: string;

  @Prop({ required: true, type: [String] })
  options: string[];

  @Prop({ required: true })
  correct_option_index: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  category: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tier', required: true })
  tier: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  rank: number;
}

@Schema()
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;
}

@Schema()
export class Tier extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  isPaid: boolean;
}

@Schema()
export class Translation extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question', required: true })
  question: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  languageCode: string;

  @Prop({ required: true })
  question_text: string;

  @Prop({ required: true, type: [String] })
  options: string[];
}

@Schema()
export class UserPayment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tier', required: true })
  tier: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop()
  expiryDate: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
export const CategorySchema = SchemaFactory.createForClass(Category);
export const TierSchema = SchemaFactory.createForClass(Tier);
export const TranslationSchema = SchemaFactory.createForClass(Translation);
export const UserPaymentSchema = SchemaFactory.createForClass(UserPayment); 