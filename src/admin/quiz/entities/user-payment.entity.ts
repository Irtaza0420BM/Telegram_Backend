import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose  from 'mongoose';

@Schema({ timestamps: true })
export class UserPayment {
  @Prop({ default: Date.now })
  paymentDate: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  amount: mongoose.Types.Decimal128;

  @Prop({ default: 'usd' })
  currency: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tier', required: true })
  tier: mongoose.Types.ObjectId;

  @Prop({ default: null })
  expiryDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserPaymentSchema = SchemaFactory.createForClass(UserPayment);
