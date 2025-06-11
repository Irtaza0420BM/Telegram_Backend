import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: ['admin'] })
  roles: string[];

  // Authentication and security related fields
  @Prop()
  lastLogin: Date;

  @Prop()
  refreshToken: string;

  // Two-Factor Authentication fields
  @Prop()
  twoFASecret: string;

  @Prop({ default: false })
  twoFASecurity: boolean;

  @Prop({ default: false })
  twoFAVerified: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);