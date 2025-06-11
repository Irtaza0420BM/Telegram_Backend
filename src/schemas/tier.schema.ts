import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose  from 'mongoose';

@Schema({ timestamps: true })
export class Tier  {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ default: 1 })
  orderRank: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] })
  questions: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserPayment' }] })
  payments: mongoose.Types.ObjectId[];
}

export const TierSchema = SchemaFactory.createForClass(Tier);
