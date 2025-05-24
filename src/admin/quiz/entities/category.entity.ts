import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop() description?: string;

  @Prop({ required: true, unique: true })
  orderRank: number;

  questions: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ orderRank: 1 }, { unique: true });
CategorySchema.index({ name: 1 }, { unique: true });

CategorySchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'category',
});

CategorySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const Question = this.model('Question');
    await Question.deleteMany({ category: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
