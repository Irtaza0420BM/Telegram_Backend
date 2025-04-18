import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Admin extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  twoFASecurity: boolean;

  @Prop()
  twoFASecret?: string;
  
  @Prop({ default: false })
  twoFAVerified: boolean;
  
  @Prop()
  refreshToken?: string;
  
  @Prop()
  lastLogin?: Date;

}

export const AdminSchema = SchemaFactory.createForClass(Admin);