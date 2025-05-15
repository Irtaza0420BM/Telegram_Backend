import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ 
  timestamps: true,
  autoIndex: true 
})
export class Category {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ 
    default: null,
    required: false 
  })
  description?: string;

  @Prop({ 
    type: Number, 
    required: true, 
    unique: true, // Add unique constraint
    index: true // Add indexing
  })
  orderRank: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] })
  questions: mongoose.Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ orderRank: 1 }, { unique: true });

CategorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Question = mongoose.model('Question');
    await Question.deleteMany({ category: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

CategorySchema.pre('save', async function(next) {
  try {
    const existingCategory = await (this.constructor as any).findOne({ 
      orderRank: this.orderRank,
      _id: { $ne: this._id }
    });

    if (existingCategory) {
      const error: any = new Error('Order rank must be unique');
      error.code = 11000; 
      return next(error);
    }
    next();
  } catch (error) {
    next(error);
  }
});

CategorySchema.post('save', function(error, doc, next) {
  if (error.code === 11000) {
    // Customize error for orderRank uniqueness
    if (error.message.includes('orderRank')) {
      error.message = 'A category with this order rank already exists';
    }
  }
  next(error);
});