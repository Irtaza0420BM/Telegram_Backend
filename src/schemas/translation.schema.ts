import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
@Schema({ timestamps: true })
export class Translation  {
  @Prop({ required: true, length: 5 })
  languageCode: string;

  @Prop({ required: true })
  question_text: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true })
  question: mongoose.Types.ObjectId;
}

export const TranslationSchema = SchemaFactory.createForClass(Translation);

TranslationSchema.index({ question: 1, languageCode: 1 }, { unique: true });