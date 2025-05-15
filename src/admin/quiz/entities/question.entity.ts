import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  question_text: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true })
  correct_option_index: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true })
  category: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tier', required: true })
  tier: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  rank: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Translation' }] })
  translations: mongoose.Types.ObjectId[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

QuestionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Question = mongoose.model('Question');
    
    const highestRankedQuestion = await Question.findOne({
      category: this.category,
      tier: this.tier
    }).sort({ rank: -1 }).limit(1);
    
    this.rank = highestRankedQuestion ? highestRankedQuestion.rank + 1 : 1;
  }
  next();
});