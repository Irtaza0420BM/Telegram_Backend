import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema()
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true , index: { expireAfterSeconds: 0 } })
  expiry: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
